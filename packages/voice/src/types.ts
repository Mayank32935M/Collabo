import {
  ClassroomMode,
  ParticipantRole,
  VideoGrant,
  VoiceRoomToken,
} from "@collabo/shared";

export interface GenerateTokenOptions {
  identity: string;
  name: string;
  roomName: string;
  role: ParticipantRole;
  mode: ClassroomMode;
  isGrantedSpeaker?: boolean;
  ttlSeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface VoiceTokenService {
  generateToken(options: GenerateTokenOptions): Promise<VoiceRoomToken>;
  getServerUrl(): string;
  isConfigured(): boolean;
}

export interface LiveKitTokenClaims {
  exp: number;
  nbf: number;
  iat: number;
  iss: string;
  sub: string;
  name?: string;
  video: VideoGrant;
  metadata?: string;
}

