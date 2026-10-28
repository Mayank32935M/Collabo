"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { BoardHeader } from "@/components/board/BoardHeader";
import { CanvasToolbar } from "@/components/board/CanvasToolbar";
import { CanvasStateHUD } from "@/components/board/CanvasStateHUD";
import {
  CANVAS_TOOLS,
  CanvasElement,
  CanvasTool,
  StrokeWidth,
  ToolbarState,
} from "@/types/canvas";

// Dynamically import CanvasStage with ssr: false so Konva never attempts to mount on the server
const CanvasStage = dynamic(
  () => import("@/components/board/CanvasStage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 backdrop-blur-md">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping" />
          Mounting Konva 2D Canvas Engine...
        </div>
      </div>
    ),
  }
);

export interface BoardWorkspaceProps {
  roomId: string;
}

export const BoardWorkspace: React.FC<BoardWorkspaceProps> = ({ roomId }) => {
  // In-memory array of canvas elements (Step 4 foundation)
  const [elements, setElements] = useState<CanvasElement[]>([]);

  // Toolbar & drawing attributes state
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    activeTool: "pen",
    activeColor: "#6366f1",
    strokeWidth: 4,
  });

  const [lastAction, setLastAction] = useState<string>("Ready to draw (Pen tool)");

  const handleToolChange = (tool: CanvasTool) => {
    const def = CANVAS_TOOLS.find((t) => t.id === tool);
    setToolbarState((prev) => ({ ...prev, activeTool: tool }));
    setLastAction(`Tool: ${def?.label || tool}`);
  };

  const handleColorChange = (color: string) => {
    setToolbarState((prev) => ({ ...prev, activeColor: color }));
    setLastAction(`Color: ${color}`);
  };

  const handleStrokeWidthChange = (width: StrokeWidth) => {
    setToolbarState((prev) => ({ ...prev, strokeWidth: width }));
    setLastAction(`Thickness: ${width}px`);
  };

  const handleClearCanvas = () => {
    if (elements.length === 0) return;
    if (window.confirm(`Clear all ${elements.length} elements from this board?`)) {
      setElements([]);
      setLastAction("Canvas cleared");
    }
  };

  // Dynamic cursor feedback based on tool
  const getCursorClass = () => {
    switch (toolbarState.activeTool) {
      case "select":
        return "cursor-default";
      case "pen":
      case "rectangle":
      case "circle":
      case "sticky":
        return "cursor-crosshair";
      case "text":
        return "cursor-text";
      case "eraser":
        return "cursor-not-allowed";
      default:
        return "cursor-default";
    }
  };

  return (
    <div className={`flex h-screen flex-col bg-slate-100 overflow-hidden ${getCursorClass()}`}>
      {/* Board Navigation Header */}
      <BoardHeader roomId={roomId} initialTitle={`${roomId} Board`} />

      {/* Main Board Workspace Shell */}
      <main className="relative flex-1 overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] select-none">
        {/* Floating Canvas State Inspector HUD */}
        <CanvasStateHUD
          state={toolbarState}
          elementCount={elements.length}
          lastAction={lastAction}
          onClearCanvas={handleClearCanvas}
        />

        {/* Floating Interactive Canvas Toolbar */}
        <CanvasToolbar
          state={toolbarState}
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onStrokeWidthChange={handleStrokeWidthChange}
        />

        {/* First-time Drawing Guidance Watermark (fades when elements exist) */}
        {elements.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="max-w-md rounded-3xl border border-dashed border-indigo-200 bg-white/70 p-6 text-center backdrop-blur-xs shadow-sm">
              <span className="text-3xl">🎨</span>
              <h2 className="mt-2 text-base font-bold text-slate-800">
                Konva Canvas Stage Ready
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Click and drag anywhere to draw freehand paths with the{" "}
                <strong className="text-indigo-600">Pen (P)</strong>, create geometric boxes with the{" "}
                <strong className="text-indigo-600">Rectangle (R)</strong> or{" "}
                <strong className="text-indigo-600">Circle (C)</strong> tool, or switch to the{" "}
                <strong className="text-indigo-600">Sticky Note (S)</strong> tool.
              </p>
            </div>
          </div>
        )}

        {/* Konva 2D Canvas Stage */}
        <CanvasStage
          elements={elements}
          onElementsChange={setElements}
          toolbarState={toolbarState}
        />
      </main>
    </div>
  );
};