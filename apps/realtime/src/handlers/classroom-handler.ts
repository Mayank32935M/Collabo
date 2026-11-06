import { Server, Socket } from "socket.io";
import {
  ClientGrantMicPayload,
  ClientLowerHandPayload,
  ClientMuteAllPayload,
  ClientRaiseHandPayload,
  ClientRevokeMicPayload,
  ClientSetModePayload,
  ServerAllMutedPayload,
  ServerMicGrantedPayload,
  ServerMicRevokedPayload,
  ServerModeChangedPayload,
  ServerQueueUpdatedPayload,
} from "@collabo/shared";
import { roomStateManager } from "../state/room-state-manager";

export function registerClassroomHandlers(io: Server, socket: Socket): void {
  socket.on("classroom:set_mode", (payload: ClientSetModePayload) => {
    const { roomId, mode } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    // Verify host or co-host privileges
    if (socket.id !== room.hostSocketId && !room.coHostSocketIds.has(socket.id)) {
      socket.emit("error", { message: "Forbidden: Only hosts can change classroom mode." });
      return;
    }

    roomStateManager.setMode(roomId, mode);

    const modeChanged: ServerModeChangedPayload = {
      mode,
      bySocketId: socket.id,
    };
    io.to(roomId).emit("classroom:mode_changed", modeChanged);

    // Broadcast updated queue and participant states
    const queueUpdated: ServerQueueUpdatedPayload = {
      speakingQueue: [...room.speakingQueue],
      participants: Array.from(room.participants.values()),
    };
    io.to(roomId).emit("classroom:queue_updated", queueUpdated);
  });

  socket.on("classroom:raise_hand", (payload: ClientRaiseHandPayload) => {
    const { roomId } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    const changed = roomStateManager.raiseHand(roomId, socket.id);
    if (changed) {
      const queueUpdated: ServerQueueUpdatedPayload = {
        speakingQueue: [...room.speakingQueue],
        participants: Array.from(room.participants.values()),
      };
      io.to(roomId).emit("classroom:queue_updated", queueUpdated);
    }
  });

  socket.on("classroom:lower_hand", (payload: ClientLowerHandPayload) => {
    const { roomId, targetSocketId } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    // A user can lower their own hand; or a host/co-host can lower anyone's hand
    const socketToLower = targetSocketId || socket.id;
    const isSelf = socketToLower === socket.id;
    const isHost = socket.id === room.hostSocketId || room.coHostSocketIds.has(socket.id);

    if (!isSelf && !isHost) {
      socket.emit("error", { message: "Forbidden: Cannot lower another user's hand." });
      return;
    }

    const changed = roomStateManager.lowerHand(roomId, socketToLower);
    if (changed) {
      const queueUpdated: ServerQueueUpdatedPayload = {
        speakingQueue: [...room.speakingQueue],
        participants: Array.from(room.participants.values()),
      };
      io.to(roomId).emit("classroom:queue_updated", queueUpdated);
    }
  });

  socket.on("classroom:grant_mic", (payload: ClientGrantMicPayload) => {
    const { roomId, targetSocketId } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    if (socket.id !== room.hostSocketId && !room.coHostSocketIds.has(socket.id)) {
      socket.emit("error", { message: "Forbidden: Only hosts can grant speaking permission." });
      return;
    }

    const granted = roomStateManager.grantMic(roomId, targetSocketId);
    if (granted) {
      const micGranted: ServerMicGrantedPayload = { socketId: targetSocketId };
      io.to(targetSocketId).emit("classroom:mic_granted", micGranted);

      const queueUpdated: ServerQueueUpdatedPayload = {
        speakingQueue: [...room.speakingQueue],
        participants: Array.from(room.participants.values()),
      };
      io.to(roomId).emit("classroom:queue_updated", queueUpdated);
    }
  });

  socket.on("classroom:revoke_mic", (payload: ClientRevokeMicPayload) => {
    const { roomId, targetSocketId } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    if (socket.id !== room.hostSocketId && !room.coHostSocketIds.has(socket.id)) {
      socket.emit("error", { message: "Forbidden: Only hosts can revoke speaking permission." });
      return;
    }

    const revoked = roomStateManager.revokeMic(roomId, targetSocketId);
    if (revoked) {
      const micRevoked: ServerMicRevokedPayload = { socketId: targetSocketId };
      io.to(targetSocketId).emit("classroom:mic_revoked", micRevoked);

      const queueUpdated: ServerQueueUpdatedPayload = {
        speakingQueue: [...room.speakingQueue],
        participants: Array.from(room.participants.values()),
      };
      io.to(roomId).emit("classroom:queue_updated", queueUpdated);
    }
  });

  socket.on("classroom:mute_all", (payload: ClientMuteAllPayload) => {
    const { roomId } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    if (socket.id !== room.hostSocketId && !room.coHostSocketIds.has(socket.id)) {
      socket.emit("error", { message: "Forbidden: Only hosts can trigger mute all." });
      return;
    }

    roomStateManager.muteAll(roomId);

    const allMuted: ServerAllMutedPayload = { bySocketId: socket.id };
    io.to(roomId).emit("classroom:all_muted", allMuted);

    const queueUpdated: ServerQueueUpdatedPayload = {
      speakingQueue: [...room.speakingQueue],
      participants: Array.from(room.participants.values()),
    };
    io.to(roomId).emit("classroom:queue_updated", queueUpdated);
  });
}

