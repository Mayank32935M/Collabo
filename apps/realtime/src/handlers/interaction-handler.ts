import { Server, Socket } from "socket.io";
import {
  ClientChatMessagePayload,
  ClientCursorMovePayload,
  ClientLaunchPollPayload,
  ClientVotePollPayload,
  ServerChatMessagePayload,
  ServerCursorUpdatePayload,
  ServerPollUpdatedPayload,
} from "@collabo/shared";
import { roomStateManager } from "../state/room-state-manager";

export function registerInteractionHandlers(io: Server, socket: Socket): void {
  // 1. In-Classroom Chat
  socket.on("chat:message", (payload: ClientChatMessagePayload) => {
    const { roomId, body } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    if (!body || body.trim().length === 0) return;

    const messagePayload: ServerChatMessagePayload = {
      id: `msg-${Math.random().toString(36).slice(2, 9)}`,
      roomId,
      senderSocketId: socket.id,
      senderProfileId: participant.profileId,
      senderName: participant.name,
      senderRole: participant.role,
      body: body.trim(),
      timestamp: new Date().toISOString(),
    };

    io.to(roomId).emit("chat:message", messagePayload);
  });

  // 2. Live Polls
  socket.on("poll:launch", (payload: ClientLaunchPollPayload) => {
    const { roomId, question, options } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    if (socket.id !== room.hostSocketId && !room.coHostSocketIds.has(socket.id)) {
      socket.emit("error", { message: "Forbidden: Only hosts can launch polls." });
      return;
    }

    if (!question || !Array.isArray(options) || options.length < 2) {
      socket.emit("error", { message: "Poll requires a question and at least 2 options." });
      return;
    }

    const poll = roomStateManager.createPoll(roomId, question, options);
    const updatePayload: ServerPollUpdatedPayload = { poll };
    io.to(roomId).emit("poll:updated", updatePayload);
  });

  socket.on("poll:vote", (payload: ClientVotePollPayload) => {
    const { roomId, pollId, optionIndex } = payload;
    const poll = roomStateManager.votePoll(roomId, socket.id, pollId, optionIndex);
    if (poll) {
      const updatePayload: ServerPollUpdatedPayload = { poll };
      io.to(roomId).emit("poll:updated", updatePayload);
    }
  });

  socket.on("poll:close", ({ roomId }: { roomId: string }) => {
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    if (socket.id !== room.hostSocketId && !room.coHostSocketIds.has(socket.id)) {
      socket.emit("error", { message: "Forbidden: Only hosts can close polls." });
      return;
    }

    const poll = roomStateManager.closePoll(roomId);
    if (poll) {
      io.to(roomId).emit("poll:updated", { poll });
    }
  });

  // 3. Volatile Multiplayer Cursors
  socket.on("cursor:move", (payload: ClientCursorMovePayload) => {
    const { roomId, x, y } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    const cursorPayload: ServerCursorUpdatePayload = {
      socketId: socket.id,
      profileId: participant.profileId,
      name: participant.name,
      x,
      y,
    };

    // Volatile emit drops congested packets without buffer lag
    socket.to(roomId).volatile.emit("cursor:update", cursorPayload);
  });
}

