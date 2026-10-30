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

---

*(Future milestone entries will be appended here as we progress through the implementation plan.)*
