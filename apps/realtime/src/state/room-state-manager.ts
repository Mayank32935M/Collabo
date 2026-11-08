import {
  ActivePollState,
  ActiveScreenShareState,
  ClassroomMode,
  ControlParticipant,
  QAQuestion,
  RoomStateSnapshot,
  WaitingParticipant,
} from "@collabo/shared";

export interface RoomControlState {
  roomId: string;
  sessionId?: string;
  mode: ClassroomMode;
  hostSocketId?: string;
  coHostSocketIds: Set<string>;
  participants: Map<string, ControlParticipant>; // socketId -> participant
  waitingRoom: Map<string, WaitingParticipant>; // socketId -> waiting participant
  speakingQueue: string[]; // FIFO list of socketIds with raised hand
  activeSpeakerSocketIds: Set<string>;
  activePoll: ActivePollState | null;
  activeScreenShare: ActiveScreenShareState | null;
  questions: Map<string, QAQuestion>; // questionId -> QAQuestion
  requireWaitingRoom: boolean;
  disconnectTimers: Map<string, NodeJS.Timeout>; // profileId -> timer
}

export class RoomStateManager {
  private rooms = new Map<string, RoomControlState>();

  getOrCreateRoom(
    roomId: string,
    options?: {
      mode?: ClassroomMode;
      requireWaitingRoom?: boolean;
      sessionId?: string;
    }
  ): RoomControlState {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        sessionId: options?.sessionId,
        mode: options?.mode || "lecture",
        coHostSocketIds: new Set<string>(),
        participants: new Map<string, ControlParticipant>(),
        waitingRoom: new Map<string, WaitingParticipant>(),
        speakingQueue: [],
        activeSpeakerSocketIds: new Set<string>(),
        activePoll: null,
        activeScreenShare: null,
        questions: new Map<string, QAQuestion>(),
        requireWaitingRoom: options?.requireWaitingRoom ?? false,
        disconnectTimers: new Map<string, NodeJS.Timeout>(),
      };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  getRoom(roomId: string): RoomControlState | undefined {
    return this.rooms.get(roomId);
  }

