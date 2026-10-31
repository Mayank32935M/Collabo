# ADR-001: Modular Monorepo Architecture

> **Status:** Approved  
> **Date:** October 31, 2026  
> **Deciders:** Lead Developer, Principal Architect  
> **Context Milestone:** M0.5 — Monorepo Strategy & Workspace Decision

---

## 1. Context and Problem Statement

COLLABO is expanding from a single Next.js whiteboard web application into a complete institutional collaboration platform comprising:
- A web client application (Next.js 16).
- A stateful real-time control plane server (Node.js + Socket.IO) for room presence, speaking queues, and chat.
- A reusable collaborative whiteboard engine (React Konva).
- Shared database models, validation schemas, and authentication policies.

Managing these components across multiple distinct Git repositories would create high coordination friction for a solo developer: separate CI pipelines, cross-repo pull requests, desynchronized TypeScript contracts, and fragmented issue tracking.

We need a unified repository structure that maintains a single source of truth while enforcing clean architectural boundaries between deployable applications and reusable packages.

---

## 2. Decision Drivers

* **Single Source of Truth:** One commit history, one issue tracker, and atomic multi-package updates.
* **Solo Developer Velocity:** Minimal tooling overhead; easy local development setup (`pnpm dev`).
* **Decoupled Architecture:** Prevent tight coupling between the frontend UI and backend services so that packages (e.g. `@collabo/whiteboard`) can be tested and developed independently.
* **Independent Deployability:** Next.js can be deployed to Vercel/serverless, while the real-time Socket.IO server can be deployed to a persistent container runtime (e.g. Railway or Render).

---

## 3. Considered Options

* **Option A: Multi-Repository Approach** (Separate repos for `collabo-web`, `collabo-realtime`, `collabo-whiteboard`).
* **Option B: Modular Monolith inside Next.js** (Organizing code purely in folders like `src/modules/*` within a single Next.js project).
* **Option C (Selected): Modular Monorepo with Workspaces** (`apps/*` and `packages/*` orchestrated by `pnpm`).

---

## 4. Decision Outcome

**Chosen Option: Option C — Modular Monorepo with Workspaces.**

We will organize COLLABO into a structured monorepo using **pnpm workspaces**:

```
collabo/
│
├── apps/
│   ├── web/                     # Next.js 16 Web Application & Student/Teacher Portal
│   ├── realtime/                # Dedicated Node.js + Socket.IO Real-time Control Server
│   └── worker/                  # Background jobs (AI summarization, exports)
│
├── packages/
│   ├── whiteboard/              # React Konva 2D whiteboard canvas & UI components
│   ├── voice/                   # WebRTC / LiveKit client hooks & audio controls
│   ├── ai/                      # Provider-agnostic AI orchestration (Gemini API)
│   ├── database/                # Supabase client, migrations, generated DB types
│   ├── auth/                    # Institutional RBAC & permission checking
│   └── shared/                  # Common TypeScript interfaces & validation schemas (Zod)
│
├── supabase/
│   ├── migrations/              # Additive PostgreSQL migrations
│   └── seed/                    # Development seed fixtures
│
├── docs/                        # Complete engineering documentation suite
├── tests/                       # Cross-package end-to-end test suites
├── pnpm-workspace.yaml          # Monorepo workspace definition
└── package.json                 # Monorepo root scripts & tooling
```

---

## 5. Pros and Cons of Chosen Option

### Advantages
* **Strict Package Boundaries:** Clean package boundaries prevent accidental circular dependencies (e.g., the whiteboard package cannot import server-only database code).
* **Shared Types with Zero Build Step:** Using workspace package references (`@collabo/shared`, `@collabo/database`), frontend and backend share exact TypeScript types.
* **Independent Deployment Targets:**
  - `apps/web` deploys to Vercel.
  - `apps/realtime` deploys to Railway or Render.
* **Atomic Changes:** Refactoring an element data model updates the canvas, database, and real-time server in a single commit.

### Trade-offs & Mitigations
* **Workspace Setup Complexity:** Monorepos require understanding pnpm workspace protocols (`workspace:*`) and tsconfig path aliases.
  * *Mitigation:* Document package conventions thoroughly in `docs/engineering/DEVELOPMENT_SETUP.md`.
* **Lockfile Management:** On Windows, pnpm package operations should be executed cleanly to avoid permission conflicts.
  * *Mitigation:* Follow standardized pnpm scripts in root `package.json`.

---

## 6. Implementation Notes

1. Root package manager: `pnpm` (version 10+).
2. Workspace configuration file: `pnpm-workspace.yaml`.
3. Package naming convention: `@collabo/<package-name>` (e.g. `@collabo/whiteboard`, `@collabo/shared`).
4. Incremental transition: Move existing `src/` code into `apps/web` and `packages/whiteboard` without modifying core canvas rendering behavior.

