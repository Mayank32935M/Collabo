"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { BoardHeader } from "@/components/board/BoardHeader";
import { CanvasToolbar } from "@/components/board/CanvasToolbar";
import { CanvasStateHUD } from "@/components/board/CanvasStateHUD";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import {
  CANVAS_TOOLS,
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
  // Milestone 5: History stack & LocalStorage persistence hook
  const {
    elements,
    setElementsLive,
    commitElements,
    undo,
    redo,
    clearCanvas,
    canUndo,
    canRedo,
    isHydrated,
  } = useCanvasHistory(roomId);

  // Selected element ID for Transformer manipulation
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Toolbar & drawing attributes state
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    activeTool: "select",
    activeColor: "#6366f1",
    strokeWidth: 4,
  });

  const [lastAction, setLastAction] = useState<string>("Select tool active");

  const handleToolChange = (tool: CanvasTool) => {
    const def = CANVAS_TOOLS.find((t) => t.id === tool);
    setToolbarState((prev) => ({ ...prev, activeTool: tool }));
    setLastAction(`Tool: ${def?.label || tool}`);
    if (tool !== "select") {
      setSelectedId(null);
    }
  };

  const handleColorChange = (color: string) => {
    setToolbarState((prev) => ({ ...prev, activeColor: color }));
    setLastAction(`Color: ${color}`);
  };

  const handleStrokeWidthChange = (width: StrokeWidth) => {
    setToolbarState((prev) => ({ ...prev, strokeWidth: width }));
    setLastAction(`Thickness: ${width}px`);
  };

  const handleUndo = () => {
    undo();
    setSelectedId(null);
    setLastAction("Undo action");
  };

  const handleRedo = () => {
    redo();
    setSelectedId(null);
    setLastAction("Redo action");
  };

  const handleClear = () => {
    if (elements.length === 0) return;
    if (window.confirm(`Clear all ${elements.length} elements from this board?`)) {
      clearCanvas();
      setSelectedId(null);
      setLastAction("Board cleared");
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
          selectedId={selectedId}
          canUndo={canUndo}
          canRedo={canRedo}
          lastAction={lastAction}
          onClearCanvas={handleClear}
        />

        {/* Floating Interactive Canvas Toolbar */}
        <CanvasToolbar
          state={toolbarState}
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onStrokeWidthChange={handleStrokeWidthChange}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* First-time Drawing Guidance Watermark (fades when elements exist) */}
        {isHydrated && elements.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="max-w-md rounded-3xl border border-dashed border-indigo-200 bg-white/80 p-6 text-center backdrop-blur-xs shadow-sm">
              <span className="text-3xl">🎨</span>
              <h2 className="mt-2 text-base font-bold text-slate-800">
                Interactive Whiteboard Ready
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Draw with the <strong className="text-indigo-600">Pen (P)</strong> or place shapes with{" "}
                <strong className="text-indigo-600">Rectangle (R)</strong>,{" "}
                <strong className="text-indigo-600">Circle (C)</strong>, or{" "}
                <strong className="text-indigo-600">Sticky Note (S)</strong>.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span>Undo: <kbd className="font-mono font-bold text-slate-700">Ctrl+Z</kbd></span>
                <span>&bull;</span>
                <span>Resize: <kbd className="font-mono font-bold text-slate-700">Select (V)</kbd></span>
                <span>&bull;</span>
                <span>Auto-saved locally</span>
              </div>
            </div>
          </div>
        )}

        {/* Konva 2D Canvas Stage */}
        <CanvasStage
          elements={elements}
          onElementsChange={setElementsLive}
          onCommitElements={commitElements}
          toolbarState={toolbarState}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
        />
      </main>
    </div>
  );
};
