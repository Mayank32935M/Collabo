# Your First Contribution — Step-by-Step Tutorial

> **Purpose:** A hands-on, practical walkthrough designed for undergraduate developers and new contributors. In this tutorial, you will implement a new feature from start to finish: **Adding a Diamond (Decision Node) Shape to the COLLABO Whiteboard**.

---

## 1. Step 1: Branch from the Redesign Trunk

Ensure your working directory is clean and checkout a new feature branch:

```bash
git checkout redesign/product-architecture
git pull origin redesign/product-architecture
git checkout -b feat/whiteboard-diamond-shape
```

---

## 2. Step 2: Define the Type Contract

Open [`packages/shared/src/canvas.ts`](file:///d:/Projects/Collabo/packages/shared/src/canvas.ts) and add `diamond` to `CanvasTool` and `ElementType`:

```ts
// 1. Add to CanvasTool union
export type CanvasTool =
  | "select"
  | "pen"
  | "rectangle"
  | "circle"
  | "diamond" // <-- Add this
  | "sticky"
  | "text"
  | "eraser";

// 2. Add DiamondElement interface
export interface DiamondElement extends BaseElement {
  type: "diamond";
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
}

// 3. Add to CanvasElement union
export type CanvasElement =
  | PenElement
  | RectElement
  | CircleElement
  | DiamondElement // <-- Add this
  | StickyElement
  | TextElement;
```

---

## 3. Step 3: Add the Tool to the Toolbar

Open [`apps/web/src/components/board/CanvasToolbar.tsx`](file:///d:/Projects/Collabo/apps/web/src/components/board/CanvasToolbar.tsx):
1. In `CANVAS_TOOLS` (in `types/canvas.ts` or `packages/shared`), add the tool definition:
   ```ts
   {
     id: "diamond",
     label: "Diamond",
     shortcut: "D",
     icon: "diamond",
     description: "Draw decision nodes and flow branches",
   }
   ```
2. In `CanvasToolbar.tsx`, add the inline SVG icon to `ToolIcon`:
   ```tsx
   case "diamond":
     return (
       <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
         <polygon points="12,2 22,12 12,22 2,12" />
       </svg>
     );
   ```

---

## 4. Step 4: Render the Shape with React Konva

Open [`apps/web/src/components/board/CanvasStage.tsx`](file:///d:/Projects/Collabo/apps/web/src/components/board/CanvasStage.tsx):
1. Import `Line` or `Shape` from `react-konva`.
2. In the shape rendering switch block (around line 400), add the diamond renderer using a 4-point closed `Line`:
   ```tsx
   case "diamond":
     return (
       <Line
         key={el.id}
         id={el.id}
         points={[
           el.x + el.width / 2, el.y,                  // Top vertex
           el.x + el.width, el.y + el.height / 2,      // Right vertex
           el.x + el.width / 2, el.y + el.height,      // Bottom vertex
           el.x, el.y + el.height / 2                  // Left vertex
         ]}
         closed
         rotation={el.rotation || 0}
         stroke={el.color}
         strokeWidth={el.strokeWidth}
         fill={el.fill || `${el.color}15`}
         draggable={isSelectMode}
         onClick={() => handleElementClick(el.id)}
         onDragEnd={(e) => handleDragEnd(el.id, e.target.x(), e.target.y())}
         onTransformEnd={(e) => handleTransformEnd(e, el.id)}
       />
     );
   ```

---

## 5. Step 5: Verify Your Code

Run the verification commands from the project root:

```bash
# 1. Typecheck: Ensure no TypeScript mismatches exist
pnpm typecheck

# 2. Lint: Ensure code style conforms to ESLint rules
pnpm lint
```

---

## 6. Step 6: Test Manually in Browser

Start the development server:
```bash
pnpm dev
```
1. Open [http://localhost:3000/board/quickstart](http://localhost:3000/board/quickstart).
2. Press `D` on your keyboard or click the Diamond icon on the toolbar.
3. Click and drag on the canvas to draw a diamond.
4. Switch to Select tool (`V`) and drag the diamond across the canvas. Verify it moves cleanly.

---

## 7. Step 7: Commit and Push

Stage and commit using Conventional Commits format:

```bash
git add packages/shared/src/canvas.ts
git add apps/web/src/
git commit -m "feat(whiteboard): add diamond decision node shape to canvas and toolbar"
git push -u origin feat/whiteboard-diamond-shape
```

Congratulations! You have just implemented and verified your first feature in COLLABO.

