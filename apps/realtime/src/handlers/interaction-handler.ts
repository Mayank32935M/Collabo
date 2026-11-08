import { Server, Socket } from "socket.io";
import {
  ClientAnswerQuestionPayload,
  ClientAskQuestionPayload,
  ClientChatMessagePayload,
  ClientCursorMovePayload,
  ClientLaunchPollPayload,
  ClientScreenShareStartPayload,
  ClientScreenShareStopPayload,
  ClientUpvoteQuestionPayload,
  ClientVotePollPayload,
  ServerChatMessagePayload,
  ServerCursorUpdatePayload,
  ServerPollUpdatedPayload,
  ServerQuestionAddedPayload,
  ServerQuestionUpdatedPayload,
  ServerScreenShareStartedPayload,
  ServerScreenShareStoppedPayload,
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

  // 4. Screen Sharing
  socket.on("screen:start", (payload: ClientScreenShareStartPayload) => {
    const { roomId, streamId, hasAudio } = payload;
    const screenShare = roomStateManager.startScreenShare(roomId, socket.id, {
      streamId,
      hasAudio,
    });

    if (!screenShare) {
      socket.emit("error", {
        message: "Forbidden: You do not have permission to broadcast screen share.",
      });
      return;
    }

    const startPayload: ServerScreenShareStartedPayload = { screenShare };
    io.to(roomId).emit("screen:started", startPayload);
  });

  socket.on("screen:stop", (payload: ClientScreenShareStopPayload) => {
    const { roomId } = payload;
    const stopped = roomStateManager.stopScreenShare(roomId, socket.id);

    if (stopped) {
      const stopPayload: ServerScreenShareStoppedPayload = {
        socketId: stopped.socketId,
        profileId: stopped.profileId,
      };
      io.to(roomId).emit("screen:stopped", stopPayload);
    }
  });

  // 5. Q&A Threads & Upvoting
  socket.on("qa:ask", (payload: ClientAskQuestionPayload) => {
    const { roomId, question: questionText } = payload;
    const question = roomStateManager.addQuestion(roomId, socket.id, questionText);

    if (!question) {
      socket.emit("error", { message: "Invalid question submission." });
      return;
    }

    const addedPayload: ServerQuestionAddedPayload = { question };
    io.to(roomId).emit("qa:question_added", addedPayload);
  });

  socket.on("qa:upvote", (payload: ClientUpvoteQuestionPayload) => {
    const { roomId, questionId } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    const question = roomStateManager.upvoteQuestion(
      roomId,
      participant.profileId,
      questionId
    );

    if (question) {
      const updatedPayload: ServerQuestionUpdatedPayload = { question };
      io.to(roomId).emit("qa:question_updated", updatedPayload);
    }
  });

  socket.on("qa:answer", (payload: ClientAnswerQuestionPayload) => {
    const { roomId, questionId, isAnswered } = payload;
    const question = roomStateManager.markQuestionAnswered(
      roomId,
      socket.id,
      questionId,
      isAnswered
    );

    if (!question) {
      socket.emit("error", {
        message: "Forbidden: Only hosts or authors can update answer status.",
      });
      return;
    }

    const updatedPayload: ServerQuestionUpdatedPayload = { question };
    io.to(roomId).emit("qa:question_updated", updatedPayload);
  });
}

