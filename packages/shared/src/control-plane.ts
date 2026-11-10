/**
 * COLLABO — Control Plane Protocol & Real-Time Event Contracts
 * Defines strongly-typed payload contracts for Socket.IO bidirectional communication.
 */

import { ClassroomMode, ParticipantRole } from "./classroom";
import { SystemRole } from "./institution";
import { CanvasElement } from "./canvas";

// -------------------------------------------------------------
// 1. Participant & Presence Models
// -------------------------------------------------------------

export interface ControlParticipant {
  socketId: string;
  profileId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: ParticipantRole;
  systemRole: SystemRole;
  isHandRaised: boolean;
  canSpeak: boolean;
  isMuted: boolean;
  joinedAt: string;
}

export interface WaitingParticipant {
  socketId: string;
  profileId: string;
  name: string;
  avatarUrl?: string | null;
  requestedAt: string;
}

export interface ActiveScreenShareState {
  socketId: string;
  profileId: string;
  name: string;
  streamId?: string;
  hasAudio?: boolean;
  startedAt: string;
}

export interface QAQuestion {
  id: string;
  roomId: string;
  authorProfileId: string;
  authorName: string;
  authorRole: ParticipantRole;
  question: string;
  upvotes: string[]; // profileIds who upvoted
  upvoteCount: number;
  isAnswered: boolean;
  createdAt: string;
}

export interface RoomStateSnapshot {
  roomId: string;
  sessionId?: string;
  mode: ClassroomMode;
  hostSocketId?: string;
  coHostSocketIds: string[];
  participants: ControlParticipant[];
  speakingQueue: string[]; // Ordered list of socketIds
  activeSpeakerSocketIds: string[];
  activePoll?: ActivePollState | null;
  activeScreenShare?: ActiveScreenShareState | null;
  questions?: QAQuestion[];
  requireWaitingRoom: boolean;
}

// -------------------------------------------------------------
// 2. Poll Models
// -------------------------------------------------------------

export interface ActivePollState {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // socketId -> optionIndex
  totalVotes: number;
  results: number[]; // Count per option
  isActive: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// 3. Client -> Server Event Payloads
// -------------------------------------------------------------

export interface ClientJoinRoomPayload {
  roomId: string;
  sessionId?: string;
  token?: string;
  profileId: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  systemRole?: SystemRole;
  role?: ParticipantRole;
}

export interface ClientSetModePayload {
  roomId: string;
  mode: ClassroomMode;
}

export interface ClientRaiseHandPayload {
  roomId: string;
}

export interface ClientLowerHandPayload {
  roomId: string;
  targetSocketId?: string; // If host lowering another's hand
}

export interface ClientGrantMicPayload {
  roomId: string;
  targetSocketId: string;
}

export interface ClientRevokeMicPayload {
  roomId: string;
  targetSocketId: string;
}

export interface ClientMuteAllPayload {
  roomId: string;
}

export interface ClientWaitingRoomDecisionPayload {
  roomId: string;
  targetSocketId: string;
  admit: boolean;
}

export interface ClientChatMessagePayload {
  roomId: string;
  body: string;
}

export interface ClientLaunchPollPayload {
  roomId: string;
  question: string;
  options: string[];
}

export interface ClientVotePollPayload {
  roomId: string;
  pollId: string;
  optionIndex: number;
}

export interface ClientCursorMovePayload {
  roomId: string;
  x: number;
  y: number;
}

export interface ClientScreenShareStartPayload {
  roomId: string;
  streamId?: string;
  hasAudio?: boolean;
}

export interface ClientScreenShareStopPayload {
  roomId: string;
}

export interface ClientAskQuestionPayload {
  roomId: string;
  question: string;
}

export interface ClientUpvoteQuestionPayload {
  roomId: string;
  questionId: string;
}

export interface ClientAnswerQuestionPayload {
  roomId: string;
  questionId: string;
  isAnswered: boolean;
}

// -------------------------------------------------------------
// 4. Server -> Client Event Payloads
// -------------------------------------------------------------

export interface ServerUserJoinedPayload {
  participant: ControlParticipant;
}

export interface ServerUserLeftPayload {
  socketId: string;
  profileId: string;
}

export interface ServerModeChangedPayload {
  mode: ClassroomMode;
  bySocketId: string;
}

export interface ServerQueueUpdatedPayload {
  speakingQueue: string[]; // socketIds in FIFO order
  participants: ControlParticipant[];
}

export interface ServerMicGrantedPayload {
  socketId: string;
}

export interface ServerMicRevokedPayload {
  socketId: string;
}

export interface ServerAllMutedPayload {
  bySocketId: string;
}

export interface ServerChatMessagePayload {
  id: string;
  roomId: string;
  senderSocketId: string;
  senderProfileId: string;
  senderName: string;
  senderRole: ParticipantRole;
  body: string;
  timestamp: string;
}

export interface ServerPollUpdatedPayload {
  poll: ActivePollState;
}

export interface ServerCursorUpdatePayload {
  socketId: string;
  profileId: string;
  name: string;
  x: number;
  y: number;
}

export interface ServerWaitingRoomNoticePayload {
  applicant: WaitingParticipant;
}

export interface ServerScreenShareStartedPayload {
  screenShare: ActiveScreenShareState;
}

export interface ServerScreenShareStoppedPayload {
  socketId: string;
  profileId: string;
}

export interface ServerQuestionAddedPayload {
  question: QAQuestion;
}

export interface ServerQuestionUpdatedPayload {
  question: QAQuestion;
}

// -------------------------------------------------------------
// 5. Collaborative Whiteboard Operations (Multiplayer Sync)
// -------------------------------------------------------------

export type BoardOpType = "create" | "update" | "delete" | "batch";

export interface ClientBoardOpPayload {
  roomId: string;
  op: BoardOpType;
  element?: CanvasElement;
  patch?: Partial<CanvasElement>;
  elementId?: string;
  elements?: CanvasElement[];
}

export interface ServerBoardOpPayload {
  roomId: string;
  op: BoardOpType;
  element?: CanvasElement;
  patch?: Partial<CanvasElement>;
  elementId?: string;
  elements?: CanvasElement[];
  senderProfileId: string;
  timestamp: string;
}

export interface ServerBoardSyncPayload {
  roomId: string;
  elements: CanvasElement[];
}

