# ADR-002: Real-Time Control Plane Architecture

> **Status:** Approved  
> **Date:** October 31, 2026  
> **Deciders:** Lead Developer, Principal Architect  
> **Context Milestone:** M0.5 — Monorepo Strategy & Architecture Decisions

---

## 1. Context and Problem Statement

COLLABO requires real-time coordination for interactive classrooms (targeting up to 250+ participants) and collaborative whiteboards.

Specific real-time requirements include:
* Room join, leave, and participant presence tracking.
* Speaking queue management and hand-raise events.
* Teacher lecture-mode controls (mute all, unmute participant, speaking grants).
* Ephemeral cursor broadcasting across whiteboard participants.
* Classroom chat, live polls, and Q&A interactions.

Next.js route handlers are serverless (stateless request-response lifecycle) and do not support long-lived TCP WebSocket connections, shared in-memory room state, or low-latency broadcasting across 250+ connected clients.

We must decide the technical architecture for the real-time control plane.

---

## 2. Decision Drivers

* **Stateful In-Memory Coordination:** The server must maintain the exact list of connected participants per room in memory.
* **Low Latency & High Frequency:** Ephemeral cursor packets and speaking-queue events need sub-50ms transmission times.
* **Room Isolation:** Socket messages for Room A must never leak to Room B.
* **Clear Plane Separation:** The control plane (signaling, presence, queues, chat) must be kept strictly decoupled from the high-bandwidth media plane (WebRTC audio and screen sharing) and the durable data plane (PostgreSQL).
* **Maintainability & Developer Understanding:** The technology must be standard, thoroughly documented, and easy for an undergraduate developer to debug and master.

---

## 3. Considered Options

* **Option A (Selected): Dedicated Node.js + Socket.IO Server** (`apps/realtime`).
* **Option B: Supabase Realtime (PostgreSQL WAL streaming / Broadcast channels).**
* **Option C: Serverless WebSockets via Third-Party Managed SaaS** (Pusher, Ably).
* **Option D: WebRTC DataChannels for all peer-to-peer control events.**

---

## 4. Decision Outcome

**Chosen Option: Option A — Dedicated Node.js + Socket.IO Server (`apps/realtime`).**

We will build a dedicated, stateful Node.js application using **TypeScript** and **Socket.IO**:

```
+-------------------------------------------------------------+
|                     CLIENT BROWSER                          |
|  +--------------------+             +--------------------+  |
|  | Socket.IO Client   |             | WebRTC / LiveKit   |  |
|  +---------+----------+             +---------+----------+  |
+------------|----------------------------------|-------------+
             | (WSS / TCP)                      | (UDP / RTP)
             v                                  v
+----------------------------+     +--------------------------+
|       CONTROL PLANE        |     |       MEDIA PLANE        |
|  (apps/realtime: Socket.IO)|     |    (External SFU Server) |
| - Room presence & roles    |     | - Multi-party audio      |
| - Speaking queue & mutes   |     | - Screen share stream    |
| - Ephemeral cursor broadcast|    +--------------------------+
| - Chat, Polls, Q&A events  |
+--------------+-------------+
               | (Debounced writes / Audit sync)
               v
+----------------------------+
|         DATA PLANE         |
|   (Supabase / PostgreSQL)  |
| - Users, courses, sessions |
| - Persistent board JSON    |
+----------------------------+
```

---

## 5. Pros and Cons of Chosen Option

### Advantages
* **Native Room Primitives:** Socket.IO has first-class `socket.join(roomId)` and `io.to(roomId).emit(...)` abstractions that map directly to COLLABO classrooms.
* **Predictable Hosting:** Runs as a persistent containerized Node.js process (on Railway, Render, or a VPS) with full access to logs, reconnect heuristics, and heartbeat pings.
* **No Database Overload:** Ephemeral cursor broadcasts (30-50ms) and hand-raise pulses stay in memory and do not trigger costly database roundtrips.
* **Strict Role Enforcement:** Handshake authentication validates user session and permissions before a socket is permitted into a room.

### Trade-offs & Mitigations
* **Requires a Persistent Server Host:** Cannot run on standard serverless tiers (like Vercel).
  * *Mitigation:* Container host platforms like Railway or Render offer low-cost or free-tier persistent containers ideal for development and prototyping.
* **Horizontal Scaling Across Multiple Servers:** If traffic exceeds a single Node.js instance, multiple Socket.IO servers require a Redis adapter (`@socket.io/redis-adapter`) for cross-node pub/sub.
  * *Mitigation:* A single well-tuned Node.js instance can handle thousands of concurrent WebSocket connections. Redis clustering will only be introduced when benchmarking warrants it.
