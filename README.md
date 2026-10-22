# COLLABO

> **Think together. Build ideas together.**

COLLABO is a colorful, playful real-time collaborative whiteboard engineered specifically for student study groups, hackathon teams, and college project squads.

---

## What is COLLABO?

COLLABO is a visual workspace where teams can brainstorm, map out systems, sketch user flows, place sticky notes, and plan sprints in real time. Multiple teammates can open the same board simultaneously, see each other's live cursors, create and modify canvas objects, and trust that changes are reliably saved in the cloud.

### Who is it for?
- **College Students & Study Groups**: Create visual mind maps for exam preparation and group revision.
- **Hackathon Teams**: Rapidly prototype architecture diagrams, user stories, and feature roadmaps under tight deadlines.
- **Club & Society Project Teams**: Coordinate tasks, brainstorm events, and track sprint items visually.

---

## Current Stage: Milestone 1 (Foundation Stage)

We are intentionally developing COLLABO step-by-step from the ground up, prioritizing deep software engineering understanding over rushed scaffolding.

- **Current Status**: **Step 1 — Project Foundation & Git Initialization**
- **Implemented**: Clean Next.js 16 (App Router) + TypeScript base, Tailwind CSS styling foundation, strict Git hygiene rules, safe configuration templates, and comprehensive architectural documentation.
- **Not Yet Implemented**: Canvas rendering (Konva), WebSockets/Socket.IO, database models, and user authentication. These will be implemented milestone-by-milestone.

---

## Installed Technologies (Step 1)

Only minimal, essential dependencies are installed at this stage:

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **Next.js** | React web framework & App Router structure | `^16.4.2` |
| **React** & **React DOM** | Component-driven UI library | `^19.3.0` |
| **TypeScript** | Static typing & developer safety | `^5` |
| **Tailwind CSS** | Utility-first responsive styling | `^4` |
| **ESLint** | Code quality & static analysis | `^9` |

---

## Prerequisites

Before running this project locally, ensure you have:
- **Node.js**: `v20.x` or later (tested on Node `v24.x`)
- **npm**: `v10.x` or later (tested on npm `v11.x`)
- **Git**: Installed and configured on your computer

---

## Getting Started Locally

### 1. Clone or Open the Repository
```bash
git clone <your-repository-url>
cd Collabo
```

### 2. Configure Environment Variables
Copy the provided `.env.example` file to create a local environment configuration:
```bash
# On Windows (PowerShell)
Copy-Item .env.example .env.local

# On macOS / Linux
cp .env.example .env.local
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Available Scripts

In the project root, you can run:

- `npm run dev`: Starts the local development server on port 3000 with Turbopack fast refresh.
- `npm run build`: Compiles and produces the optimized production build.
- `npm run start`: Starts the production server (requires running `npm run build` first).
- `npm run lint`: Runs ESLint to check for code quality and syntax issues.

---

## Implementation Roadmap

COLLABO is developed across 10 structured engineering milestones:

1. **Step 1 (Current)**: Project foundation, Git hygiene, and core documentation.
2. **Step 2**: Next.js App Router structure and initial user interface.
3. **Step 3**: React state management, toolbars, and interactive UI controls.
4. **Step 4**: Single-user canvas with React Konva.
5. **Step 5**: Canvas object manipulation, state history (undo/redo), and local persistence.
6. **Step 6**: Backend API and PostgreSQL database schema.
7. **Step 7**: Dedicated real-time WebSocket / Socket.IO server.
8. **Step 8**: Live multiplayer synchronization, cursor tracking, and conflict handling.
9. **Step 9**: Supabase authentication, board sharing permissions, and room security.
10. **Step 10**: End-to-end testing, security hardening, cloud deployment, and portfolio showcase.

For full technical specifications and phase details, see [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

---

## GitHub Setup Instructions

To push this repository to GitHub for the first time:

1. Create a new, **empty** repository on GitHub named `collabo` (do not initialize with README, license, or .gitignore).
2. Link your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/collabo.git
   ```
3. Set your default branch to `main`:
   ```bash
   git branch -M main
   ```
4. Push your first commit:
   ```bash
   git push -u origin main
   ```

---

## Documentation Directory

Detailed architectural and engineering documents are located in [`docs/`](./docs/):
- [`docs/PRD.md`](./docs/PRD.md) — Product Requirements Document (vision, user personas, MVP scope).
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — System architecture, real-time communication design, and deployment strategy.
- [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) — Step-by-step engineering plan with acceptance criteria.
- [`docs/LEARNING_LOG.md`](./docs/LEARNING_LOG.md) — Student learning log template for tracking engineering concepts and solutions.
