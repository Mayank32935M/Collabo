import {
  ActivePollState,
  ClassroomMode,
  ControlParticipant,
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
}

export const roomStateManager = new RoomStateManager();

