# Coding Standards & Best Practices — COLLABO

> **Document Status:** Approved (Milestone M1.5 Specification)  
> **Target Audience:** All Engineers and Contributors Writing Code in COLLABO

---

## 1. TypeScript Standards

All code in COLLABO is written in TypeScript under strict typechecking.

### Rule 1: No `any`
Never use `any`. Use `unknown`, proper generics, or union types with type narrowing:
```ts
// ❌ Bad
const handleData = (payload: any) => { ... }

// ✅ Good
const handleData = (payload: unknown) => {
  if (typeof payload === "object" && payload !== null && "roomId" in payload) {
    // TypeScript now knows payload has a roomId property
  }
}
```

### Rule 2: Explicit Return Types on Exported Functions
All exported functions, custom hooks, and Next.js route handlers must declare their return types explicitly:
```ts
// ✅ Good
export function useCanvasHistory(roomId: string): CanvasHistoryHook { ... }

export async function GET(
  request: Request,
  context: RouteContext
): Promise<NextResponse<BoardApiResponse>> { ... }
```

### Rule 3: Single Source of Truth for Shared Contracts
Types used across both frontend and backend (e.g. `CanvasElement`, `BoardRecord`, `ToolDefinition`) must live in [`packages/shared/`](file:///d:/Projects/Collabo/packages/shared/). Never duplicate type interfaces across applications.

---

## 2. React 19 & Next.js App Router Conventions

### Rule 1: Server Components by Default, Client Components at the Leaves
In Next.js App Router, components are Server Components by default. 
* Keep data fetching, page layouts, and metadata on the server.
* Only add `"use client"` when the component requires browser APIs (`window`, `localStorage`), React state (`useState`, `useReducer`), event listeners, or Konva canvas mounting.

### Rule 2: Dynamic Canvas Mounting
Because React Konva renders to HTML5 Canvas (which requires browser DOM elements), never import `CanvasStage` statically in SSR pages. Always use `next/dynamic` with `ssr: false`:
```tsx
const CanvasStage = dynamic(() => import("@/components/board/CanvasStage"), {
  ssr: false,
  loading: () => <CanvasLoadingIndicator />,
});
```

### Rule 3: Hook Colocation & Single Responsibility
Avoid monolithic "mega-hooks". Break complex behavior into focused custom hooks:
* `useCanvasHistory`: Local undo/redo stack & SWR storage reconciliation.
* `useSocketRoom`: Socket.IO connection and presence signaling.
* `useLiveKitVoice`: Microphone publishing and audio subscription.

---

## 3. Styling & Tailwind CSS Conventions

### Rule 1: Use Semantic Color Tokens
Adhere to the COLLABO playful, student-friendly color palette:
* **Primary / Brand:** Indigo (`text-indigo-600`, `bg-indigo-50`, `ring-indigo-300`).
* **Success / Live:** Emerald (`text-emerald-600`, `bg-emerald-500`).
* **Warning / Alert:** Amber (`text-amber-600`, `bg-amber-100`).
* **Danger / Eraser:** Rose (`text-rose-600`, `bg-rose-50`).
* **Neutrals:** Slate (`text-slate-800`, `border-slate-200`).

### Rule 2: Focus Rings for Keyboard Accessibility
Every interactive button, input, or toolbar item must provide high-visibility focus states:
```tsx
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
```

---

## 4. File & Symbol Naming Conventions

| Item | Convention | Example |
|---|---|---|
| **React Components** | `PascalCase.tsx` | `CanvasStage.tsx`, `BoardWorkspace.tsx` |
| **Custom Hooks** | `useCamelCase.ts` | `useCanvasHistory.ts`, `useSpeakingQueue.ts` |
| **Utility Files** | `kebab-case.ts` | `coordinate-math.ts`, `format-time.ts` |
| **TypeScript Types** | `PascalCase` | `CanvasElement`, `SessionParticipant` |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_HISTORY_STEPS`, `CANVAS_TOOLS` |
| **Database Tables** | `snake_case_plural` | `classroom_sessions`, `session_boards` |

