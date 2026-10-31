# COLLABO

> **Think together. Build ideas together.**

**COLLABO** is an institution-oriented collaborative learning platform designed to bring virtual classrooms, real-time collaboration, interactive whiteboards and AI-assisted learning into one unified workspace.

We're building COLLABO to help students, educators, institutions and collaborative teams learn, communicate, brainstorm and create together.

---

## What is COLLABO?

COLLABO is evolving from a collaborative whiteboard into a complete collaborative learning ecosystem.

The vision is to provide a unified environment where teachers can conduct interactive classes, students can collaborate in real time, teams can work on shared visual workspaces, and AI can assist with understanding and organizing information.

Instead of relying on disconnected tools for classroom communication, brainstorming, learning resources and collaboration, COLLABO aims to bring these experiences together.

## Product Vision

COLLABO is built around three core pillars.

### 1. COLLABO Rooms — Virtual Classrooms

A real-time classroom experience designed for educational institutions.

Planned capabilities:

- Voice-only virtual classrooms.
- Target capacity of 250+ participants.
- Hybrid lecture and interactive classroom modes.
- Host and co-host controls.
- Participant admission and waiting rooms.
- Raise-hand functionality and speaking queues.
- Classroom chat, polls and Q&A.
- Screen sharing.
- Attendance management.
- Classroom scheduling and access permissions.

The classroom experience will support both large lectures and smaller interactive learning sessions.

### 2. COLLABO Workspace — Collaborative Whiteboard

An evolving collaborative visual workspace built around the existing whiteboard foundation.

Planned capabilities:

- Real-time multi-user whiteboard editing.
- Visual brainstorming and mind mapping.
- Sticky notes, shapes and diagrams.
- Object management and layers.
- Image upload and paste support.
- PDF and learning-resource integration.
- Board sharing and permissions.
- Classroom-integrated collaboration.
- Persistent cloud storage.

The existing whiteboard implementation is an important foundation and will be preserved and evaluated before architectural changes are made.

### 3. COLLABO Intelligence — AI-Assisted Learning

An AI-powered learning and productivity layer.

Planned capabilities:

- AI-generated mind maps.
- Lecture summaries and recaps.
- Board-aware question answering.
- Image explanation.
- Automatic board organization.
- Quiz generation.
- Flashcards.
- Learning-resource assistance.

AI-generated modifications to shared workspaces should be structured, validated and previewable before being applied.

The AI architecture will remain provider-agnostic to allow future integration with different AI models and inference providers.

---

## Target Audience

COLLABO is primarily designed for educational institutions.

- **Institutions:** Manage departments, courses, teachers, students and collaborative learning environments.
- **Teachers:** Conduct virtual classes, share resources and manage student participation.
- **Students:** Attend classes, collaborate on whiteboards and use AI-assisted learning tools.
- **Independent Users:** Create accounts and use supported collaboration features without requiring institutional membership.
- **Project Teams:** Brainstorm, visualize ideas and collaborate on shared workspaces.

The identity model will support both open individual accounts and institution-managed workspaces.

---

## Architecture Direction

COLLABO is being designed with modularity, maintainability and future scalability in mind.

The initial architectural direction is a **modular monolith**, with independently testable applications and packages inside a single repository.

### Core architectural components

| Component | Responsibility | Proposed technology |
|---|---|---|
| Web Application | Main product interface | Next.js, React, TypeScript |
| Whiteboard | Interactive visual workspace | Existing React Konva foundation |
| Realtime Control | Presence, room state and live events | Socket.IO |
| Media Infrastructure | Voice and screen sharing | WebRTC + SFU |
| Database | Persistent application data | PostgreSQL / Supabase |
| Authentication | User and institutional identity | Supabase Auth, subject to audit |
| AI Orchestration | AI-powered learning features | Provider-agnostic architecture |

LiveKit is an initial candidate for the media infrastructure and will be evaluated before adoption.

### Three architectural planes

**Control Plane**

Manages room state, participant presence, permissions, chat, polls, Q&A and classroom events.

**Media Plane**

Handles real-time voice and screen-sharing media through WebRTC and an SFU.

**Data Plane**

Manages users, institutions, courses, classrooms, attendance, boards, resources and AI-generated artifacts.

These are architectural directions, not claims that all these systems have already been implemented.

---

## Technology Foundation

The existing repository has been built around the following technology foundation:

| Technology | Purpose |
|---|---|
| Next.js | Web application framework |
| React | Component-based user interface |
| TypeScript | Static typing and developer safety |
| Tailwind CSS | Styling and responsive design |
| React Konva | Canvas and whiteboard rendering |
| Supabase | Database and backend integration foundation |
| PostgreSQL | Relational data storage |

The exact implementation status, dependencies and architecture are being verified during the repository re-audit.

New technologies will be introduced only when justified by actual product requirements.

---

## Current Development Stage

<badge> M0 — Repository Re-audit </badge>

COLLABO is undergoing a product and architecture redesign.

The existing collaborative whiteboard repository is being evaluated before the larger platform is developed.

**Current priority: Understand and preserve before rebuilding.**

The initial engineering milestone focuses on:

