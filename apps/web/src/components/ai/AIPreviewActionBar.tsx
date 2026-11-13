"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface AIPreviewActionBarProps {
  elementCount: number;
  onAccept: () => void;
  onDiscard: () => void;
  topic?: string;
}

export const AIPreviewActionBar: React.FC<AIPreviewActionBarProps> = ({
  elementCount,
  onAccept,
  onDiscard,
  topic,
}) => {
  return (
    <div
      role="region"
      aria-label="AI Preview Action Bar"
      className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 rounded-2xl border border-indigo-200/90 bg-white/95 px-5 py-3 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-lg shadow-2xs">
          ✨
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              AI Mind Map Preview
            </span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              {elementCount} element{elementCount === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {topic ? (
              <>
                Generated for <strong className="text-slate-700">&quot;{topic}&quot;</strong>.
                Accept to commit to canvas or discard.
              </>
            ) : (
              "Previewing generated concept layout on canvas."
            )}
          </p>
        </div>
      </div>

      <div className="h-8 w-px bg-slate-200" aria-hidden="true" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDiscard}
          title="Discard AI generated preview"
        >
          <span>✕ Discard</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onAccept}
          title="Accept and commit these elements to the whiteboard"
          className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
        >
          <span>✓ Accept & Add to Board</span>
        </Button>
      </div>
    </div>
  );
};
