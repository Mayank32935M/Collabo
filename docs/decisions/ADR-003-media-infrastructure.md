# ADR-003: Media Infrastructure & Voice Architecture

> **Status:** Approved  
> **Date:** October 31, 2026  
> **Deciders:** Lead Developer, Principal Architect  
> **Context Milestone:** M0.5 — Monorepo Strategy & Architecture Decisions

---

## 1. Context and Problem Statement

COLLABO requires high-quality, ultra-low-latency voice communication and high-definition screen sharing for virtual classrooms targeting up to **250+ participants**.

Crucial product constraints:
* **Voice-Only Classrooms:** There is **no requirement** for participant camera video feeds. This drastically reduces bandwidth and client CPU requirements.
* **Screen Sharing Required:** The host/teacher (or designated presenter) must be able to share their screen via a video media track.
* **Lecture Mode vs. Interactive Mode:**
  - In *Lecture Mode*, only the host (or granted speakers) broadcast audio; up to 250+ listeners receive audio.
  - In *Interactive Mode*, participants can request mic access, and multiple students can talk simultaneously.
* **No Raw Audio Streaming over WebSockets:** Streaming raw audio chunks over WebSocket TCP connections produces severe jitter, packet latency, and buffer delays incompatible with live conversation.

We need a dedicated media plane capable of routing real-time WebRTC audio and screen-share streams at scale without building an entire media server from scratch.

---

## 2. Decision Drivers

* **Scale to 250+ Participants:** Traditional peer-to-peer (P2P) WebRTC mesh networking fails beyond 4-6 users because each user must upload media to every other user ($O(N^2)$ network traffic).
* **SFU (Selective Forwarding Unit) Architecture:** An SFU receives one stream from the publisher and replicates it efficiently to all subscribers ($O(N)$ upload load on clients).
* **Developer Focus:** As a solo developer project, time must be spent on COLLABO's core classroom experience rather than C++ WebRTC transport kernels, ICE/STUN/TURN infrastructure, and audio jitter buffers.
* **Screen Sharing Bandwidth Adaptation:** Dynamic bitrate switching (simulcast/SVC) to ensure low-latency presentation even under varied network conditions.

---

## 3. Considered Options

* **Option A: Peer-to-Peer (P2P) WebRTC Mesh** (Client-to-client direct connections).
* **Option B: Custom Built Mediasoup / Janus SFU Server** (Authoring C++/Node.js media pipelines from scratch).
* **Option C (Selected): LiveKit (Managed Cloud or Open-Source Self-Hosted SFU).**
* **Option D: Agora / Twilio Video SDKs.**

---

## 4. Decision Outcome

**Chosen Option: Option C — LiveKit as External Media Infrastructure.**

COLLABO will use **LiveKit** as its external media infrastructure candidate:
* LiveKit is an open-source, production-proven WebRTC SFU built in Go.
* It provides first-class TypeScript client SDKs (`livekit-client`, `@livekit/components-react`).
* It supports both self-hosted Docker instances (for local development or private institutional clouds) and LiveKit Cloud (for turnkey managed scaling).
* Audio-first optimization: Participants publish audio tracks only; screen shares publish video tracks dynamically.

---

## 5. Architectural Separation

Media routing is strictly separated from classroom coordination:

```
+-----------------------------------------------------------+
|                      CLIENT BROWSER                       |
|   +-----------------------+     +---------------------+   |
|   | Socket.IO Control Hook|     | LiveKit Media Hook  |   |
|   | - Join classroom      |     | - Publish microphone|   |
|   | - Raise hand          |     | - Subscribe to audio|   |
|   | - Speaking queue grant|     | - Screen share track|   |
|   +-----------+-----------+     +----------+----------+   |
+---------------|----------------------------|--------------+
                |                            |
                v                            v
   +-------------------------+  +--------------------------+
   |   apps/realtime (Node)  |  |   LiveKit SFU Server     |
   | - Issues LiveKit Tokens |  | - Receives mic stream    |
   | - Enforces speaking mic |  | - Replicates audio to    |
   |   permission grants     |  |   250+ listening clients |
   +-------------------------+  +--------------------------+
```

### Permission Flow for Mic Access:
1. Student clicks **Raise Hand** on the client UI.
2. Socket.IO emits `classroom:raise_hand` to `apps/realtime`.
3. Teacher approves speaker: `apps/realtime` emits `classroom:grant_mic` to the student.
4. The student's client receives permission and enables their microphone track via LiveKit.
5. In Lecture Mode, unpermitted participants remain in receive-only audio mode.
