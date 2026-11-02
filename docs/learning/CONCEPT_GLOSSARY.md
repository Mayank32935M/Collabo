# Engineering Concept Glossary — COLLABO

> **Purpose:** A beginner-friendly, deeply detailed technical glossary designed to transition an undergraduate coder into a confident, professional software engineer. Every concept explains **what it is**, **why COLLABO uses it**, **how it works in our project**, and **what trade-offs it involves**.

---

## 1. WebRTC & Media Architecture

### WebRTC (Web Real-Time Communication)
* **What it is:** An open standard that enables web browsers to exchange real-time audio, video, and data directly with sub-second latency without browser plugins.
* **Why COLLABO needs it:** Virtual classrooms require live conversational voice with under 150ms delay. Traditional HTTP streaming (like HLS or DASH) introduces 3 to 10 seconds of delay, which makes real-time discussion impossible.
* **How it works:** WebSockets are used initially to exchange network connection information (SDP offers/answers and ICE candidates). Once connected, audio packets travel over encrypted UDP protocols (DTLS-SRTP).
* **Trade-off:** WebRTC is latency-prioritizing: if network packets drop, it skips them rather than re-requesting them (preventing audio lag, but occasionally causing momentary audio artifacts).

### SFU (Selective Forwarding Unit)
* **What it is:** A media routing server in WebRTC that receives media streams from publishers and selectively forwards them to subscribers without decoding or re-encoding the video/audio.
* **Why COLLABO needs it:** In a peer-to-peer (P2P) mesh, if 100 students join, every student would have to send their audio to 99 other students ($O(N^2)$ network traffic), immediately overwhelming laptops and home Wi-Fi. An SFU receives one stream from the teacher and replicates it to 250+ students ($O(N)$ load).
* **COLLABO Implementation:** We use **LiveKit** as our external SFU infrastructure.
* **Trade-off:** Requires a dedicated media server, but scales effortlessly to hundreds of participants per room.

---

## 2. Distributed Systems & State Synchronization

### Separation of Planes (Control vs. Media vs. Data)
* **What it is:** Decoupling a distributed system into three independent layers based on data frequency, latency sensitivity, and statefulness:
  1. **Control Plane (`apps/realtime`):** Stateful Socket.IO server handling hand raises, room presence, mutes, and chat.
  2. **Media Plane (LiveKit SFU):** High-bandwidth audio and screen sharing.
  3. **Data Plane (Supabase / PostgreSQL):** Durable storage for users, courses, and saved whiteboard snapshots.
* **Why COLLABO needs it:** If 250 students move their mice simultaneously, broadcasting those cursor events through your PostgreSQL database would crash the database within seconds. The Control Plane handles high-frequency events in memory, only persisting permanent data to PostgreSQL.

### SWR (Stale-While-Revalidate)
* **What it is:** A client caching pattern where the user interface immediately renders cached (possibly "stale") data from local storage while asynchronously fetching the authoritative "fresh" data from the server in the background.
* **How it works in COLLABO:** In `useCanvasHistory.ts`, the whiteboard loads elements from browser `localStorage` on frame 1 (instant 0ms render). It then issues an HTTP GET to `/api/boards/[id]` to merge any server updates.
* **Trade-off:** Eliminates loading spinners, but requires conflict-reconciliation logic if offline local edits diverge from the server.

### CRDT (Conflict-free Replicated Data Type)
* **What it is:** A mathematical data structure that can be replicated across multiple computers over a network, where concurrent edits merge automatically without requiring a central coordinator to lock records.
* **Why COLLABO plans it for Milestone M8:** Currently, our debounced HTTP PUT replaces the entire board array (Last-Write-Wins). CRDTs (like Yjs) ensure that if Student A draws a circle and Student B draws a line at the exact same millisecond, both shapes merge cleanly on both screens without collisions.

---

## 3. Graphics & Frontend Engineering

### Declarative Canvas vs. Immediate Canvas
* **Immediate Canvas (Native HTML5 2D Context):** You write procedural commands telling the browser how to paint pixels: `ctx.beginPath(); ctx.arc(...); ctx.stroke();`. If you want to move the circle, you must erase the canvas and repaint everything manually.
* **Declarative Canvas (React Konva):** You declare what shapes should exist as React components: `<Circle x={100} y={100} radius={50} />`. React Konva manages the canvas redraw loop, scene graph, and hit-detection automatically.
* **Why COLLABO uses React Konva:** It allows our canvas elements to be managed as a clean JavaScript data array (`elements: CanvasElement[]`). Moving a shape simply means updating its `{ x, y }` coordinates in React state.

### World Coordinates vs. Screen Coordinates
* **Screen Coordinates:** The pixel position relative to the user's monitor or browser window (e.g. mouse position $x=450, y=300$).
* **World Coordinates:** The permanent coordinate system of the infinite whiteboard canvas.
* **The Math:** If a user zooms in to $2\times$ scale (`scale = 2`) and pans the canvas right by 100px (`stageX = 100`), clicking at screen coordinate $450$ corresponds to world coordinate:
  $$x_{\text{world}} = \frac{450 - 100}{2} = 175$$
* **Why it matters:** Without this math, shapes would appear in completely different locations on different screen sizes or zoom levels.

---

## 4. Software Architecture & Git

### Monorepo & pnpm Workspaces
* **What it is:** Storing multiple related packages and applications in a single Git repository, managed by a tool (pnpm) that symlinks dependencies locally.
* **Why COLLABO uses it:** Our web app (`apps/web`) and real-time server (`apps/realtime`) can import shared TypeScript interfaces (`@collabo/shared`) directly without having to publish packages to npm.

### Atomic Commits
* **What it is:** A Git commit that contains a single, complete, logical unit of work that compiles and passes tests independently.
* **Why it matters:** If a commit contains half a feature and breaks the build, other developers who pull that commit cannot work, and automated bisecting to find bugs becomes impossible.

