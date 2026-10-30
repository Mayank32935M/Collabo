# Engineering Implementation Plan — COLLABO

> **Tracking Standard**: Every step includes clear learning objectives, prerequisites, deliverables, acceptance criteria, and a practical verification test. Future steps remain marked as `NOT_STARTED` to ensure focused, intentional execution.

---

## Roadmap Summary

| Step | Milestone Name | Status |
| :---: | :--- | :---: |
| **01** | Project Foundation, Git Hygiene & Core Architecture | **COMPLETED** |
| **02** | Next.js App Router Structure & UI Design System | **COMPLETED** |
| **03** | React State & Interactive Canvas Toolbars | **COMPLETED** |
| **04** | Single-User Canvas with React Konva | **COMPLETED** |
| **05** | Canvas Object Manipulation, Undo/Redo & Local Storage | **COMPLETED** |
| **06** | Backend API & PostgreSQL Database Persistence | `NOT_STARTED` |
| **07** | Custom Real-Time WebSocket / Socket.IO Server | `NOT_STARTED` |
| **08** | Live Multi-User Collaboration & Cursor Synchronization | `NOT_STARTED` |
| **09** | User Authentication, Room Access & Sharing Permissions | `NOT_STARTED` |
| **10** | End-to-End Testing, Security Hardening & Deployment | `NOT_STARTED` |

---

## Detailed Milestone Specifications

### Step 1: Project Foundation, Git Hygiene & Core Architecture
- **Status**: **COMPLETED**
- **Learning Objectives**:
  - Understand how Next.js, TypeScript, and modern CSS integrate.
  - Master Git version control principles, repository structure, and `.gitignore` hygiene.
  - Comprehend the purpose of `.env.example` vs private environment files.
  - Establish portfolio-grade engineering documentation.
- **Prerequisites**: Node.js, npm, and Git installed locally.
- **Deliverables**:
  - Bootstrapped Next.js 16 application with TypeScript and Tailwind CSS v4.
  - Minimal playful landing page explaining the COLLABO vision and current milestone.
  - Comprehensive documentation suite: `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/LEARNING_LOG.md`.
  - Secure `.gitignore` excluding build artifacts, dependencies, and environment files while retaining `.env.example`.
- **Acceptance Criteria**:
  - `npm run build` compiles with 0 errors.
  - `npm run lint` passes with 0 warnings/errors.
  - Repository is staged cleanly for its first Git commit.
- **Practical Test**: Run `npm run build` and `npm run dev` to verify the page renders at `http://localhost:3000`.

---

### Step 2: Next.js App Router Structure & UI Design System
- **Status**: **COMPLETED**
- **Learning Objectives**:
  - Learn Next.js App Router conventions: layouts, pages, route groups, and component composition.
  - Build a reusable UI design system (buttons, badges, modal dialogs) using Tailwind CSS.
  - Understand client vs. server components (`'use client'`).
- **Prerequisites**: Completion of Step 1.
- **Deliverables**:
  - Dedicated `/board/[id]` route structure.
  - Header component with room title, share button, and avatar placeholders.
  - Playful color tokens and styling primitives.
- **Acceptance Criteria**:
  - Navigation between landing page and empty board route works smoothly.
  - Clean TypeScript interfaces for UI components.
- **Practical Test**: Create a dynamic board route and pass mock board parameters through URL props.

---

### Step 3: React State & Interactive Canvas Toolbars
- **Status**: **COMPLETED**
- **Learning Objectives**:
  - Learn React state management hooks (`useState`, `useReducer`, custom hooks).
  - Understand controlled components and action dispatching.
  - Build accessible floating toolbars with tool selection state (Select, Pen, Rectangle, Sticky Note, Text).
- **Prerequisites**: Step 2.
- **Deliverables**:
  - Interactive toolbar with active tool highlight and color palette selector.
  - State manager coordinating which tool is currently selected.
- **Acceptance Criteria**:
  - Clicking tools updates active state without page re-renders.
  - Keyboard shortcuts (e.g., `V` for select, `P` for pen, `R` for rectangle) toggle tools.
- **Practical Test**: Pressing keyboard keys switches active toolbar button with visible animation.

---

### Step 4: Single-User Canvas with React Konva
- **Status**: **COMPLETED**
- **Learning Objectives**:
  - Learn HTML5 2D Canvas rendering principles and declarative canvas libraries.
  - Understand stage, layer, and shape abstractions in Konva.js.
  - Implement dynamic window resizing and coordinate normalization.
- **Prerequisites**: Step 3.
- **Deliverables**:
  - Canvas stage mounted within the `/board/[id]` route.
  - Ability to draw freehand pencil lines and place basic geometric shapes.
- **Acceptance Criteria**:
  - Smooth drawing with 60 FPS performance.
  - Shapes are rendered from a structured JavaScript object array.
- **Practical Test**: Draw 50 shapes on the canvas and verify render performance without lag.

---

