# Student Learning Log — COLLABO

> **Instructions**: Use this file as your personal engineering notebook. After completing each step with your mentor, fill out the corresponding milestone entry in your own words. Reflecting on *why* things work is the single fastest way to transition from a student coder to a professional software engineer.

---

## Milestone Entry Template

```markdown
### Milestone [Number]: [Milestone Title]
- **Date**: YYYY-MM-DD

#### 1. Concepts Learned
- [Concept 1]: [Brief summary in your own words]
- [Concept 2]: [Brief summary in your own words]

#### 2. Files Changed & Why
- `[filepath]`: [Purpose of file and reason for changes]

#### 3. Problems Encountered & Solutions
- **Problem**: [What went wrong, error message, or confusion]
- **Solution**: [How we investigated and fixed it]

#### 4. Commands Learned
- `[command]`: [What it does and when to use it]

#### 5. Questions to Revisit Later
- [ ] [Topic or question you want to explore more deeply]

#### 6. What I Can Now Explain Independently
- [Concept or architectural decision you can now explain to an interviewer or teammate]
```

---

## Milestone Entries

### Milestone 1: Project Foundation, Git Hygiene & Core Architecture
- **Date**: *(Fill in today's date)*

#### 1. Concepts Learned
- 

#### 2. Files Changed & Why
- 

#### 3. Problems Encountered & Solutions
- 

#### 4. Commands Learned
- 

#### 5. Questions to Revisit Later
- [ ] 

#### 6. What I Can Now Explain Independently
- 

---

### Milestone 2: Next.js App Router Structure & UI Design System
- **Date**: *(Fill in today's date)*

#### 1. Concepts Learned
- 

#### 2. Files Changed & Why
- 

#### 3. Problems Encountered & Solutions
- 

#### 4. Commands Learned
- 

#### 5. Questions to Revisit Later
- [ ] 

#### 6. What I Can Now Explain Independently
- 

---

### Milestone 3: React State & Interactive Canvas Toolbars
- **Date**: *(Fill in today's date)*

#### 1. Concepts Learned
- 

#### 2. Files Changed & Why
- 

#### 3. Problems Encountered & Solutions
- 

#### 4. Commands Learned
- 

#### 5. Questions to Revisit Later
- [ ] 

#### 6. What I Can Now Explain Independently
- 

---

### Milestone 4: Single-User Canvas with React Konva
- **Date**: *(Fill in today's date)*

#### 1. Concepts Learned
- 

#### 2. Files Changed & Why
- 

#### 3. Problems Encountered & Solutions
- 

#### 4. Commands Learned
- 

#### 5. Questions to Revisit Later
- [ ] 

#### 6. What I Can Now Explain Independently
- 

---

### Milestone 5: Canvas Object Manipulation, Undo/Redo & Local Persistence
- **Date**: *(Fill in today's date)*

#### 1. Concepts Learned
- 

#### 2. Files Changed & Why
- 

#### 3. Problems Encountered & Solutions
- 

#### 4. Commands Learned
- 

#### 5. Questions to Revisit Later
- [ ] 

#### 6. What I Can Now Explain Independently
- 

---

### Milestone 6: Backend API & PostgreSQL Database Persistence
- **Date**: *(Fill in today's date)*

#### 1. Concepts Learned
- **Relational vs. Document Storage for Whiteboards**: Why storing full element snapshots in a `JSONB` column on `boards` allows atomic document saves and ultra-fast room hydration, while normalized `canvas_elements` tables allow fine-grained indexing and element-level audit trails.
- **Next.js 16 Route Handlers**: How to write RESTful `GET`, `POST`, and `PUT` handlers using standard Web `Request`/`Response` and `Promise<{ id: string }>` params.
- **SQL DDL & Automation Triggers**: Creating tables with UUID primary keys, indexes on foreign keys and room identifiers, and PostgreSQL triggers to auto-update `updated_at` timestamps.
- **Graceful Fallbacks & Offline-First Strategy**: Why applications must not crash when remote credentials are missing during local development or build time, and how Stale-While-Revalidate caching works between `localStorage` and remote databases.
- **Debounced HTTP Synchronization**: Why sending an HTTP request on every single mousemove or pixel draw will overload servers, and how debouncing commits (e.g. 800ms after user pauses) preserves bandwidth while maintaining data durability.

#### 2. Files Changed & Why
- `supabase/migrations/20261030000001_create_boards_table.sql`: Production PostgreSQL DDL migration defining `boards`, `profiles`, and `canvas_elements` tables with triggers and RLS policies.
- `docs/schema.sql`: Reference schema file for easy architectural review.
- `src/types/database.ts`: TypeScript contracts for database rows, API requests, and responses.
- `src/lib/supabase.ts`: Supabase client factory with environment detection and in-memory development fallback.
- `src/app/api/boards/[id]/route.ts`: Next.js 16 dynamic route handlers for fetching (`GET`) and upserting (`PUT`) whiteboard room documents.
- `src/app/api/boards/route.ts`: API route handler for creating (`POST`) new board rooms.
- `src/hooks/useCanvasHistory.ts`: Upgraded with Stale-While-Revalidate hydration and debounced cloud auto-save.
- `src/components/board/CanvasStateHUD.tsx`: Added live database layer indicator and sync status badges.
- `src/components/board/BoardWorkspace.tsx`: Passed sync status and timestamps into the HUD.
- `.env.example`: Documented Supabase configuration steps.
- `docs/IMPLEMENTATION_PLAN.md` & `src/app/page.tsx`: Updated project milestone tracking to Step 6.

#### 3. Problems Encountered & Solutions
- 

#### 4. Commands Learned
- `npm i @supabase/supabase-js`: Installed the official Supabase JavaScript/TypeScript client library.

#### 5. Questions to Revisit Later
- [ ] 

#### 6. What I Can Now Explain Independently
- 

### Milestone M2: Application Modularization & Shared Foundations
- **Status**: Completed
- **Date**: 2026-11-03

#### 1. Core Concepts Learned
- **Package Modularization & Separation of Concerns**: Extracting domain infrastructure (`@collabo/database`) and canvas primitives (`@collabo/whiteboard`) away from Next.js presentation components (`@collabo/web`). This allows the database adapters and canvas math to be tested in isolation, shared across apps (like background workers or realtime servers), and versioned independently.
- **The Storage Adapter Pattern**: Using the Gang of Four Adapter/Strategy pattern to decouple application route handlers from concrete persistence implementations. By defining `BoardStorageAdapter`, route handlers no longer care whether records live in Supabase PostgreSQL or an in-memory development fallback.
- **Declarative 2D Canvas Coordinate Binding**: Understanding how React Konva translates declarative state to the HTML5 canvas scenegraph. In freehand pen strokes, points are defined relative to the node origin `(x, y)`. Omitting `x` and `y` props on `<Line>` caused Konva to reset node offsets to `(0, 0)` upon re-render, creating the notorious "snap-back" bug. Binding `x={el.x ?? 0}` and `y={el.y ?? 0}` preserves dragged positions.

#### 2. Files Changed & Why
- `packages/shared/src/canvas.ts`: Added optional `x` and `y` coordinates to `PenElement` to support canvas dragging and transformations.
- `packages/database/package.json` & `tsconfig.json`: Initialized the `@collabo/database` workspace package.
- `packages/database/src/client.ts`: Supabase client initialization, environment variable validation, and connection detection.
- `packages/database/src/memory-store.ts`: In-memory development fallback store for zero-config offline runs.
- `packages/database/src/adapter.ts`: Defined `BoardStorageAdapter` interface along with `SupabaseBoardAdapter`, `MemoryBoardAdapter`, and the resilience-focused `HybridBoardAdapter`.
- `packages/database/src/index.ts`: Public API exports for `@collabo/database`.
- `packages/whiteboard/package.json` & `tsconfig.json`: Initialized the `@collabo/whiteboard` workspace package.
- `packages/whiteboard/src/elements.ts`: Factory functions (`createPenElement`, `createRectElement`, etc.) and element cloning utilities.
- `packages/whiteboard/src/history.ts`: Pure `HistoryManager` class implementing the Command pattern for undo/redo state stacks independent of React hooks.
- `packages/whiteboard/src/index.ts`: Public API exports for `@collabo/whiteboard`.
- `apps/web/package.json` & `tsconfig.json`: Linked `@collabo/database` and `@collabo/whiteboard` as workspace dependencies.
- `apps/web/src/types/canvas.ts` & `database.ts`: Re-exported from `@collabo/shared` for seamless backward compatibility.
- `apps/web/src/components/board/CanvasStage.tsx`: Fixed the Pen element drag bug by binding `x`, `y`, and `rotation` to `<Line>` and adding pen transform support.
- `apps/web/src/app/api/boards/[id]/route.ts` & `route.ts`: Refactored to delegate persistence to `getBoardStorageAdapter()`, eliminating ~120 lines of duplicate Supabase queries.
- `apps/web/src/lib/supabase.ts`: Re-exported from `@collabo/database` for backwards compatibility.
- `apps/web/src/components/board/*` & `hooks/useCanvasHistory.ts`: Converted imports from local types to `@collabo/shared`.
- `docs/IMPLEMENTATION_PLAN.md`: Marked Milestone M2 as COMPLETED.

#### 3. Problems Encountered & Solutions
- **Pen Snap-back on Canvas Re-render**:
  - *Problem*: When a user dragged a freehand pen drawing in Select mode, releasing the mouse caused the stroke to immediately jump back to its origin.
  - *Root Cause*: `handleDragEnd` saved `x` and `y` into state, but `<Line>` only accepted `points` and did not pass `x` or `y` attributes to Konva. On the next render, Konva used default `(0, 0)` offsets.
  - *Solution*: Added `x?: number; y?: number;` to `PenElement` and passed `x={el.x ?? 0}` and `y={el.y ?? 0}` to `<Line>`.
- **Database Logic Duplication in API Routes**:
  - *Problem*: Both `/api/boards` and `/api/boards/[id]` repeated 60+ lines of identical fallback logic for checking Supabase vs. MemoryStore.
  - *Solution*: Abstracted persistence into `BoardStorageAdapter` with a `HybridBoardAdapter` that handles database errors and fallback transparently.

#### 4. Commands Learned
- `pnpm -r typecheck`: Typechecks all monorepo workspace packages recursively in topological order.
- `pnpm -r lint`: Lints all workspace projects.
- `pnpm --filter <pkg> exec <cmd>`: Executes a binary installed within a specific workspace package.

#### 5. What I Can Now Explain Independently
- How to extract shared libraries within a pnpm monorepo using `workspace:*` dependencies.
- How the Storage Adapter Pattern decouples business logic from concrete databases.
- How Konva scenegraph transforms work and why node coordinates must bind to component props.

### Milestone M3: Identity & Institutional Workspace Management
- **Status**: Completed
- **Date**: 2026-11-04

#### 1. Core Concepts Learned
- **Multi-Tenancy & Tenant Discriminators**: How educational platforms enforce data isolation using a shared PostgreSQL schema with `institution_id` tenant keys. Combined with PostgreSQL Row-Level Security (RLS), this ensures users cannot view data belonging to other institutions.
- **Role-Based Access Control (RBAC) Decomposition**: Decoupling permissions (`course:read`, `course:create`, `room:host`, `room:speak`) from roles (`admin`, `instructor`, `student`, `guest`). Rather than peppering brittle `if (user.role === 'instructor')` checks across UI components, an authorization helper `hasPermission(user, permission, enrollmentRole)` allows dynamic permission resolution (e.g., student elevated to TA in a specific course).
- **Hybrid Data Repository Pattern**: Extending the repository pattern across institutions, departments, courses, and enrollments with an in-memory fallback store (`MemoryInstitutionalRepository`) containing rich mock seeds. This allows the application to be tested end-to-end without configuring cloud credentials or database connections.

#### 2. Files Changed & Why
- `packages/shared/src/institution.ts`: Defined TypeScript domain models for `Institution`, `Department`, `Course`, `CourseEnrollment`, `UserProfile`, `SystemRole`, and `EnrollmentRole`.
- `packages/shared/src/index.ts`: Re-exported institutional types.
- `supabase/migrations/20261104000001_create_institutional_schema.sql`: Additive SQL migration creating `institutions`, `departments`, `courses`, `course_enrollments`, and upgrading `profiles` with `system_role`.
- `packages/auth/package.json` & `tsconfig.json`: Initialized the standalone `@collabo/auth` workspace package.
- `packages/auth/src/types.ts`: Defined `Permission`, `AuthUser`, and `AuthSession` interfaces.
- `packages/auth/src/permissions.ts`: Authored the `SYSTEM_ROLE_PERMISSIONS` and `ENROLLMENT_ROLE_PERMISSIONS` matrices alongside `hasPermission`, `canHostRoom`, and `canManageCourse`.
- `packages/auth/src/mock.ts`: Created developer personas (`MOCK_ADMIN`, `MOCK_INSTRUCTOR`, `MOCK_STUDENT`, `MOCK_GUEST`) and offline session provider.
- `packages/auth/src/index.ts`: Public exports for `@collabo/auth`.
- `packages/database/src/repositories/institutional-repository.ts`: Defined `InstitutionalRepository` interface.
- `packages/database/src/repositories/memory-institutional-repo.ts`: In-memory development store seeded with Apex Institute of Technology, CS department, and CS-101 course.
- `packages/database/src/repositories/supabase-institutional-repo.ts`: Supabase PostgreSQL repository implementation.
- `packages/database/src/repositories/hybrid-institutional-repo.ts`: Resilient hybrid repository falling back to memory store on network issues.
- `packages/database/src/index.ts`: Public exports for institutional repositories.
- `apps/web/package.json` & `tsconfig.json`: Linked `@collabo/auth` as workspace dependency.
- `apps/web/src/app/api/institutions/route.ts`: Added endpoint returning institution catalog and departments.
- `apps/web/src/app/api/courses/route.ts`: Added endpoint for course discovery and creation with RBAC enforcement.
- `docs/IMPLEMENTATION_PLAN.md`: Marked Milestone M3 as COMPLETED.

#### 3. Problems Encountered & Solutions
- **Symlink Creation on Windows for New Package**:
  - *Problem*: Creating `packages/auth` and running `pnpm --filter @collabo/auth typecheck` failed with `ERR_PNPM_PACKAGE_MANAGER_SYMLINK_FAILED: Access is denied. (os error 5)`.
  - *Root Cause*: On Windows, creating workspace symlinks in `node_modules` requires administrator or elevated permissions.
  - *Solution*: Executed `pnpm install` with bypass sandbox mode, linking `@collabo/auth` cleanly into the workspace.
- **ESLint `no-explicit-any` in Course API Route**:
  - *Problem*: `let body: any;` in `apps/web/src/app/api/courses/route.ts` violated ESLint rules.
  - *Solution*: Replaced `any` with a strongly-typed `Partial<{ department_id: string; ... }>` payload interface.

#### 4. Commands Learned
- `pnpm -r typecheck`: Verified all 7 monorepo workspace packages.
- `pnpm -r lint`: Verified zero lint warnings/errors across the entire monorepo.

#### 5. What I Can Now Explain Independently
- How shared-schema multi-tenancy works with tenant foreign keys and Row-Level Security.
- How to design an RBAC permission matrix that separates global system roles from course-level roles.
- How to write decoupled repository interfaces that support both cloud databases and in-memory mock fixtures.

### Milestone M4: Classroom Management & Scheduling
- **Status**: Completed
- **Date**: 2026-11-05

#### 1. Core Concepts Learned
- **Classroom Templates vs. Session Instances**: Architectural separation between the persistent container (`classrooms` with course association, default lecture/interactive mode, and waiting room policies) and temporal meeting events (`classroom_sessions` with scheduled/live/ended status and timestamps).
- **Automated Participation Logging**: Tracking student attendance through connection lifecycle hooks. Computing exact `duration_seconds` upon leave events or session termination to remove manual roll-call overhead while providing verifiable institutional records.
- **Session-Board Junction Pattern**: Using `session_boards` to bind collaborative whiteboards to live sessions dynamically. This decouples canvas persistence from classroom scheduling, allowing instructors to bring in existing boards or spawn new session boards seamlessly.

#### 2. Files Changed & Why
- `packages/shared/src/classroom.ts`: Defined TypeScript domain models for `Classroom`, `ClassroomSession`, `SessionParticipant`, `SessionBoard`, `ClassroomMode`, `SessionStatus`, and enriched view contracts.
- `packages/shared/src/index.ts`: Re-exported classroom models.
- `supabase/migrations/20261105000001_create_classrooms_schema.sql`: Additive SQL migration creating `classrooms`, `classroom_sessions`, `session_participants`, and `session_boards` with foreign keys, indexes, and RLS policies.
- `packages/database/src/repositories/classroom-repository.ts`: Defined `ClassroomRepository` interface.
- `packages/database/src/repositories/memory-classroom-repo.ts`: In-memory development store pre-seeded with CS-101's virtual classroom and scheduled session.
- `packages/database/src/repositories/supabase-classroom-repo.ts`: Production PostgreSQL implementation with relational joins.
- `packages/database/src/repositories/hybrid-classroom-repo.ts`: Resilient hybrid fallback proxy.
- `packages/database/src/index.ts`: Public exports for classroom repositories.
- `apps/web/src/app/api/classrooms/route.ts`: Endpoint for provisioning virtual classrooms with RBAC validation.
- `apps/web/src/app/api/sessions/route.ts`: Endpoint for scheduling sessions.
- `apps/web/src/app/api/sessions/[id]/route.ts`: Endpoint for session retrieval and lifecycle transitions (`live`, `ended`).
- `apps/web/src/app/api/sessions/[id]/attendance/route.ts`: Endpoint for attendance roster inspection and join/leave event logging.
- `docs/IMPLEMENTATION_PLAN.md`: Marked Milestone M4 as COMPLETED.

#### 3. Problems Encountered & Solutions
- **ESLint `no-explicit-any` on Session Creation Response**:
  - *Problem*: `full || (created as any)` in `apps/web/src/app/api/sessions/route.ts` violated TypeScript strict lint rules.
  - *Solution*: Replaced with `full || undefined`, properly satisfying `SessionWithDetails | undefined`.

#### 4. Commands Learned
- `pnpm -r typecheck`: Verified all 7 monorepo packages.
- `pnpm -r lint`: Verified zero lint warnings/errors across the monorepo.

#### 5. What I Can Now Explain Independently
- The difference between room templates and live session entities in educational software architecture.
- How automated attendance logging calculates participant durations reliably across network disconnects.
- How junction tables decouple shared media documents (whiteboards) from live scheduling meetings.

### Milestone M5: Real-Time Control Plane
- **Status**: Completed
- **Date**: 2026-11-06

#### 1. Core Concepts Learned
- **Separation of Control Plane from Media Plane**: Why enterprise collaborative systems decouple signaling/presence (Socket.IO over TCP) from audio/screen-share streaming (WebRTC SFU over UDP). This keeps the control plane lightweight, resilient, and capable of coordinating hundreds of concurrent lecture rooms without media-induced jitter or lag.
- **In-Memory Concurrency & State Machines**: Using Node.js single-threaded event loop to execute synchronized room mutations (speaking queues, mode transitions, mic grants, mute-all) in memory with sub-5ms latency, avoiding database read/write bottlenecks during high-frequency classroom events.
- **Volatile vs. Guaranteed Real-Time Delivery**: Understanding when to use `socket.volatile.emit()` for ephemeral, non-critical high-frequency coordinates (cursor updates) so network congestion drops stale packets without backlogging client buffers, while using standard emissions for structural events (mic grants, mode changes).
- **Ephemeral Disconnect Buffer (Grace Period)**: Why live classrooms require a 30-second disconnect grace window. If a student's Wi-Fi drops momentarily, reconnecting preserves their place in the speaking queue and active classroom role without disrupting the lecture.

#### 2. Files Changed & Why
- `packages/shared/src/control-plane.ts`: Authored comprehensive, strongly-typed contracts for client-to-server and server-to-client Socket.IO payloads (`ClientJoinRoomPayload`, `ServerModeChangedPayload`, `ServerQueueUpdatedPayload`, `ActivePollState`, etc.).
- `packages/shared/src/index.ts`: Re-exported control plane event schemas.
- `apps/realtime/package.json`: Linked `@collabo/auth` and `@collabo/database` workspace packages and added `socket.io-client`.
- `apps/realtime/tsconfig.json`: Adjusted `rootDir` and added workspace path mappings to allow cross-package compilation.
- `apps/realtime/src/state/room-state-manager.ts`: Built the centralized in-memory `RoomStateManager` handling FIFO speaking queues, mode toggling, mic permissions, live polls, waiting rooms, and disconnect timers.
- `apps/realtime/src/handlers/presence-handler.ts`: Handled room join, leave, waiting room queueing, and asynchronous attendance sync.
- `apps/realtime/src/handlers/classroom-handler.ts`: Implemented host moderation actions (`classroom:set_mode`, `classroom:raise_hand`, `classroom:grant_mic`, `classroom:revoke_mic`, `classroom:mute_all`).
- `apps/realtime/src/handlers/interaction-handler.ts`: Implemented in-class chat, live comprehension polls, and volatile cursor streaming.
- `apps/realtime/src/index.ts`: Refactored server entrypoint with modular handler assembly and programmatic server creation factory.
- `docs/IMPLEMENTATION_PLAN.md`: Marked Milestone M5 as COMPLETED.

#### 3. Problems Encountered & Solutions
- **TypeScript TS6059 `rootDir` Constraint**:
  - *Problem*: `pnpm --filter @collabo/realtime typecheck` failed with `File '.../packages/shared/src/index.ts' is not under 'rootDir' 'apps/realtime/src'`.
  - *Root Cause*: Specifying `"rootDir": "./src"` prevented TypeScript from resolving imported source files from other workspace packages.
  - *Solution*: Removed `"rootDir": "./src"` from `apps/realtime/tsconfig.json`, allowing multi-package path resolution.

#### 4. Commands Learned
- `pnpm --filter @collabo/realtime dev`: Runs the standalone Socket.IO server with hot-reload via `tsx watch`.
- `pnpm --filter @collabo/realtime build`: Compiles the server to `dist/` via `tsc`.

#### 5. What I Can Now Explain Independently
- How a WebSocket control plane enforces role-based speaking permissions in real time.
- How volatile socket broadcasting prevents network buffer congestion during multiplayer cursor moves.
- How an in-memory FIFO queue coordinates large classroom hand-raising without database thrashing.

### Milestone M6: Voice Infrastructure & SFU Integration
- **Status**: Completed
- **Date**: 2026-11-07

#### 1. Core Concepts Learned
- **P2P Mesh vs. Selective Forwarding Unit (SFU) Topology**: Why $O(N^2)$ mesh connections collapse on client devices beyond 4–6 peers (at 250 participants, a mesh requires 62,250 bidirectional peer connections, saturating CPU and uplink bandwidth). In contrast, an SFU acts as an intelligent media router ($O(N)$ connections): each broadcaster uploads exactly one track to the server, and the SFU selectively multiplexes downstream UDP audio packets to subscribers.
- **Asymmetric Bandwidth in Large-Scale Educational Delivery**: In *Lecture Mode*, only the instructor (or an elevated student speaker) publishes audio. In a 250-person hall, there is only 1 uplink media stream across the entire room, while 249 participants are pure listeners (0 upstream bandwidth, ~32 kbps downstream Opus audio). In *Interactive Mode*, publishing permissions are dynamically extended to all peers.
- **Stateless Media Authorization via Cryptographic JWTs**: How WebRTC SFUs enforce track publishing permissions without polling a database on every audio packet. The application server signs an HMAC-SHA256 JWT containing explicit `VideoGrant` claims (`roomJoin`, `canPublish`, `canSubscribe`, `canPublishSources: ["microphone"]`). The SFU inspects and verifies the signature at the media edge during the WebRTC ICE/DTLS handshake.
- **Zero-Config Development via Mock Service Fallback**: Why robust distributed architectures include offline mock implementations. Developers and automated integration tests can run full classroom joining and permission workflows without requiring a deployed LiveKit server or external cloud credentials.

#### 2. Files Changed & Why
- `packages/shared/src/voice.ts`: Authored shared domain models for WebRTC SFU grants, track sources, connection states, and token exchange requests (`VideoGrant`, `VoiceRoomToken`, `VoiceParticipantState`, `VoiceTrackSource`).
- `packages/shared/src/index.ts`: Re-exported voice domain types.
- `packages/voice/package.json` & `packages/voice/tsconfig.json`: Created dedicated `@collabo/voice` workspace package.
- `packages/voice/src/types.ts`: Defined `VoiceTokenService` contracts, `GenerateTokenOptions`, and LiveKit JWT claims interface.
- `packages/voice/src/permissions.ts`: Implemented `createLiveKitGrant()` resolver mapping classroom mode, role (host, co-host, speaker, attendee), and speaking elevation to LiveKit `VideoGrant` permissions.
- `packages/voice/src/mock.ts`: Built `MockVoiceTokenService` producing compliant mock JWTs and simulated WebSocket endpoints for offline development.
- `packages/voice/src/token-service.ts`: Implemented production `LiveKitVoiceTokenService` using standard `node:crypto` HMAC-SHA256 signing, along with environment-sensing `getVoiceTokenService()` factory and `generateVoiceToken()` helper.
- `packages/voice/src/index.ts`: Exported barrel for `@collabo/voice`.
- `apps/web/package.json` & `apps/web/tsconfig.json`: Linked `@collabo/voice` workspace dependency into Next.js.
- `apps/web/src/app/api/sessions/[id]/voice-token/route.ts`: Built Next.js App Router POST endpoint that verifies user session, retrieves classroom delivery mode, and mints signed LiveKit tokens.
- `docs/IMPLEMENTATION_PLAN.md`: Updated Milestone M6 status to COMPLETED.

#### 3. Problems Encountered & Solutions
- **Auth User Property Typo in Voice Route**:
  - *Problem*: `src/app/api/sessions/[id]/voice-token/route.ts` attempted to read `authSession.profile.display_name`, triggering TypeScript error TS2339.
  - *Root Cause*: `@collabo/auth` models user identity via `authSession.user.full_name`.
  - *Solution*: Corrected to `authSession.user.full_name || authSession.user.email`.

#### 4. Commands Learned
- `pnpm --filter @collabo/voice typecheck`: Typechecks the isolated voice package.
- `pnpm -r typecheck`: Typechecks all 8 packages in the monorepo workspace.

#### 5. What I Can Now Explain Independently
- Why an SFU architecture is mandatory for classrooms with 250+ concurrent participants.
- How LiveKit uses JWT VideoGrants to prevent unauthorized microphone transmission at the WebRTC media boundary.
- How to construct and sign standard HMAC-SHA256 JWT tokens using Node's native `crypto` module without heavy 3rd-party dependencies.

### Milestone M7: Screen Sharing & Classroom Interaction
- **Status**: Completed
- **Date**: 2026-11-08

#### 1. Core Concepts Learned
- **WebRTC Display Media Capture (`getDisplayMedia`)**: How browsers capture high-definition desktop display surfaces (entire monitors, application windows, or browser tabs) at 1080p/4K 30–60 FPS with audio loopback (`screen_share_audio`). Managing the track lifecycle includes listening for the browser's native floating "Stop sharing" chrome banner via `MediaStreamTrack.onended`.
- **Decoupled Video Decoders vs. 2D Canvas Engine**: Why high-definition presentation video must never be rasterized or blitted frame-by-frame onto the HTML5 2D whiteboard `<canvas>`. Doing so burns CPU/GPU bus bandwidth and degrades drawing smoothness to <15 FPS. Instead, an isolated DOM `<video>` viewport uses native GPU hardware acceleration, coexisting harmoniously with the Konva whiteboard stage.
- **In-Memory Concurrency for High-Frequency Classroom Events**: How live comprehension polls (RM-09) and Q&A upvoting (RM-10) survive burst traffic. When 250 students vote simultaneously within 2 seconds, persisting every click to a relational database exhausts connection pools and causes latency spikes. In-memory state in Node.js processes votes atomically and broadcasts computed percentage distributions in sub-10ms.
- **Idempotent Upvoting via Profile Sets**: Storing upvotes as an array/set of unique `profileId`s per question prevents double-voting abuse and allows a clean one-click toggle (click to upvote, click again to retract) with guaranteed deterministic sorting (`upvoteCount` descending).

#### 2. Files Changed & Why
- `packages/shared/src/control-plane.ts`: Added strongly-typed data contracts for screen sharing (`ActiveScreenShareState`, `ClientScreenShareStartPayload`, `ServerScreenShareStartedPayload`, etc.) and live Q&A threads (`QAQuestion`, `ClientAskQuestionPayload`, `ClientUpvoteQuestionPayload`, `ClientAnswerQuestionPayload`, etc.).
- `apps/realtime/src/state/room-state-manager.ts`: Added active screen share tracking, role-based permission checks (host/co-host/speaker only), Q&A storage, upvote toggling, and automated cleanup on presenter disconnect.
- `apps/realtime/src/handlers/interaction-handler.ts`: Wired up socket listeners and room broadcasts for `screen:start`, `screen:stop`, `qa:ask`, `qa:upvote`, and `qa:answer`.
- `packages/voice/src/screen-share.ts`: Built `ScreenShareController` managing browser display media requests, track lifecycle listeners, and headless test simulation.
- `packages/voice/src/index.ts`: Re-exported screen share controller.
- `apps/web/src/components/classroom/ScreenShareStage.tsx`: Responsive presentation video stage with presenter header, full-screen toggle, audio mute, and aspect-video layout.
- `apps/web/src/components/classroom/ScreenShareControl.tsx`: Toolbar control for initiating and stopping screen shares with permission checks and active pulsing indicators.
- `apps/web/src/components/classroom/ClassroomSidebar.tsx`: Slide-over drawer with 3 tabs: Chat stream with role badges, Live Polls with animated percentage bars and host creation form, and Q&A question thread with upvote buttons and instructor "Mark Answered" toggles.
- `apps/web/src/components/board/BoardHeader.tsx` & `BoardWorkspace.tsx`: Integrated screen share controls, video presentation stage, and interaction drawer into the main whiteboard workspace.
- `docs/IMPLEMENTATION_PLAN.md`: Marked Milestone M7 as COMPLETED.

#### 3. Problems Encountered & Solutions
- **React 19 / ESLint Ref Access Error (`react-hooks/refs`)**:
  - *Problem*: `BoardWorkspace.tsx` threw an ESLint error on `if (!screenControllerRef.current) screenControllerRef.current = new ScreenShareController();` during render.
  - *Root Cause*: React 19 and ESLint 9 strictly prohibit reading or mutating `ref.current` during the component render phase.
  - *Solution*: Moved initialization inside the `handleToggleScreenShare` event callback where accessing ref values is completely valid and recommended.
- **Badge Variant Type Constraint**:
  - *Problem*: `BadgeProps.variant` only accepts `"indigo" | "rose" | "amber" | "emerald" | "slate"`. Passing `"purple"` for TA badges caused TS2322.
  - *Solution*: Replaced with `"indigo"`.

#### 4. Commands Learned
- `pnpm --filter @collabo/web lint`: Runs Next.js 16 + React 19 lint suite with strict hook rules.
- `npx --prefix apps/realtime tsx test_m7.ts`: Runs isolated Node.js test harness without port binding conflicts.

#### 5. What I Can Now Explain Independently
- How browser screen capture (`getDisplayMedia`) coordinates with WebRTC video tracks and control plane signaling.
- Why media presentation must be decoupled from 2D whiteboard canvas rendering.
- How in-memory state machines handle real-time classroom polls and question upvoting at scale without database bottlenecks.

### Milestone M8: Collaborative Whiteboard Transformation
- **Status**: Completed
- **Date**: 2026-11-10

#### 1. Core Concepts Learned
- **2D Camera Model & Coordinate Space Inversion**: How infinite spatial whiteboards translate screen coordinates (DOM pointer client pixels) into infinite world coordinates via:
  $$x_{\text{world}} = \frac{x_{\text{screen}} - \text{camera.x}}{\text{camera.scale}}, \quad y_{\text{world}} = \frac{y_{\text{screen}} - \text{camera.y}}{\text{camera.scale}}$$
  Implementing **focal-point zooming** ensures the world coordinate under the pointer remains stationary during wheel scaling, preventing jarring viewport jumps.
- **Operational Delta Synchronization vs. Array Overwrites**: Why collaborative multiplayer canvases must not sync by replacing the full `CanvasElement[]` array on every debounce. Instead, granular delta operations (`create`, `update`, `delete`, `batch`) allow multiple users to draw, move, and edit independent shapes simultaneously without race conditions or element overwriting.
- **DOM Portal Overlay for Rich Text Editing**: Replacing primitive browser modal prompts (`window.prompt()`) with floating HTML `<textarea>` portals projected precisely into screen coordinates over world-space sticky notes. This supports multi-line typing, selection, and keyboard hotkeys (`Ctrl+Enter` commit, `Esc` cancel) without blocking the main event loop.
- **Asynchronous Image Bitmap Handling (`Konva.Image`)**: How to model and render user-dropped diagrams and screenshots (`ImageElement`) using HTML5 `Image()` asynchronous caching, aspect ratio locking, and seamless Konva transformer resizing.

#### 2. Files Changed & Why
- `packages/shared/src/canvas.ts`: Added `ImageElement` model, `ViewportTransform` interface, and authoring metadata (`authorId`, `authorName`, `isLocked`, `zIndex`) to `BaseElement`.
- `packages/shared/src/control-plane.ts`: Added whiteboard operational delta contracts (`BoardOpType`, `ClientBoardOpPayload`, `ServerBoardOpPayload`, `ServerBoardSyncPayload`).
- `packages/whiteboard/src/camera.ts`: Authored pure mathematical helpers for `screenToWorld`, `worldToScreen`, `calculateZoomAtPointer`, and `clampScale`.
- `packages/whiteboard/src/elements.ts`: Implemented `createImageElement()` factory and layering utilities (`bringForward`, `sendBackward`, `bringToFront`, `sendToBack`).
- `packages/whiteboard/src/index.ts`: Re-exported camera module.
- `apps/realtime/src/handlers/board-handler.ts`: Built real-time in-memory board state store and Socket.IO operational delta broadcast engine.
- `apps/realtime/src/index.ts`: Registered board handlers on the realtime server.
- `apps/web/src/components/board/CanvasZoomControls.tsx`: Created floating HUD with Zoom In, Zoom Out, percentage readout, and 1:1 view reset.
- `apps/web/src/components/board/CanvasStage.tsx`: Upgraded stage with infinite camera (spacebar pan, wheel zoom), peer cursor rendering with name tags, image drag-and-drop, and inline `<textarea>` editor.
- `apps/web/src/components/board/BoardWorkspace.tsx`: Integrated camera state, zoom HUD, and operational synchronization.
- `docs/IMPLEMENTATION_PLAN.md`: Marked Milestone M8 as COMPLETED.

#### 3. Problems Encountered & Solutions
- **React 19 Ref Reading in Render**:
  - *Problem*: Reading `isSpacePressedRef.current` inside the container `className` string triggered ESLint error `react-hooks/refs`.
  - *Root Cause*: React 19 prohibits reading refs during the render cycle.
  - *Solution*: Transformed `isSpacePressed` into React state (`useState(false)`), which both satisfies ESLint and properly triggers visual cursor style updates.

#### 4. Commands Learned
- `pnpm --filter @collabo/whiteboard typecheck`: Typechecks the isolated canvas mathematics and element package.
- `npx --prefix apps/realtime tsx test_m8.ts`: Executes M8 verification suite covering camera math, layering, and delta operations.

#### 5. What I Can Now Explain Independently
- The mathematical derivation of infinite canvas panning and focal-point zooming.
- Why operational deltas are essential for concurrent multiplayer canvas synchronization.
- How to project floating DOM elements over an HTML5 canvas for inline text editing.

---

*(Future milestone entries will be appended here as we progress through the implementation plan.)*
