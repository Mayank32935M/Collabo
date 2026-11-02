# Local Development Setup Guide — COLLABO

> **Document Status:** Approved (Milestone M1.5 Specification)  
> **Target Audience:** All Engineers and Contributors Setting Up Their Local Machine

---

## 1. System Prerequisites

Ensure the following tools are installed on your workstation:

| Tool | Required Version | Verification Command | Notes |
|---|---|---|---|
| **Node.js** | `>= 20.x` (Recommended: `24.x LTS`) | `node -v` | JavaScript runtime environment. |
| **pnpm** | `>= 10.x` (Recommended: `12.x`) | `pnpm -v` | Fast, isolated monorepo package manager. |
| **Git** | `>= 2.30` | `git -v` | Version control. |
| **Browser** | Chrome, Edge, or Firefox | Latest | Chrome or Chromium recommended for DevTools canvas profiling. |

---

## 2. Initial Setup Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/Mayank32935M/Collabo.git
cd Collabo
```

### Step 2: Switch to the Active Redesign Branch
```bash
git checkout redesign/product-architecture
```

### Step 3: Install Dependencies Across the Monorepo
```bash
pnpm install
```

> **Note on Windows / pnpm Build Scripts:**  
> If pnpm prompts about approved build scripts (e.g. for `esbuild`), run:  
> `pnpm approve-builds --all` followed by `pnpm install`.

---

## 3. Configuring Environment Variables

COLLABO includes a zero-configuration **in-memory fallback store**, meaning you can run the whiteboard and test drawing immediately **without signing up for Supabase**.

When you are ready to connect to a real PostgreSQL database:
1. Create a free project at [https://supabase.com](https://supabase.com).
2. Copy `.env.example` to create your local environment file:
   ```bash
   # In apps/web:
   cp .env.example apps/web/.env.local
   ```
3. Set your project URL and public anon key in `apps/web/.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
4. Run the SQL migration [supabase/migrations/20261030000001_create_boards_table.sql](file:///d:/Projects/Collabo/supabase/migrations/20261030000001_create_boards_table.sql) in the Supabase SQL Editor.

---

## 4. Running the Development Servers

In our monorepo, you can run individual services or launch everything concurrently:

### Option A: Run the Web App Only (Port 3000)
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000). The quick launcher will let you create or join any room (e.g. [http://localhost:3000/board/quickstart](http://localhost:3000/board/quickstart)).

### Option B: Run the Real-Time Control Plane Only (Port 4000)
```bash
pnpm dev:realtime
```
Verify the health check in your browser at [http://localhost:4000/health](http://localhost:4000/health).

### Option C: Run Everything Concurrently
```bash
pnpm dev:all
```

---

## 5. Development Verification Commands

Always run these two checks before committing code:

```bash
# 1. Typecheck: Runs tsc across packages/shared, apps/realtime, and apps/web
pnpm typecheck

# 2. Lint: Runs ESLint across all projects
pnpm lint
```

---

## 6. Troubleshooting Common Issues

### Issue 1: Port 3000 or Port 4000 Already in Use
* **Fix:** Kill the dangling process:
  ```powershell
  # On Windows (PowerShell):
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```

### Issue 2: Next.js Turbopack Panic on Windows
* In Next.js 16 with Tailwind CSS v4 on Windows, Turbopack child workers may encounter process exit issues during `next build`.
* **Fix:** Use webpack for production builds:
  ```bash
  pnpm --filter @collabo/web exec next build --webpack
  ```

