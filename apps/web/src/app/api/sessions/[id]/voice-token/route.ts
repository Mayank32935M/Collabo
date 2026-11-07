import { NextResponse } from "next/server";
import { getMockSession } from "@collabo/auth";
import { getClassroomRepository } from "@collabo/database";
import {
  generateVoiceToken,
} from "@collabo/voice";
import {
  ClassroomMode,
  ParticipantRole,
  VoiceRoomToken,
  VoiceTokenRequest,
} from "@collabo/shared";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export interface VoiceTokenApiResponse {
  success: boolean;
  token?: string;
  url?: string;
  roomName?: string;
  canPublish?: boolean;
  expiresAt?: string;
  voiceToken?: VoiceRoomToken;
  error?: string;
}

/**
 * POST /api/sessions/[id]/voice-token
 *
 * Mints a cryptographically signed LiveKit WebRTC SFU access token
 * with VideoGrant claims mapped to the participant's role, the classroom's
 * delivery mode (lecture vs. interactive), and temporary mic grant status.
 */
export async function POST(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<VoiceTokenApiResponse>> {
  try {
    const authSession = getMockSession();
    if (!authSession || !authSession.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: sessionId } = await params;
    const repo = getClassroomRepository();
    const session = await repo.getSessionById(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Optional override body parameters from client control plane
    let body: Partial<VoiceTokenRequest> = {};
    try {
      const text = await request.text();
      if (text.trim().length > 0) {
        body = JSON.parse(text);
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Determine participant role
    const isHost = session.host_profile_id === authSession.user.id;
    let role: ParticipantRole = isHost ? "host" : "attendee";
    if (!isHost && body.role && ["co-host", "speaker", "attendee"].includes(body.role)) {
      role = body.role;
    }

    // Determine classroom mode (body override takes precedence if control plane changed it)
    const mode: ClassroomMode =
      body.mode || session.classroom?.default_mode || "lecture";

    const isGrantedSpeaker = Boolean(body.isGrantedSpeaker);
    const roomName = body.roomId || `session-${sessionId}`;
    const identity = authSession.user.id;
    const name =
      authSession.user.full_name ||
      authSession.user.email ||
      `User ${identity.slice(0, 6)}`;

    // Mint LiveKit SFU token
    const voiceToken = await generateVoiceToken({
      identity,
      name,
      roomName,
      role,
      mode,
      isGrantedSpeaker,
      ttlSeconds: 14400, // 4 hours
      metadata: {
        sessionId,
        role,
        mode,
        isGrantedSpeaker,
      },
    });

    return NextResponse.json({
      success: true,
      token: voiceToken.token,
      url: voiceToken.url,
      roomName: voiceToken.roomName,
      canPublish: voiceToken.canPublish,
      expiresAt: voiceToken.expiresAt,
      voiceToken,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error] POST /api/sessions/[id]/voice-token:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