### Step 5: Canvas Object Manipulation, Undo/Redo & Local Persistence
- **Status**: **COMPLETED**
- **Learning Objectives**:
  - Implement 2D transformation math: drag-and-drop, bounding-box resizing, rotation.
  - Master the Command pattern for robust Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`) history stacks.
  - Implement browser `localStorage` serialization for offline resilience.
- **Prerequisites**: Step 4.
- **Deliverables**:
  - Interactive selection bounding box for resizing and dragging objects.
  - Undo and redo history manager.
  - Auto-save to `localStorage`.
- **Acceptance Criteria**:
  - Refreshing the browser page reloads the exact canvas state.
  - Moving, resizing, and deleting shapes can be undone and redone step-by-step.
- **Practical Test**: Place 3 shapes, move 1, undo twice, and verify state consistency.

---

### Step 6: Backend API & PostgreSQL Database Persistence
- **Status**: **COMPLETED**
- **Learning Objectives**:
  - Understand relational data modeling for collaborative documents (JSONB document snapshots vs. normalized element tables).
  - Write SQL migrations for PostgreSQL (`boards`, `profiles`, `canvas_elements`) with indexes and automatic timestamp triggers.
  - Integrate `@supabase/supabase-js` with graceful offline in-memory fallback for zero-configuration local development.
  - Build Next.js REST API route handlers to save and fetch board documents (`GET /api/boards/[id]`, `PUT /api/boards/[id]`, `POST /api/boards`).
  - Implement debounced cloud auto-save and Stale-While-Revalidate hydration in `useCanvasHistory`.
- **Prerequisites**: Step 5.
- **Deliverables**:
  - PostgreSQL schema migration: `supabase/migrations/20261030000001_create_boards_table.sql` and `docs/schema.sql`.
  - Supabase client integration with offline store: `src/lib/supabase.ts`.
  - TypeScript database types: `src/types/database.ts`.
  - Next.js 16 API Route Handlers: `src/app/api/boards/[id]/route.ts` and `src/app/api/boards/route.ts`.
  - Upgraded `useCanvasHistory` hook with debounced cloud persistence and sync status tracking.
  - Live HUD status indicators showing DB layer and cloud sync feedback.
- **Acceptance Criteria**:
  - Board states serialize to JSON and persist reliably to PostgreSQL / backend API.
  - All unit checks (`lint`, `tsc`, `build`) pass cleanly without errors.
- **Practical Test**: Create shapes on a board, verify network PUT requests save elements to `/api/boards/[id]`, wipe browser `localStorage`, and refresh to confirm the state is restored from the backend.

---

### Step 7: Custom Real-Time WebSocket / Socket.IO Server
- **Status**: `NOT_STARTED`
- **Learning Objectives**:
  - Understand full-duplex TCP communication vs. request-response HTTP.
  - Build a standalone Node.js Socket.IO server with TypeScript.
  - Manage real-time rooms and client connection lifecycles (connect, disconnect, reconnect).
- **Prerequisites**: Step 6.
- **Deliverables**:
  - Dedicated real-time server project in `server/`.
  - Room subscription logic isolating traffic per board.
- **Acceptance Criteria**:
  - Multiple browser tabs can join the same board room and exchange ping events.
- **Practical Test**: Open two browser tabs and verify connection events in the server logs.

---

### Step 8: Live Multi-User Collaboration & Cursor Synchronization
- **Status**: `NOT_STARTED`
- **Learning Objectives**:
  - Implement throttled mouse cursor broadcasting across connected peers.
  - Handle distributed state synchronization and resolve concurrent edit collisions.
  - Optimize WebSocket packet payload size and transmission frequency.
- **Prerequisites**: Step 7.
- **Deliverables**:
  - Real-time multiplayer cursors with user names and distinctive colors.
  - Instant broadcasting of shape creations, moves, and modifications.
- **Acceptance Criteria**:
  - Moving a shape in Tab A immediately updates Tab B in under 50ms.
  - Ephemeral cursor coordinates do not get written to the database.
- **Practical Test**: Position two browser windows side by side and observe synchronous real-time drawing.

---

### Step 9: User Authentication, Room Access & Sharing Permissions
- **Status**: `NOT_STARTED`
- **Learning Objectives**:
  - Implement secure user authentication with Supabase Auth (OAuth + Magic Links).
  - Enforce Row-Level Security (RLS) policies in PostgreSQL.
  - Build board sharing dialogs with View-Only vs. Editor permission checks.
- **Prerequisites**: Step 8.
- **Deliverables**:
  - Authentication modal and user profile menu.
  - Access-controlled board rooms.
- **Acceptance Criteria**:
  - Unauthorized users cannot edit boards marked as View-Only.
  - Users can view a dashboard of all boards they own or collaborate on.
- **Practical Test**: Create a private board as User A and verify User B cannot write to it without permission.

---

### Step 10: End-to-End Testing, Security Hardening & Deployment
- **Status**: `NOT_STARTED`
- **Learning Objectives**:
  - Write automated end-to-end tests using Playwright.
  - Audit WebSocket security: sanitize payloads, rate-limit connections, prevent XSS.
  - Deploy frontend to Vercel and real-time server to a container host (Railway/Render).
  - Prepare professional portfolio documentation, architecture diagrams, and demo video.
- **Prerequisites**: Step 9.
- **Deliverables**:
  - Automated CI test pipeline.
  - Publicly accessible live deployment URLs.
  - Complete portfolio README and architecture walkthrough.
- **Acceptance Criteria**:
  - All tests pass in CI.
  - Public multi-user collaboration works flawlessly on production domains.
- **Practical Test**: Have two separate physical devices join the production URL and collaborate simultaneously.
