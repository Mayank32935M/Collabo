import { createHmac } from "node:crypto";
import { VoiceRoomToken } from "@collabo/shared";
import {
  GenerateTokenOptions,
  LiveKitTokenClaims,
  VoiceTokenService,
} from "./types";
import { createLiveKitGrant } from "./permissions";
import { MockVoiceTokenService } from "./mock";

export interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
  serverUrl: string;
}

/**
 * Production LiveKit SFU Token Service.
 * Mints cryptographically signed HMAC-SHA256 JWT access tokens
 * compatible with LiveKit WebRTC SFU server specification.
 */
export class LiveKitVoiceTokenService implements VoiceTokenService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly serverUrl: string;

  constructor(config: LiveKitConfig) {
    if (!config.apiKey || !config.apiSecret || !config.serverUrl) {
      throw new Error(
        "LiveKitVoiceTokenService requires apiKey, apiSecret, and serverUrl"
      );
    }
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.serverUrl = config.serverUrl;
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

    const header = {
      alg: "HS256",
      typ: "JWT",
    };

    const claims: LiveKitTokenClaims = {
      exp: expSec,
      nbf: nowSec - 5, // 5s clock skew allowance
      iat: nowSec,
      iss: this.apiKey,
      sub: options.identity,
      name: options.name,
      video: {
        ...grant,
        room: options.roomName,
      },
      metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      "base64url"
    );
    const encodedPayload = Buffer.from(JSON.stringify(claims)).toString(
      "base64url"
    );

    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac("sha256", this.apiSecret)
      .update(message)
      .digest("base64url");

    const token = `${message}.${signature}`;

    return {
      token,
      url: this.serverUrl,
      roomName: options.roomName,
      identity: options.identity,
      name: options.name,
      canPublish: grant.canPublish ?? false,
      expiresAt,
    };
  }
}

/**
 * Returns an active VoiceTokenService instance.
 * If LiveKit credentials are configured in environment or options, returns LiveKitVoiceTokenService;
 * otherwise gracefully falls back to MockVoiceTokenService for offline/local development.
 */
export function getVoiceTokenService(
  options?: Partial<LiveKitConfig>
): VoiceTokenService {
  const apiKey = options?.apiKey || process.env.LIVEKIT_API_KEY;
  const apiSecret = options?.apiSecret || process.env.LIVEKIT_API_SECRET;
  const serverUrl = options?.serverUrl || process.env.LIVEKIT_URL;

  if (apiKey && apiSecret && serverUrl) {
    return new LiveKitVoiceTokenService({ apiKey, apiSecret, serverUrl });
  }

  return new MockVoiceTokenService(
    serverUrl || "wss://mock.livekit.collabo.internal"
  );
}

/**
 * Convenience helper to mint voice tokens directly.
 */
export async function generateVoiceToken(
  options: GenerateTokenOptions,
  serviceOptions?: Partial<LiveKitConfig>
): Promise<VoiceRoomToken> {
  const service = getVoiceTokenService(serviceOptions);
  return service.generateToken(options);
}

