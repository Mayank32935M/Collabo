# Troubleshooting Runbook & Diagnostics — COLLABO

> **Document Status:** Approved (Milestone M1.5 Specification)  
> **Target Audience:** All Developers, DevOps, and Support Engineers

---

## 1. Local Development Server Issues

### Issue 1: Port Conflict (`EADDRINUSE: address already in use :::3000` or `:::4000`)
* **Symptom:** Running `pnpm dev` or `pnpm dev:realtime` throws `EADDRINUSE`.
* **Root Cause:** A previous Node.js process crashed or was backgrounded without releasing its bound port.
* **Resolution:**
  ```powershell
  # Windows (PowerShell) - Kill port 3000:
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

  # Windows (PowerShell) - Kill port 4000:
  Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force

  # macOS / Linux:
  lsof -ti :3000 | xargs kill -9
  lsof -ti :4000 | xargs kill -9
  ```

---

### Issue 2: Next.js Turbopack Panic on Windows (`node process exited with code: 0`)
* **Symptom:** Running `next build` fails with `FATAL: An unexpected Turbopack error occurred. Failed to write app endpoint /page`.
* **Root Cause:** In Next.js 16 with Tailwind CSS v4 on Windows, Turbopack child workers evaluating `@tailwindcss/turbopack` can disconnect unexpectedly.
* **Resolution:** Execute production builds using the standard webpack engine:
  ```bash
  pnpm --filter @collabo/web exec next build --webpack
  ```

---

### Issue 3: Windows `EPERM: operation not permitted, mkdir` on `.next`
* **Symptom:** `Error: EPERM: operation not permitted, mkdir '...\.next\...'` during build or prerendering.
* **Root Cause:** Windows Antivirus or an existing dev server process locked files in the `.next` directory.
* **Resolution:**
  1. Stop any running dev servers (`Ctrl+C`).
  2. Remove the cached `.next` directory:
     ```powershell
     Remove-Item -Recurse -Force apps\web\.next
     ```
  3. Re-run `pnpm dev` or `pnpm build`.

---

## 2. Package Management & Monorepo Issues

### Issue 4: `ERR_PNPM_IGNORED_BUILDS`
* **Symptom:** `pnpm install` halts with `Ignored build scripts: esbuild, unrs-resolver`.
* **Root Cause:** pnpm v10+ blocks native post-install build scripts by default to protect against supply-chain attacks.
* **Resolution:** Approve build scripts across the workspace:
  ```bash
  pnpm approve-builds --all
  pnpm install
  ```

---

## 3. Database & Real-Time Connection Issues

### Issue 5: Supabase API Returns `storageSource: "memory-fallback"`
* **Symptom:** HUD displays `LocalStorage` or `memory-fallback` rather than `PostgreSQL`.
* **Root Cause:** Supabase credentials in `apps/web/.env.local` are either missing or still contain the placeholder string `"your-project"`.
* **Resolution:**
  1. Verify `apps/web/.env.local` contains valid credentials:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=https://your-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=actual-token
     ```
  2. Restart `pnpm dev` so Next.js re-reads environment variables.

---

### Issue 6: Socket.IO Connection Refused (`GET http://localhost:4000/socket.io/ net::ERR_CONNECTION_REFUSED`)
* **Symptom:** Browser console logs connection errors when trying to connect to the control plane.
* **Root Cause:** `apps/realtime` is not running.
* **Resolution:** Start the real-time server in a separate terminal:
  ```bash
  pnpm dev:realtime
  ```

