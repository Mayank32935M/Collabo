import { VoiceRoomToken } from "@collabo/shared";
import { GenerateTokenOptions, VoiceTokenService } from "./types";
import { createLiveKitGrant } from "./permissions";

/**
 * Offline Mock Voice Token Service
 * Provides mock token generation for local development and integration tests
 * without requiring a deployed LiveKit SFU instance.
 */
export class MockVoiceTokenService implements VoiceTokenService {
  private readonly serverUrl: string;

  constructor(serverUrl: string = "wss://mock.livekit.collabo.internal") {
    this.serverUrl = serverUrl;
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  isConfigured(): boolean {
    return true;
  }

  async generateToken(options: GenerateTokenOptions): Promise<VoiceRoomToken> {
    const grant = createLiveKitGrant(
      options.role,
      options.mode,
      options.isGrantedSpeaker
    );

    const ttl = options.ttlSeconds ?? 14400; // 4 hours
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = nowSec + ttl;
    const expiresAt = new Date(expSec * 1000).toISOString();

    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    ).toString("base64url");

    const payload = Buffer.from(
      JSON.stringify({
        exp: expSec,
        nbf: nowSec - 5,
        iat: nowSec,
        iss: "mock-livekit-key",
        sub: options.identity,
        name: options.name,
        video: {
          ...grant,
          room: options.roomName,
        },
        metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
      })
    ).toString("base64url");

    const signature = Buffer.from("mock-offline-signature").toString("base64url");

    return {
      token: `${header}.${payload}.${signature}`,
      url: this.serverUrl,
      roomName: options.roomName,
      identity: options.identity,
      name: options.name,
      canPublish: grant.canPublish ?? false,
      expiresAt,
    };
  }
}

