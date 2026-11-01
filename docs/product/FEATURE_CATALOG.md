# Feature Catalog & Permissions Matrix — COLLABO

> **Document Status:** Approved (Milestone M1 Specification)  
> **Target Audience:** Engineering, Product, QA, and Architecture Teams

---

## 1. Pillar A: COLLABO Rooms (Live Audio & Classrooms)

| ID | Feature Name | Description | Target Milestone | Complexity |
|:---|:---|:---|:---:|:---:|
| **RM-01** | Voice-Only Classroom | WebRTC SFU audio routing targeting 250+ concurrent participants. | M6 | High |
| **RM-02** | Screen Sharing | High-definition video track broadcasting for presentations and IDE code shares. | M7 | Med |
| **RM-03** | Lecture Mode | Strict audio control; host broadcasts, attendees are muted by default. | M5 | Med |
| **RM-04** | Interactive Mode | Dynamic speaking privileges allowing multi-party discussions and seminar chats. | M5 | Med |
| **RM-05** | Speaking Queue | Chronological hand-raise list with time indicators and one-click mic grants. | M5 | Med |
| **RM-06** | Host & Co-Host Controls | Mute individual, mute all, dismiss speaker, promote participant to co-host. | M5 | Med |
| **RM-07** | Waiting Room | Gated entry for unscheduled guests or unverified students before admission. | M5 | Low |
| **RM-08** | Classroom Chat | Ephemeral and persistent text chat with markdown code formatting and emoji reactions. | M5 | Low |
| **RM-09** | Live Polls | Host can launch instant single-choice or multiple-choice questions with live bar charts. | M7 | Med |
| **RM-10** | Live Q&A Upvoting | Dedicated thread where students submit questions and upvote peer questions. | M7 | Med |
| **RM-11** | Automated Attendance | Automatic tracking of join timestamps, total duration, and leave events per student. | M4 | Low |
| **RM-12** | Session Scheduling | Instructors schedule recurring lectures with calendar invitations and links. | M4 | Med |

---

## 2. Pillar B: COLLABO Workspace (Collaborative Whiteboard)

| ID | Feature Name | Description | Target Milestone | Complexity |
|:---|:---|:---|:---:|:---:|
| **WS-01** | Vector Shape Engine | Declarative Konva rendering for rects, circles, diamonds, arrows, lines, and pen paths. | Baseline / M8 | High |
| **WS-02** | Sticky Notes & Text | Visual brainstorming notes with auto-wrapping text and quick color presets. | Baseline / M8 | Low |
| **WS-03** | Object Transformation | Interactive selection bounding box for dragging, resizing, and rotating objects. | Baseline / M8 | Med |
| **WS-04** | Infinite Canvas Camera | Pan (spacebar / drag) and zoom (scroll wheel / pinch) with coordinate normalization. | M8 | Med |
| **WS-05** | Real-Time Cursors | Low-latency broadcast of peer mouse positions with names and distinctive avatars. | M5 / M8 | Med |
| **WS-06** | State Undo / Redo | History stack managing non-destructive local and collaborative canvas operations. | Baseline / M8 | Med |
| **WS-07** | SWR Persistence | Instant local hydration from `localStorage` reconciled with PostgreSQL database. | Baseline / M8 | Med |
| **WS-08** | Image & PDF Import | Upload or drag-and-drop raster images, SVGs, and slide deck PDFs onto canvas. | M8 | High |
| **WS-09** | Board Permissions | Toggle between Instructor-Only presentation view and Multi-User Edit mode. | M8 | Med |
| **WS-10** | Board Export | High-resolution export of canvas contents to PNG, SVG, PDF, or JSON schema. | M8 | Low |

---

## 3. Pillar C: COLLABO Intelligence (AI-Assisted Learning)

| ID | Feature Name | Description | Target Milestone | Complexity |
|:---|:---|:---|:---:|:---:|
| **AI-01** | Mind-Map Generator | Parses lecture outlines, notes, or prompts and generates structured tree nodes. | M9 | High |
| **AI-02** | Board-Aware Q&A | Multi-modal comprehension answering student queries about drawn canvas objects. | M9 | High |
| **AI-03** | Lecture Recap | Summarizes lecture transcripts, chat discussions, and board diagrams into Markdown. | M9 | Med |
| **AI-04** | Quiz & Flashcard Gen | Extracts core concepts and generates spaced-repetition flashcards and practice quizzes. | M9 | Med |
| **AI-05** | Semantic Board Organizer | Automatically groups and aligns scattered sticky notes by detected topic categories. | M9 | High |
| **AI-06** | Preview Mutation Layer | Translucent canvas overlay allowing users to accept or discard AI additions. | M9 | Med |

---

## 4. Platform & Institutional Administration

| ID | Feature Name | Description | Target Milestone | Complexity |
|:---|:---|:---|:---:|:---:|
| **PL-01** | Multi-Tenant Workspaces | Root institutional accounts with isolated databases, logos, and custom domains. | M3 | High |
| **PL-02** | Department Hierarchy | Organizational tree dividing universities into departments, majors, and faculties. | M3 | Med |
| **PL-03** | Course Management | Course catalogs with instructor assignment, student enrollment rosters, and terms. | M3 | Med |
| **PL-04** | Role-Based Access Control | Granular permission enforcement at the database layer (PostgreSQL RLS). | M3 | High |
| **PL-05** | Open / Personal Boards | Instant zero-friction whiteboard creation for unauthenticated hackathon squads. | Baseline / M3 | Low |

---

## 5. Master Permissions Matrix

| Capability / Action | Institution Admin | Dept Head | Teacher / Host | TA / Co-Host | Student (Attendee) | Open / Guest |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Manage Billing & Institutions** | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **Create Departments** | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **Manage Faculty in Department** | ✅ Full | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None |
| **Create & Schedule Courses** | ✅ Full | ✅ Full | ✅ Own Courses | ❌ None | ❌ None | ❌ None |
| **Start Scheduled Classroom** | ❌ None | ❌ None | ✅ Host | ✅ If designated | ❌ None | ❌ None |
| **Broadcast Voice (Mic)** | ❌ None | ❌ None | ✅ Full | ✅ Full | 🔒 On Grant | ❌ In Class / ✅ Open Board |
| **Broadcast Screen Share** | ❌ None | ❌ None | ✅ Full | ✅ Full | 🔒 On Grant | ❌ In Class / ✅ Open Board |
| **Manage Speaking Queue** | ❌ None | ❌ None | ✅ Full | ✅ Full | ❌ None | ❌ None |
| **Master Mute All** | ❌ None | ❌ None | ✅ Full | ✅ Full | ❌ None | ❌ None |
| **Raise Hand to Speak** | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Full | ❌ None |
| **Draw on Classroom Board** | ❌ None | ❌ None | ✅ Full | ✅ Full | 🔒 When Enabled | ❌ In Class / ✅ Open Board |
| **Create Personal Boards** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **View Attendance Logs** | ✅ Full | ✅ Dept Only | ✅ Own Courses | ✅ Own Courses | ❌ Own History | ❌ None |
| **Trigger AI Summaries / Quizzes** | ❌ None | ❌ None | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
