# System Requirements Specification (SRS) — COLLABO

> **Document Status:** Approved (Milestone M1 Specification)  
> **Target Audience:** Architects, Software Engineers, DevOps, and Compliance Evaluators

---

## 1. Functional Requirements (FR)

### Pillar A: COLLABO Rooms
* **FR-RM-01 (Voice Routing):** The system must route low-latency WebRTC voice streams to 250+ connected listeners per classroom session using an external Selective Forwarding Unit (SFU).
* **FR-RM-02 (Screen Share Video):** The system must support publishing one 1080p/720p screen-share video track per room at 15–30 FPS with dynamic bitrate adaptation.
* **FR-RM-03 (Speaking Queue):** The system must provide a real-time FIFO speaking queue. When an attendee invokes "Raise Hand", their entry must appear on the host's queue in < 50ms.
* **FR-RM-04 (Mode Switching):** The host must be able to switch dynamically between **Lecture Mode** (attendees restricted from unmuting) and **Interactive Mode** (attendees can unmute themselves upon queue grant) without reconnecting.
* **FR-RM-05 (Host Moderation):** The host must be able to mute any individual participant, mute all participants simultaneously, or remove abusive participants from the session.
* **FR-RM-06 (Automated Attendance):** The system must record participant entry and exit timestamps with second-level precision, storing records in PostgreSQL for institutional review.

### Pillar B: COLLABO Workspace (Whiteboard)
* **FR-WS-01 (Canvas Rendering):** The whiteboard engine must render vector paths, rectangles, circles, sticky notes, and text elements using React Konva at 60 FPS.
* **FR-WS-02 (Infinite Canvas Camera):** The canvas must support smooth panning (via spacebar+drag or middle mouse click) and zooming (10% to 500% scale via wheel/pinch) with normalized 2D coordinate transformation.
* **FR-WS-03 (Object Manipulation):** Users must be able to select, translate, multi-handle resize, and rotate elements using interactive bounding boxes.
* **FR-WS-04 (Local Undo/Redo):** The system must maintain an in-memory command stack supporting at least 30 levels of undo (`Ctrl+Z`) and redo (`Ctrl+Y`).
* **FR-WS-05 (SWR Cloud Persistence):** The whiteboard state must hydrate immediately from browser `localStorage` and synchronize changes to PostgreSQL via an 800ms debounced persistence pipeline.
* **FR-WS-06 (Asset Support):** The whiteboard must allow dragging and dropping PNG, JPEG, SVG image files, rendering them as moveable canvas image elements.

### Pillar C: COLLABO Intelligence (AI)
* **FR-AI-01 (Mind-Map Generation):** The system must accept structured lecture notes or prompts and return valid, non-overlapping canvas node hierarchies.
* **FR-AI-02 (Board-Aware Q&A):** The AI engine must accept natural language queries paired with serialized canvas element JSON, providing answers grounded in the visual diagram.
* **FR-AI-03 (Preview Mutation):** All AI-generated canvas additions must be placed on a non-destructive preview layer requiring explicit user confirmation before committing to the board.
* **FR-AI-04 (Provider Independence):** The AI orchestration layer must support interchangeable LLM backends (Gemini API, OpenAI, or local open-weights) via a unified interface.

---

## 2. Non-Functional Requirements (NFR)

### Performance & Latency Targets
* **NFR-PERF-01 (Audio Latency):** Mouth-to-ear audio latency must not exceed 150ms under typical broadband network conditions.
* **NFR-PERF-02 (Control Plane Latency):** Socket.IO signaling messages (hand raises, chat, mute events) must achieve roundtrip delivery in < 50ms.
* **NFR-PERF-03 (Canvas Frame Rate):** The whiteboard rendering loop must sustain 60 FPS during drawing, panning, and zooming for boards containing up to 1,000 active vector elements.
* **NFR-PERF-04 (Hydration Speed):** Initial board render from `localStorage` must complete in < 50ms upon navigation to `/board/[id]`.

### Scalability & Capacity
* **NFR-SCAL-01 (Room Audience Capacity):** A single classroom room must support at least 250 concurrent listening participants without degradation of the teacher's audio quality.
* **NFR-SCAL-02 (Database Connection Pooling):** Supabase/PostgreSQL connections must be managed via Supavisor / PgBouncer connection pooling to prevent exhaustion during simultaneous lecture dismissals.
* **NFR-SCAL-03 (Stateful Socket Scaling):** The Socket.IO control plane must be architected to support Redis Pub/Sub adapter scaling for horizontal multi-instance clustering when needed.

### Reliability & Resilience
* **NFR-REL-01 (Automatic Reconnection):** If an attendee loses internet connectivity, the client must automatically attempt exponential-backoff reconnection for up to 60 seconds without losing local whiteboard edits.
* **NFR-REL-02 (Zero Data Loss):** Canvas modifications made while offline must remain intact in `localStorage` and queue for persistence upon network restoration.
* **NFR-REL-03 (Crash Isolation):** A failure in the media plane (e.g. WebRTC reconnect) must not crash or reset the collaborative whiteboard or chat panel.

### Security & Privacy
* **NFR-SEC-01 (Row-Level Security):** All database tables storing institutional records, student grades, attendance, or private boards must enforce strict PostgreSQL Row-Level Security (RLS) policies.
* **NFR-SEC-02 (Input Sanitization):** All chat messages, board titles, and user display names must be sanitized to eliminate Cross-Site Scripting (XSS) risks.
* **NFR-SEC-03 (FERPA / Educational Privacy):** Student voice streams, transcripts, and attendance logs must not be shared with external third parties or used to train public machine learning models.

### Accessibility (a11y)
* **NFR-A11Y-01 (Keyboard Navigation):** All primary controls (tools, mute, raise hand, leave room, undo/redo) must be operable via standard keyboard shortcuts.
* **NFR-A11Y-02 (Color Contrast):** All UI components, badges, and status indicators must conform to WCAG 2.1 AA color contrast standards (minimum 4.5:1 for normal text).

