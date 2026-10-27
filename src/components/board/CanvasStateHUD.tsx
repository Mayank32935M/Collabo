"use client";

import React from "react";
import { CANVAS_TOOLS, ToolbarState } from "@/types/canvas";

export interface CanvasStateHUDProps {
  state: ToolbarState;
  lastAction?: string;
}

export const CanvasStateHUD: React.FC<CanvasStateHUDProps> = ({ state, lastAction }) => {
  const currentToolDef = CANVAS_TOOLS.find((t) => t.id === state.activeTool);

  return (
    <div className="fixed bottom-6 left-6 z-20 hidden md:block max-w-xs rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-lg shadow-slate-200/50 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span>State Inspector (Step 3)</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="mt-2.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-100">
          <span className="text-slate-500">Active Tool:</span>
          <span className="font-semibold text-indigo-700">
            {currentToolDef?.label} ({currentToolDef?.shortcut})
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-100">
          <span className="text-slate-500">Active Color:</span>
          <div className="flex items-center gap-1.5">
            <span
              className="h-3.5 w-3.5 rounded-full border border-slate-300"
              style={{ backgroundColor: state.activeColor }}
            />
            <span className="font-mono font-semibold text-slate-800">
              {state.activeColor}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-100">
          <span className="text-slate-500">Stroke Thickness:</span>
          <span className="font-semibold text-slate-800">{state.strokeWidth}px</span>
        </div>

        {lastAction && (
          <div className="flex items-center justify-between rounded-lg bg-indigo-50/70 px-2.5 py-1 text-[11px] text-indigo-800 border border-indigo-100">
            <span>Last Event:</span>
            <span className="font-medium">{lastAction}</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-[10px] text-slate-400 text-center">
        Press <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono">V</kbd>,{" "}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono">P</kbd>,{" "}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono">R</kbd>,{" "}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono">C</kbd>,{" "}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono">S</kbd>,{" "}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono">T</kbd>,{" "}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono">E</kbd>
      </div>
    </div>
  );
};
