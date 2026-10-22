# System Architecture Specification — COLLABO

> **Document Status**: Architectural Design (Milestone 1)  
> **Important Distinction**: This document details the *future architectural blueprint* alongside the *currently implemented reality*. Sections detailing WebSockets, databases, and microservices describe planned engineering milestones, not current running code.

---

## 1. High-Level Architecture Overview

COLLABO is designed as a hybrid client-server distributed system that separates **stateless web requests** from **persistent stateful real-time synchronization**:

```
+-------------------------------------------------------------------------+
|                              CLIENT (Browser)                           |
|  +-------------------------------------------------------------------+  |
|  | Next.js App Router (React 19, TypeScript, Tailwind CSS v4)        |  |
|  | - Canvas Render Engine (React Konva / HTML5 Canvas 2D)            |  |
|  | - Local Canvas State (Undo/Redo Stack, Optimistic UI Updates)     |  |
|  | - Socket.IO Client (Cursor broadcast, Board diff transmitter)     |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
           +-------------------------+-------------------------+
           | (HTTPS / REST API)                                | (Persistent WSS / WebSockets)
           v                                                   v
+-------------------------------+             +-------------------------------+
|       NEXT.JS WEB SERVER      |             |   REAL-TIME SOCKET.IO SERVER  |
|     (Stateless / Edge / Vercel)|             |   (Stateful Node.js Process)  |
| - SSR & Static Asset Delivery |             | - Room Management (Join/Leave)|
| - Route Handlers (API / Auth) |             | - Ephemeral Cursor Broadcast  |
| - User Profile & Metadata Ops |             | - Canvas Operations Relaying  |
| - Supabase Server-Side SDK    |             | - Debounced Board State Sync  |
+---------------+---------------+             +---------------+---------------+
                |                                             |
                +----------------------+----------------------+
                                       |
                                       v
                        +-------------------------------+
                        |     PERSISTENCE & AUTH        |
                        |     (Supabase / PostgreSQL)   |
                        | - Users & Auth Sessions       |
                        | - Board Metadata & Permissions|
                        | - Board Object JSON Snapshots |
                        +-------------------------------+
```

---

## 2. Component Responsibilities (Target Design)

### A. Frontend Application (Next.js & React)
- **Role**: Presentation, user interaction, canvas rendering, and user experience.
- **Canvas Rendering**: Uses HTML5 Canvas / React Konva to efficiently render thousands of vector shapes, paths, sticky notes, and text elements at 60 FPS without DOM bloat.
- **Local Optimistic Updates**: Immediately applies user interactions locally (e.g., dragging a shape) before awaiting remote confirmation, ensuring instantaneous UI feedback.
- **Input Handling**: Translates mouse, touch, and pen events into normalized 2D coordinate objects regardless of screen size or zoom level.

### B. Real-Time Server (Node.js & Socket.IO)
- **Role**: Stateful, bi-directional, low-latency message broker.
- **Room Coordination**: Organizes connected clients by `boardId`. Only clients in room `X` receive events for board `X`.
- **Ephemeral Broadcasting**: Transmits high-frequency, non-persisted events such as live mouse cursor coordinates (`cursor:move`) at throttled intervals (e.g., 30-50ms).
- **Operation Serialization**: Maintains the single source of truth for the order in which canvas updates occur to prevent conflicting edits.
- **Snapshots & Debounced Writes**: Periodically persists dirty board states back to PostgreSQL so the database is not overwhelmed by continuous real-time traffic.

### C. Database & Authentication (PostgreSQL / Supabase)
- **Role**: Long-term durability, user identities, and relationship storage.
- **Entities**:
  - `users`: ID, email, display name, avatar, timestamps.
  - `boards`: ID, title, owner_id, permissions (public/private), created_at, updated_at.
  - `board_states`: board_id, canvas_data (structured JSON document of all elements), version_counter.
  - `board_collaborators`: board_id, user_id, role (viewer, editor, admin).

---

## 3. Why Real-Time Communication Requires a Dedicated Server

A common beginner question is: *"Why can't Next.js serverless functions handle our real-time collaboration directly?"*

Here is the engineering reality:
1. **Stateless vs. Stateful**: Standard web APIs (like Next.js API routes on Vercel) are serverless. They spin up, respond to an HTTP request, and immediately terminate. They do not maintain persistent, continuous TCP connections.
2. **WebSocket Keep-Alive**: Multi-user collaboration requires long-lived, continuous connections so messages can be pushed instantly to connected peers without polling.
3. **In-Memory Room State**: Broadcasting an event to "all users currently viewing Board A" requires the server to know who is connected *right now* in memory. Serverless lambdas share no common memory.
4. **Conclusion**: While Next.js serves the frontend application and standard REST endpoints, the real-time layer requires a persistent Node.js runtime process (hosted on a platform like Railway, Render, or a VPS).

---

## 4. Planned Deployment Strategy

| Layer | Target Host | Rationale |
| :--- | :--- | :--- |
| **Frontend & API** | **Vercel** | Native Next.js optimization, global CDN edge caching, automatic HTTPS. |
| **Real-time Server** | **Railway or Render** | Persistent container runtime supporting long-lived WebSocket connections. |
| **Database & Auth** | **Supabase (Managed PostgreSQL)** | Managed connection pooling, Row-Level Security (RLS), built-in auth. |

---

## 5. Current Implementation vs. Design Decisions

To ensure engineering honesty, here is the current status:

| Architectural Component | Status | Details |
| :--- | :--- | :--- |
| **Next.js 16 Base** | **Implemented** | Working App Router foundation with TypeScript and Tailwind CSS v4. |
| **Project Structure** | **Implemented** | Clear separation of `src/app`, `public`, and `docs/`. |
| **Git Hygiene & Config** | **Implemented** | Strict `.gitignore`, safe `.env.example`, npm lockfile tracked. |
| **Canvas Engine** | *Design Decision* | Evaluated React Konva vs. Fabric.js; React Konva selected for Step 4. |
| **Socket.IO Server** | *Design Decision* | Architecture planned for Step 7; no active server or socket package installed yet. |
| **Database Schema** | *Design Decision* | Relational schema planned for Step 6; no database connected yet. |
| **Authentication Flow** | *Design Decision* | Supabase Auth planned for Step 9; no auth code present. |
