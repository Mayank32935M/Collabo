# ADR-004: Database Persistence and Institutional Identity

> **Status:** Approved  
> **Date:** October 31, 2026  
> **Deciders:** Lead Developer, Principal Architect  
> **Context Milestone:** M0.5 — Monorepo Strategy & Architecture Decisions

---

## 1. Context and Problem Statement

COLLABO is evolving from an open whiteboard used by anonymous teams into an institutional learning platform.

It must support two concurrent user models:
1. **Open / Independent Users:** Students and hackathon teams who create individual accounts, launch temporary study rooms, and manage personal boards without institutional enrollment.
2. **Institutional Workspaces:** Universities, colleges, and schools that organize departments, courses, teachers, students, and scheduled classroom sessions with role-based access control.

Furthermore, we must preserve all existing board data and avoid breaking changes to the existing PostgreSQL migration [20261030000001_create_boards_table.sql](file:///d:/Projects/Collabo/supabase/migrations/20261030000001_create_boards_table.sql).

---

## 2. Decision Drivers

* **Data Preservation:** Applied database migrations must not be modified destructively. Existing `boards` records must remain valid.
* **Separation of Concerns:** Institutional organizational roles (Dean, Dept Admin, Instructor, Student) must remain distinct from in-session classroom roles (Host, Co-host, Speaker, Attendee).
* **Zero-Lockout for Independent Users:** An individual user must never be forced to belong to an institution to create and share a whiteboard.
* **Row-Level Security (RLS):** Data access must be enforced securely at the database layer in PostgreSQL.

---

## 3. Decision Outcome

**Chosen Strategy: Supabase PostgreSQL with Hybrid Open/Institutional Identity Schema.**

We retain **Supabase / PostgreSQL** as the core database engine:
1. **Existing Tables Preserved:**
   - Table `boards` remains the primary storage for standalone whiteboards and session-linked whiteboards.
   - Future migrations add additive relational tables without altering `boards`.
2. **New Institutional Schema (to be landed in Milestone M3):**
   ```sql
   -- Conceptual Entity Hierarchy
   institutions
     └── departments
           └── courses
                 ├── course_enrollments (teachers & students)
                 └── classrooms
                       └── classroom_sessions (session_boards link to boards)
   ```
3. **Session vs. Institutional Role Separation:**
   - An *Institution Admin* has configuration privileges over departments, but does not automatically possess *Host* permissions inside an ongoing academic lecture unless granted.
   - A *Teacher* has course-management rights, and automatically becomes *Host* when launching a scheduled classroom session.
   - *Students* join classroom sessions as *Attendees* with read/listen permissions, elevating to *Speaker* upon mic grant.
4. **Migration Strategy:**
   - All migrations are tracked chronologically in `supabase/migrations/`.
   - Never run `DROP TABLE` or destructive modifications on production or baseline migrations.
