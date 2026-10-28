"use client";

import React from "react";
import { CANVAS_TOOLS, ToolbarState } from "@/types/canvas";

export interface CanvasStateHUDProps {
  state: ToolbarState;
  elementCount?: number;
  lastAction?: string;
  onClearCanvas?: () => void;
}

export const CanvasStateHUD: React.FC<CanvasStateHUDProps> = ({
  state,
  elementCount = 0,
  lastAction,
  onClearCanvas,
}) => {
  const currentToolDef = CANVAS_TOOLS.find((t) => t.id === state.activeTool);

  return (
    <div className="fixed bottom-6 left-6 z-20 hidden md:block max-w-xs rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-lg shadow-slate-200/50 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span>Konva Engine HUD (Step 4)</span>
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
          <span className="text-slate-500">Rendered Elements:</span>
          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            {elementCount} {elementCount === 1 ? "shape" : "shapes"}
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
            <span className="font-medium truncate max-w-[130px]">{lastAction}</span>
          </div>
        )}
      </div>

      {onClearCanvas && elementCount > 0 && (
        <button
          type="button"
          onClick={onClearCanvas}
          className="mt-2.5 w-full rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
        >
          🗑️ Clear Canvas ({elementCount})
        </button>
      )}

      <div className="mt-2 text-[10px] text-slate-400 text-center">
        Shortcuts: <kbd className="rounded bg-slate-100 px-1 py-0.5 border font-mono">V</kbd>,{" "}
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
