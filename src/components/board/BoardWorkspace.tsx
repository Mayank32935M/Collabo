"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BoardHeader } from "@/components/board/BoardHeader";
import { CanvasToolbar } from "@/components/board/CanvasToolbar";
import { CanvasStateHUD } from "@/components/board/CanvasStateHUD";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CANVAS_TOOLS, CanvasTool, StrokeWidth, ToolbarState } from "@/types/canvas";

export interface BoardWorkspaceProps {
  roomId: string;
}

export const BoardWorkspace: React.FC<BoardWorkspaceProps> = ({ roomId }) => {
  // Core toolbar state driving upcoming canvas interactions
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    activeTool: "select",
    activeColor: "#6366f1",
    strokeWidth: 4,
  });

  const [lastAction, setLastAction] = useState<string>("Initialized (Select tool active)");

  const handleToolChange = (tool: CanvasTool) => {
    const def = CANVAS_TOOLS.find((t) => t.id === tool);
    setToolbarState((prev) => ({ ...prev, activeTool: tool }));
    setLastAction(`Tool switched to ${def?.label} (${def?.shortcut})`);
  };

  const handleColorChange = (color: string) => {
    setToolbarState((prev) => ({ ...prev, activeColor: color }));
    setLastAction(`Color changed to ${color}`);
  };

  const handleStrokeWidthChange = (width: StrokeWidth) => {
    setToolbarState((prev) => ({ ...prev, strokeWidth: width }));
    setLastAction(`Stroke thickness set to ${width}px`);
  };

  const activeToolDef = CANVAS_TOOLS.find((t) => t.id === toolbarState.activeTool);

  // Dynamic cursor based on active tool
  const getCursorClass = () => {
    switch (toolbarState.activeTool) {
      case "select":
        return "cursor-default";
      case "pen":
      case "rectangle":
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

      {/* Main Interactive Canvas Mounting Shell */}
      <main className="relative flex-1 overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] flex items-center justify-center p-6 select-none">
        {/* Floating Canvas State Inspector HUD */}
        <CanvasStateHUD state={toolbarState} lastAction={lastAction} />

        {/* Floating Interactive Canvas Toolbar */}
        <CanvasToolbar
          state={toolbarState}
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onStrokeWidthChange={handleStrokeWidthChange}
        />

        {/* Milestone 3 Interactive Learning Card */}
        <div className="relative z-10 max-w-xl w-full rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-md text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner border transition-all duration-200"
            style={{
              backgroundColor: `${toolbarState.activeColor}15`,
              borderColor: `${toolbarState.activeColor}40`,
              color: toolbarState.activeColor,
            }}
          >
            <span className="text-3xl">
              {toolbarState.activeTool === "select" && "👆"}
              {toolbarState.activeTool === "pen" && "✏️"}
              {toolbarState.activeTool === "rectangle" && "⬜"}
              {toolbarState.activeTool === "sticky" && "📝"}
              {toolbarState.activeTool === "text" && "🔤"}
              {toolbarState.activeTool === "eraser" && "🧹"}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="indigo" size="sm" dot>
              Milestone 3 Live
            </Badge>
            <Badge variant="slate" size="sm">
              Active Tool: {activeToolDef?.label} ({activeToolDef?.shortcut})
            </Badge>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Interactive Canvas Toolbar Active
          </h1>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Try clicking the floating toolbar at the bottom, or press{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono text-slate-800">V</kbd>,{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono text-slate-800">P</kbd>,{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono text-slate-800">R</kbd>,{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono text-slate-800">S</kbd>,{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono text-slate-800">T</kbd>,{" "}
            <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono text-slate-800">E</kbd>{" "}
            on your keyboard. The cursor, state HUD, and palette synchronize immediately without page reloads.
          </p>

          {/* Educational Inspector Box */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              React State Verification
            </h2>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <dt className="text-slate-400">Selected Tool</dt>
                <dd className="font-mono font-semibold text-indigo-700">
                  {toolbarState.activeTool}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <dt className="text-slate-400">Active Color</dt>
                <dd className="font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full inline-block"
                    style={{ backgroundColor: toolbarState.activeColor }}
                  />
                  {toolbarState.activeColor}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <dt className="text-slate-400">Stroke Width</dt>
                <dd className="font-mono font-semibold text-slate-800">
                  {toolbarState.strokeWidth}px
                </dd>
              </div>
            </dl>
          </div>

          {/* Navigation & Next Step Teaser */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                &larr; Back to Home
              </Button>
            </Link>
            <Link href="/board/hackathon-sprint" className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                Try Room #hackathon-sprint
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-[11px] text-slate-400">
            Coming in Milestone 4: HTML5 2D Canvas &amp; React Konva Engine integration
          </p>
        </div>
      </main>
    </div>
  );
};
