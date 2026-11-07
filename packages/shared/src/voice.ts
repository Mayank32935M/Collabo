/**
 * COLLABO — Voice Infrastructure & WebRTC Media Plane Models
 * Defines data structures for LiveKit SFU access tokens, voice tracks,
 * media grants, and speaking telemetry.
 */

import { ClassroomMode, ParticipantRole } from "./classroom";

export type VoiceTrackSource =
  | "microphone"
  | "screen_share"
  | "screen_share_audio";

export type VoiceConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

/**
 * LiveKit WebRTC VideoGrant claims embedded in access JWT.
 */
export interface VideoGrant {
  roomJoin?: boolean;
  room?: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  canPublishSources?: VoiceTrackSource[];
  hidden?: boolean;
  recorder?: boolean;
}

/**
 * Formatted token payload returned to client browser for LiveKit SFU connection.
 */
export interface VoiceRoomToken {
  token: string;
  url: string;
  roomName: string;
  identity: string;
  name: string;
  canPublish: boolean;
  expiresAt: string;
}

/**
 * Real-time voice participant state (speaking status, mute, audio level).
 */
export interface VoiceParticipantState {
  identity: string;
  name: string;
  role: ParticipantRole;
  isSpeaking: boolean;
  isMuted: boolean;
  isScreenSharing: boolean;
  audioLevel: number; // Normalized 0.0 - 1.0
  canPublish: boolean;
}

export interface VoiceTokenRequest {
  sessionId: string;
  roomId: string;
  role?: ParticipantRole;
  mode?: ClassroomMode;
  isGrantedSpeaker?: boolean;
}

