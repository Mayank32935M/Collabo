import { Server, Socket } from "socket.io";
import {
  ClientJoinRoomPayload,
  ClientWaitingRoomDecisionPayload,
  ControlParticipant,
  ServerUserJoinedPayload,
  ServerUserLeftPayload,
  WaitingParticipant,
} from "@collabo/shared";
import { roomStateManager } from "../state/room-state-manager";
import { getClassroomRepository } from "@collabo/database";

export function registerPresenceHandlers(io: Server, socket: Socket): void {
  const classroomRepo = getClassroomRepository();

  socket.on("room:join", async (payload: ClientJoinRoomPayload) => {
    const {
      roomId,
      sessionId,
      profileId,
      name,
      email = "",
      avatarUrl = null,
      systemRole = "student",
      role = "attendee",
    } = payload;

    const room = roomStateManager.getOrCreateRoom(roomId, { sessionId });

    // 1. Waiting Room Check
    if (room.requireWaitingRoom && role === "attendee" && !room.participants.has(socket.id)) {
      const applicant: WaitingParticipant = {
        socketId: socket.id,
        profileId,
        name,
        avatarUrl,
        requestedAt: new Date().toISOString(),
      };
      room.waitingRoom.set(socket.id, applicant);

      // Notify host and co-hosts
      if (room.hostSocketId) {
        io.to(room.hostSocketId).emit("waiting_room:user_waiting", { applicant });
      }
      for (const coHostId of room.coHostSocketIds) {
        io.to(coHostId).emit("waiting_room:user_waiting", { applicant });
      }

      socket.emit("waiting_room:enqueued", { message: "Please wait for the host to admit you." });
      return;
    }

    // 2. Add Participant to Room State
    const participant: ControlParticipant = {
      socketId: socket.id,
      profileId,
      name,
      email,
      avatarUrl,
      role,
      systemRole,
      isHandRaised: false,
      canSpeak: role === "host" || role === "co-host" || room.mode === "interactive",
      isMuted: role !== "host",
      joinedAt: new Date().toISOString(),
    };

    roomStateManager.addParticipant(roomId, participant);
    socket.join(roomId);

    // 3. Emit Full Snapshot to the Joining Client
    const snapshot = roomStateManager.getSnapshot(roomId);
    socket.emit("room:state", snapshot);

    // 4. Broadcast to other room peers
    const userJoinedPayload: ServerUserJoinedPayload = { participant };
    socket.to(roomId).emit("room:user_joined", userJoinedPayload);

    // 5. Asynchronously log attendance if session ID is attached
    if (sessionId) {
      classroomRepo.logParticipantJoin(sessionId, profileId, role).catch((err) => {
        console.warn(`[PresenceHandler] Attendance log failed for session ${sessionId}:`, err);
      });
    }

    console.log(`[Room Join] ${participant.name} (${participant.role}) joined #${roomId}`);
  });

  socket.on("waiting_room:decision", (payload: ClientWaitingRoomDecisionPayload) => {
    const { roomId, targetSocketId, admit } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    // Only host or co-host can make admission decisions
    if (socket.id !== room.hostSocketId && !room.coHostSocketIds.has(socket.id)) {
      socket.emit("error", { message: "Forbidden: Only hosts can admit participants." });
      return;
    }

    const applicant = room.waitingRoom.get(targetSocketId);
    if (!applicant) return;

    room.waitingRoom.delete(targetSocketId);

    if (admit) {
      const participant: ControlParticipant = {
        socketId: targetSocketId,
        profileId: applicant.profileId,
        name: applicant.name,
        email: "",
        avatarUrl: applicant.avatarUrl,
        role: "attendee",
        systemRole: "student",
        isHandRaised: false,
        canSpeak: room.mode === "interactive",
        isMuted: true,
        joinedAt: new Date().toISOString(),
      };

      roomStateManager.addParticipant(roomId, participant);
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.join(roomId);
        targetSocket.emit("room:state", roomStateManager.getSnapshot(roomId));
      }

      socket.to(roomId).emit("room:user_joined", { participant });
    } else {
      io.to(targetSocketId).emit("waiting_room:rejected", {
        message: "The host has declined your request to join.",
      });
    }
  });

  socket.on("room:leave", ({ roomId }: { roomId: string }) => {
    const participant = roomStateManager.removeParticipant(roomId, socket.id);
    if (participant) {
      socket.leave(roomId);
      const leftPayload: ServerUserLeftPayload = {
        socketId: socket.id,
        profileId: participant.profileId,
      };
      socket.to(roomId).emit("room:user_left", leftPayload);

      const room = roomStateManager.getRoom(roomId);
      if (room?.sessionId) {
        classroomRepo.logParticipantLeave(room.sessionId, participant.profileId).catch(() => {});
      }
    }
  });

  socket.on("disconnect", () => {
    // Find rooms socket was in
    for (const room of (roomStateManager as any).rooms.values()) {
      if (room.participants.has(socket.id)) {
        const participant = room.participants.get(socket.id);
        if (participant) {
          roomStateManager.scheduleDisconnect(room.roomId, participant.profileId, () => {
            roomStateManager.removeParticipant(room.roomId, socket.id);
            io.to(room.roomId).emit("room:user_left", {
              socketId: socket.id,
              profileId: participant.profileId,
            });
            if (room.sessionId) {
              classroomRepo.logParticipantLeave(room.sessionId, participant.profileId).catch(() => {});
            }
          });
        }
      }
    }
  });
}