  getSnapshot(roomId: string): RoomStateSnapshot | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const sortedQuestions = Array.from(room.questions.values()).sort(
      (a, b) =>
        b.upvoteCount - a.upvoteCount ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      roomId: room.roomId,
      sessionId: room.sessionId,
      mode: room.mode,
      hostSocketId: room.hostSocketId,
      coHostSocketIds: Array.from(room.coHostSocketIds),
      participants: Array.from(room.participants.values()),
      speakingQueue: [...room.speakingQueue],
      activeSpeakerSocketIds: Array.from(room.activeSpeakerSocketIds),
      activePoll: room.activePoll ? { ...room.activePoll } : null,
      activeScreenShare: room.activeScreenShare ? { ...room.activeScreenShare } : null,
      questions: sortedQuestions,
      requireWaitingRoom: room.requireWaitingRoom,
    };
  }

  addParticipant(roomId: string, participant: ControlParticipant): void {
    const room = this.getOrCreateRoom(roomId);

    // Cancel any active disconnect timer for this profile
    const existingTimer = room.disconnectTimers.get(participant.profileId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      room.disconnectTimers.delete(participant.profileId);
    }

    if (participant.role === "host") {
      room.hostSocketId = participant.socketId;
      participant.canSpeak = true;
      participant.isMuted = false;
      room.activeSpeakerSocketIds.add(participant.socketId);
    } else if (participant.role === "co-host") {
      room.coHostSocketIds.add(participant.socketId);
      participant.canSpeak = true;
      room.activeSpeakerSocketIds.add(participant.socketId);
    } else if (room.mode === "interactive") {
      participant.canSpeak = true;
    }

    room.participants.set(participant.socketId, participant);
  }

  removeParticipant(roomId: string, socketId: string): ControlParticipant | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const participant = room.participants.get(socketId);
    if (!participant) return null;

    room.participants.delete(socketId);
    room.coHostSocketIds.delete(socketId);
    room.activeSpeakerSocketIds.delete(socketId);
    room.speakingQueue = room.speakingQueue.filter((id) => id !== socketId);

    if (room.hostSocketId === socketId) {
      room.hostSocketId = undefined;
    }

    if (room.activeScreenShare?.socketId === socketId) {
      room.activeScreenShare = null;
    }

    if (room.participants.size === 0) {
      // Room empty, clean up
      this.rooms.delete(roomId);
    }

    return participant;
  }

  scheduleDisconnect(
    roomId: string,
    profileId: string,
    onGraceExpire: () => void
  ): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const timer = setTimeout(() => {
      room.disconnectTimers.delete(profileId);
      onGraceExpire();
    }, 30000); // 30-second disconnect buffer

    room.disconnectTimers.set(profileId, timer);
  }

  setMode(roomId: string, mode: ClassroomMode): void {
    const room = this.getOrCreateRoom(roomId);
    room.mode = mode;

    if (mode === "lecture") {
      // In lecture mode, revoke speak permissions for non-hosts
      for (const p of room.participants.values()) {
        if (p.role !== "host" && p.role !== "co-host") {
          p.canSpeak = room.activeSpeakerSocketIds.has(p.socketId);
          if (!p.canSpeak) p.isMuted = true;
        }
      }
    } else {
      // In interactive mode, all attendees can speak
      for (const p of room.participants.values()) {
        p.canSpeak = true;
      }
    }
  }

  raiseHand(roomId: string, socketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const participant = room.participants.get(socketId);
    if (!participant) return false;

    if (!room.speakingQueue.includes(socketId)) {
      room.speakingQueue.push(socketId);
      participant.isHandRaised = true;
      return true;
    }
    return false;
  }

  lowerHand(roomId: string, socketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const participant = room.participants.get(socketId);
    if (participant) {
      participant.isHandRaised = false;
    }

    const initialLen = room.speakingQueue.length;
    room.speakingQueue = room.speakingQueue.filter((id) => id !== socketId);
    return room.speakingQueue.length !== initialLen;
  }

  grantMic(roomId: string, targetSocketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const participant = room.participants.get(targetSocketId);
    if (!participant) return false;

    participant.canSpeak = true;
    participant.isMuted = false;
    participant.isHandRaised = false;
    room.activeSpeakerSocketIds.add(targetSocketId);
    room.speakingQueue = room.speakingQueue.filter((id) => id !== targetSocketId);
    return true;
  }

  revokeMic(roomId: string, targetSocketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const participant = room.participants.get(targetSocketId);
    if (!participant) return false;

    if (participant.role !== "host" && participant.role !== "co-host") {
      participant.canSpeak = false;
      participant.isMuted = true;
      room.activeSpeakerSocketIds.delete(targetSocketId);
      return true;
    }
    return false;
  }

  muteAll(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const p of room.participants.values()) {
      if (p.role !== "host" && p.role !== "co-host") {
        p.isMuted = true;
        if (room.mode === "lecture") {
          p.canSpeak = false;
          room.activeSpeakerSocketIds.delete(p.socketId);
        }
      }
    }
  }

  createPoll(roomId: string, question: string, options: string[]): ActivePollState {
    const room = this.getOrCreateRoom(roomId);
    const poll: ActivePollState = {
      id: `poll-${Math.random().toString(36).slice(2, 9)}`,
      question,
      options,
      votes: {},
      totalVotes: 0,
      results: new Array(options.length).fill(0),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    room.activePoll = poll;
    return poll;
  }

  votePoll(
    roomId: string,
    socketId: string,
    pollId: string,
    optionIndex: number
  ): ActivePollState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.activePoll || room.activePoll.id !== pollId || !room.activePoll.isActive) {
      return null;
    }

    const poll = room.activePoll;
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return null;
    }

    // If previously voted, decrement previous option count
    if (socketId in poll.votes) {
      const prevOption = poll.votes[socketId];
      poll.results[prevOption] = Math.max(0, poll.results[prevOption] - 1);
    } else {
      poll.totalVotes += 1;
    }

    poll.votes[socketId] = optionIndex;
    poll.results[optionIndex] += 1;
    return poll;
  }

  closePoll(roomId: string): ActivePollState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.activePoll) return null;

    room.activePoll.isActive = false;
    const poll = { ...room.activePoll };
    return poll;
  }

  // -------------------------------------------------------------
  // Screen Share Management
  // -------------------------------------------------------------

  startScreenShare(
    roomId: string,
    socketId: string,
    options?: { streamId?: string; hasAudio?: boolean }
  ): ActiveScreenShareState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const participant = room.participants.get(socketId);
    if (!participant) return null;

    const isHost = socketId === room.hostSocketId;
    const isCoHost = room.coHostSocketIds.has(socketId);
    const isSpeaker =
      participant.role === "speaker" || room.activeSpeakerSocketIds.has(socketId);
    const isInteractive = room.mode === "interactive";

    if (!isHost && !isCoHost && !isSpeaker && !isInteractive) {
      return null;
    }

    const screenShare: ActiveScreenShareState = {
      socketId,
      profileId: participant.profileId,
      name: participant.name,
      streamId: options?.streamId,
      hasAudio: options?.hasAudio ?? false,
      startedAt: new Date().toISOString(),
    };

    room.activeScreenShare = screenShare;
    return screenShare;
  }

  stopScreenShare(
    roomId: string,
    socketId: string
  ): ActiveScreenShareState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.activeScreenShare) return null;

    const isOwner = room.activeScreenShare.socketId === socketId;
    const isHost = socketId === room.hostSocketId;
    const isCoHost = room.coHostSocketIds.has(socketId);

    if (!isOwner && !isHost && !isCoHost) {
      return null;
    }

    const stopped = { ...room.activeScreenShare };
    room.activeScreenShare = null;
    return stopped;
  }

  getActiveScreenShare(roomId: string): ActiveScreenShareState | null {
    const room = this.rooms.get(roomId);
    return room?.activeScreenShare ? { ...room.activeScreenShare } : null;
  }

  // -------------------------------------------------------------
  // Q&A Thread Management
  // -------------------------------------------------------------

  addQuestion(
    roomId: string,
    socketId: string,
    questionText: string
  ): QAQuestion | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const participant = room.participants.get(socketId);
    if (!participant) return null;

    const trimmed = questionText?.trim();
    if (!trimmed || trimmed.length === 0) return null;

    const question: QAQuestion = {
      id: `q-${Math.random().toString(36).slice(2, 9)}`,
      roomId,
      authorProfileId: participant.profileId,
      authorName: participant.name,
      authorRole: participant.role,
      question: trimmed,
      upvotes: [],
      upvoteCount: 0,
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };

    room.questions.set(question.id, question);
    return question;
  }

  upvoteQuestion(
    roomId: string,
    profileId: string,
    questionId: string
  ): QAQuestion | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const question = room.questions.get(questionId);
    if (!question) return null;

    const hasUpvoted = question.upvotes.includes(profileId);
    if (hasUpvoted) {
      question.upvotes = question.upvotes.filter((id) => id !== profileId);
    } else {
      question.upvotes.push(profileId);
    }
    question.upvoteCount = question.upvotes.length;

    return { ...question };
  }

  markQuestionAnswered(
    roomId: string,
    socketId: string,
    questionId: string,
    isAnswered: boolean
  ): QAQuestion | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const participant = room.participants.get(socketId);
    if (!participant) return null;

    const isHost = socketId === room.hostSocketId;
    const isCoHost = room.coHostSocketIds.has(socketId);

    const question = room.questions.get(questionId);
    if (!question) return null;

    if (!isHost && !isCoHost && participant.profileId !== question.authorProfileId) {
      return null;
    }

    question.isAnswered = isAnswered;
    return { ...question };
  }

  getQuestions(roomId: string): QAQuestion[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.questions.values()).sort(
      (a, b) =>
        b.upvoteCount - a.upvoteCount ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const roomStateManager = new RoomStateManager();