- Auditing the existing source code and repository structure.
- Verifying the implementation status of existing features.
- Reviewing the whiteboard architecture.
- Assessing backend APIs and database migrations.
- Reviewing authentication and authorization.
- Identifying technical debt and documentation inconsistencies.
- Evaluating the proposed modular monorepo structure.
- Establishing a safe migration and preservation strategy.

No major architectural restructuring or new product implementation should begin until the audit has been reviewed and approved.

### Development Principles

1. Preserve existing working functionality.
2. Understand existing implementations before replacing them.
3. Build incrementally rather than generating the entire product at once.
4. Prefer maintainable architecture over unnecessary complexity.
5. Test changes before considering them complete.
6. Document important engineering decisions.
7. Keep the application modular and independently testable.
8. Prioritize security, privacy and institutional data isolation.

---

## Development Philosophy

COLLABO is being developed using a **human-led, AI-assisted engineering approach**.

AI coding agents are used to accelerate development, explore technical solutions and assist with implementation.

However, every meaningful change should remain understandable, reviewable and testable by the developer.

The development workflow follows:

1. Understand the requirement.
2. Inspect the existing implementation.
3. Explain the proposed technical approach.
4. Implement a small, controlled change.
5. Review the generated code.
6. Execute relevant tests.
7. Verify the functionality.
8. Update documentation.
9. Commit the verified changes.

The goal is not simply to generate software, but to build a maintainable product while developing real software-engineering knowledge.

---

## Project Roadmap

COLLABO will be developed through structured engineering milestones.

| Milestone | Focus |
|---|---|
| M0 | Existing repository audit and preservation |
| M0.5 | Repository strategy and modular architecture |
| M1 | Revised product requirements and architecture |
| M1.5 | Developer documentation and contributor onboarding |
| M2 | Application modularization and shared foundations |
| M3 | Authentication and institutional workspaces |
| M4 | Classroom management and scheduling |
| M5 | Realtime control infrastructure |
| M6 | Voice communication and SFU integration |
| M7 | Screen sharing and classroom interaction |
| M8 | Collaborative whiteboard transformation |
| M9 | AI-assisted learning and collaboration |
| M10 | Security, scalability, testing and production readiness |

Each milestone will have defined requirements, implementation tasks, acceptance criteria, tests and learning objectives.

---

## Repository Strategy

The initial development strategy is to maintain a single modular monorepo.

The proposed repository structure will separate applications, reusable packages, documentation and tests.

```text
collabo/
├── apps/
│   ├── web/
│   ├── realtime/
│   └── worker/
│
├── packages/
│   ├── whiteboard/
│   ├── voice/
│   ├── ai/
│   ├── database/
│   ├── auth/
│   ├── shared/
│   └── ui/
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── engineering/
│   ├── decisions/
│   ├── onboarding/
│   ├── learning/
│   └── operations/
│
├── tests/
├── scripts/
├── AGENTS.md
├── README.md
└── package.json
```

This is the intended direction, not the current verified directory structure. The final structure will be decided after M0.

---

## Documentation

Project documentation is maintained inside `docs/`.

The documentation system will cover:

- Product requirements and user journeys.
- System architecture and technical decisions.
- Database and realtime architecture.
- Development setup and coding standards.
- Testing and deployment.
- Contributor onboarding.
- Antigravity and AI coding-agent instructions.
- Engineering learning notes and technical explanations.
- Troubleshooting and operational procedures.

### Future Contributor Experience

COLLABO aims to make it possible for new developers to join the project and continue development using their own AI coding environments.

A contributor should be able to clone the repository, open it in an AI coding agent, follow the onboarding documentation and understand the relevant architecture without relying on the original developer's chat history.

Documentation must reflect the actual implementation and evolve alongside the codebase.

---

## Prerequisites

Before running the existing project locally, ensure you have:

- **Node.js:** `v20.x` or later.
- **npm:** `v10.x` or later.
- **Git:** Installed and configured.

The versions and setup instructions will be verified against the current repository during M0.

## Getting Started Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Mayank32935M/Collabo.git
cd Collabo
```

### 2. Configure Environment Variables

Copy the example environment file:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux**

```bash
cp .env.example .env.local
```

Populate the required values according to the project's configuration.

Never commit actual credentials, API keys or secrets.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

The existing project README documents the following commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

Refer to `package.json` for the actual current scripts.

---

## Contributing

COLLABO welcomes future contributors interested in collaborative learning, real-time systems, web development and AI-assisted education.

Before contributing:

1. Read the project README and root `AGENTS.md`.
2. Review the relevant product and architecture documentation.
3. Understand the module you intend to modify.
4. Follow the established coding standards.
5. Keep changes focused and reviewable.
6. Add or update relevant tests.
7. Update documentation when behaviour or architecture changes.
8. Submit changes through a reviewable pull request.

AI coding agents should follow the same engineering standards as human contributors.

Never make destructive changes, rewrite Git history or modify applied database migrations without explicit approval.

---

## Project Status

COLLABO is an actively evolving project.

The current priority is establishing a verified technical foundation and a sustainable development workflow before expanding into the complete collaborative learning platform.

**Built with the vision of making collaboration, teaching and learning more connected.**

> **COLLABO — Think together. Build ideas together.**