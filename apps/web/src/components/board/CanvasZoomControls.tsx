"use client";

import React from "react";

export interface CanvasZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  className?: string;
}

export const CanvasZoomControls: React.FC<CanvasZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  className = "",
}) => {
  const percentage = Math.round(scale * 100);

  return (
    <div
      className={`flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/90 p-1 shadow-lg backdrop-blur-md select-none ${className}`}
      title="Canvas Zoom & Viewport Controls"
    >
      <button
        onClick={onZoomOut}
        className="flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        title="Zoom Out (Ctrl + -)"
      >
        −
      </button>

      <button
        onClick={onResetZoom}
        className="min-w-[46px] rounded-lg px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
        title="Reset zoom to 100% (1:1)"
      >
        {percentage}%
      </button>

      <button
        onClick={onZoomIn}
        className="flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        title="Zoom In (Ctrl + +)"
      >
        +
      </button>
    </div>
  );
};

