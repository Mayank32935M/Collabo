# Product Requirements Document (PRD) — COLLABO

> **Document Status**: Approved (Milestone 1 Baseline)  
> **Target Release**: MVP (Phase 1)  
> **Product Name**: COLLABO  
> **Tagline**: Think together. Build ideas together.

---

## 1. Problem Statement

Students, hackathon teams, and student clubs frequently collaborate on open-ended problems like software architecture design, study guides, system flowcharts, and sprint task planning. 

Currently, they face significant friction with existing solutions:
1. **Enterprise Tool Overkill**: Existing commercial tools (like Miro or Figma) are feature-dense, expensive, and intimidating for fast study sessions or 24-hour hackathons.
2. **Text-Heavy Communication**: Group chats and Google Docs lack spatial, non-linear brainstorming capabilities where visual connections, sticky notes, and rapid sketching are needed.
3. **Complex Collaboration Setup**: Many whiteboards require complex team licensing, slow onboarding, and lack the lightweight, playful energy that makes student project collaboration fun.

**COLLABO solves this** by offering a lightweight, colorful, real-time collaborative canvas optimized specifically for study groups, hackathon brainstorms, and student project planning.

---

## 2. Target Audience & Personas

### Persona A: Alex — The Hackathon Hacker
- **Context**: 3rd-year CS student competing in a 36-hour weekend hackathon with 3 friends.
- **Pain Point**: Needs to sketch frontend/backend flow, API boundaries, and database relationships fast without learning an enterprise design tool.
- **Goal**: Share a URL with team members, see live cursors, draw shapes and arrows, and agree on architecture in 30 minutes.

### Persona B: Priya — The Study Group Lead
- **Context**: Preparing for college mid-terms with 4 classmates.
- **Pain Point**: Memorizing complex algorithms and data structures through pure text is hard; everyone wants to map out visual flowcharts and stick revision reminders.
- **Goal**: Open a persistent board, drop colored sticky notes for quiz topics, and refer back to it during exams.

### Persona C: Sam — The Student Society Coordinator
- **Context**: Organizing the annual college tech fest with a 10-person committee.
- **Pain Point**: Scattered ideas across WhatsApp messages and random Google Sheets.
- **Goal**: Create a visual backlog where committee members place idea cards and organize event agendas visually.

---

## 3. Product Vision

COLLABO is a playful, high-performance visual whiteboard that turns synchronous thinking into a shared, delightful experience.

Key qualities:
- **Playful & Friendly**: Colorful palette, smooth animations, intuitive tactile feel.
- **Low Barrier to Entry**: Instant room creation, frictionless link sharing.
- **Real-Time Responsiveness**: Ultra-low-latency cursor synchronization and immediate shape rendering.
- **Reliable Persistence**: Cloud-backed storage so no student loses their hackathon brainstorm.

---

## 4. Main User Journeys

### Journey 1: Instant Brainstorming Session
1. User visits COLLABO and creates a new Board.
2. User copies the board's shareable link and sends it to their study group on Discord/WhatsApp.
3. Teammates open the link and join immediately.
4. Each teammate is assigned a distinctive color and avatar cursor.
5. Teammates place sticky notes, draw connectors, and brainstorm concurrently.
6. The session auto-saves continuously.

### Journey 2: Returning to an Existing Project
1. User logs in with email or OAuth.
2. User views their saved boards dashboard.
3. User opens their hackathon project board.
4. All previous drawings, shapes, and notes load accurately from the database.
5. User exports the finished board as an image or PDF to submit with their project report.

---

## 5. Planned Core Features (Full Vision)

1. **Vector & Shape Canvas Engine**:
   - Freehand pen tool with stroke smoothing.
   - Standard shapes: Rectangles, circles, diamonds, arrows, lines.
   - Text boxes and colorful sticky notes.
   - Object transformation: Move, resize, rotate, z-index ordering, and deletion.

2. **Real-Time Multiplayer Collaboration**:
   - Ephemeral live cursor broadcasting with teammate names and distinct colors.
   - Live object creation, transformation, and movement broadcast via WebSockets.
   - Conflict-free resolution ensuring all clients converge on the same board state.

3. **Board Organization & Workspaces**:
   - Infinite canvas with zoom (pan & pinch-to-zoom) and grid background.
   - Board dashboard listing recent boards with thumbnail previews.
   - Board export (PNG, SVG, JSON).

4. **Authentication & Access Control**:
   - Secure login via email and social providers (GitHub / Google).
   - Board sharing permissions: Public (anyone with link can edit), View-Only, or Private.

---

## 6. MVP Scope (Phases 1 - 8)

The Minimum Viable Product will focus on delivering the core collaborative experience:
- **Canvas**: Freehand drawing, rectangles, sticky notes, and connectors.
- **Real-Time Sync**: Live cursors and object state synchronization over WebSockets (Socket.IO).
- **Rooms**: Unique room IDs accessible via shareable URLs.
- **Persistence**: Board state stored in PostgreSQL.
- **Basic Auth**: User authentication to save and reopen personal boards.

---

## 7. Deliberately Excluded from Milestone 1 (Current Step)

To maintain focus and enable step-by-step engineering mastery, the following are strictly deferred:
- ❌ **Canvas Engine**: No Konva / HTML5 Canvas rendering yet (scheduled for Step 4).
- ❌ **WebSockets**: No live socket connections or fake cursor simulations (scheduled for Step 7).
- ❌ **Authentication**: No login buttons, JWT handling, or Supabase clients (scheduled for Step 9).
- ❌ **Database**: No SQL queries, ORMs, or connection pools (scheduled for Step 6).
- ❌ **Audio/Video Calls**: Out of scope for MVP.
- ❌ **AI Co-pilot / Auto-generation**: Out of scope for MVP to keep architecture transparent and reliable.
