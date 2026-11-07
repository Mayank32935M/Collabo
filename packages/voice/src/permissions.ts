import { ClassroomMode, ParticipantRole, VideoGrant } from "@collabo/shared";

/**
 * Resolves LiveKit VideoGrant permissions according to participant role,
 * classroom delivery mode, and individual speaking elevation status.
 *
 * Rules:
 * 1. Host and Co-host:
 *    - Full publishing rights: microphone, screen share, and audio.
 *    - Full subscription and data publishing rights.
 * 2. Interactive Mode:
 *    - All participants (including attendees) can publish microphone audio.
 * 3. Lecture Mode:
 *    - Host / Co-host / Dedicated speaker: can publish audio.
 *    - Ordinary attendee: Listen-only (canPublish: false, canPublishData: false).
 *    - Elevated attendee (isGrantedSpeaker = true): temporarily permitted to publish microphone.
 */
export function createLiveKitGrant(
  role: ParticipantRole,
  mode: ClassroomMode,
  isGrantedSpeaker: boolean = false
): VideoGrant {
  // Hosts and co-hosts always retain full broadcast authority
  if (role === "host" || role === "co-host") {
    return {
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canPublishSources: ["microphone", "screen_share", "screen_share_audio"],
    };
  }

  // Dedicated speaker, interactive classroom mode, or explicitly elevated attendee
  if (role === "speaker" || mode === "interactive" || isGrantedSpeaker) {
    return {
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canPublishSources: ["microphone"],
    };
  }

  // Lecture mode attendee: Listen-only receiver
  return {
    roomJoin: true,
    canPublish: false,
    canSubscribe: true,
    canPublishData: false,
    canPublishSources: [],
  };
}

