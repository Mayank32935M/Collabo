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

---

*(Future milestone entries will be appended here as we progress through the implementation plan.)*
