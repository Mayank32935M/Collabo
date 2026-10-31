"use client";

import React, { useEffect } from "react";
import {
  CANVAS_TOOLS,
  COLOR_PALETTE,
  STROKE_WIDTHS,
  CanvasTool,
  StrokeWidth,
  ToolbarState,
} from "@/types/canvas";

export interface CanvasToolbarProps {
  state: ToolbarState;
  onToolChange: (tool: CanvasTool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: StrokeWidth) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

// Crisp inline SVGs for zero-dependency rendering
function ToolIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "pointer":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5 3.5l14 8-6.5 2-2 6.5-5.5-16.5z" />
        </svg>
      );
    case "pen":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      );
    case "square":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
    case "note":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />
          <path d="M15 3v6h6" />
        </svg>
      );
    case "text":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      );
    case "eraser":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="M22 21H7" />
          <path d="m5 11 9 9" />
        </svg>
      );
    case "circle":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    default:
      return null;
  }
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  state,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  // Global keyboard shortcuts (Tools + Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing inside an input, textarea, or editable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Undo shortcut: Ctrl+Z / Cmd+Z
      if (isCtrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo && onUndo) onUndo();
        return;
      }

      // Redo shortcut: Ctrl+Y / Cmd+Shift+Z / Ctrl+Shift+Z
      if (
        (isCtrlOrCmd && e.key.toLowerCase() === "y") ||
        (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        if (canRedo && onRedo) onRedo();
        return;
      }

      // Tool shortcut map (V, P, R, C, S, T, E)
      if (!isCtrlOrCmd && !e.altKey) {
        const key = e.key.toUpperCase();
        const matchedTool = CANVAS_TOOLS.find((t) => t.shortcut === key);

        if (matchedTool) {
          e.preventDefault();
          onToolChange(matchedTool.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToolChange, onUndo, onRedo, canUndo, canRedo]);

  return (
    <aside
      aria-label="Canvas drawing tools"
      role="toolbar"
      className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-8"
    >
      {/* Floating Toolbar Shell */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-xl shadow-slate-300/40 backdrop-blur-md">
        {/* Undo / Redo History Controls */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 14 5-5-5-5" />
              <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
            </svg>
          </button>
        </div>

        {/* Tool Buttons Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          {CANVAS_TOOLS.map((tool) => {
            const isActive = state.activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                role="button"
                aria-pressed={isActive}
                onClick={() => onToolChange(tool.id)}
                title={`${tool.label} (${tool.shortcut})`}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 scale-105"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <ToolIcon icon={tool.icon} />
                <span className="sr-only">{tool.label}</span>

                {/* Shortcut Hint Badge */}
                <span
                  className={`absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold ${
                    isActive
                      ? "bg-amber-400 text-slate-900"
                      : "bg-slate-200 text-slate-600 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {tool.shortcut}
                </span>
              </button>
            );
          })}
        </div>

        {/* Color Palette Selector Group */}
        <div
          aria-label="Stroke color palette"
          className="flex items-center gap-1.5 px-2 border-r border-slate-200"
        >
          {COLOR_PALETTE.map((color) => {
            const isSelected = state.activeColor === color.hex;
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => onColorChange(color.hex)}
                title={color.name}
                aria-label={`Select ${color.name}`}
                className={`relative h-6 w-6 rounded-full transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isSelected ? "scale-115 ring-2 ring-slate-800 ring-offset-2" : "hover:scale-105"
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Stroke Width Selector Group */}
        <div
          aria-label="Stroke thickness selector"
          className="flex items-center gap-1 pl-1"
        >
          {STROKE_WIDTHS.map((width) => {
            const isSelected = state.strokeWidth === width.value;
            return (
              <button
                key={width.value}
                type="button"
                onClick={() => onStrokeWidthChange(width.value)}
                title={`${width.label} stroke (${width.value}px)`}
                aria-label={`${width.label} stroke`}
                className={`flex h-8 px-2 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span
                  className="rounded-full bg-current"
                  style={{
                    width: width.value * 2.5,
                    height: width.value,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
