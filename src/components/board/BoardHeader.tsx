"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export interface BoardHeaderProps {
  roomId: string;
  initialTitle?: string;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  roomId,
  initialTitle = "Untitled Board",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback if clipboard API is unavailable
        prompt("Copy this board link to share:", window.location.href);
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Brand & Room Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Return to Home"
        >
          <Image
            src="/logo.svg"
            alt="COLLABO logo"
            width={28}
            height={28}
            className="rounded-lg shadow-2xs"
          />
          <span className="hidden text-xs font-semibold text-slate-500 sm:inline">
            &larr; Exit
          </span>
        </Link>

        <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

        {/* Editable Board Title */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") setIsEditingTitle(false);
              }}
              autoFocus
              className="rounded-lg border border-indigo-400 bg-white px-2 py-1 text-sm font-bold text-slate-900 outline-none ring-2 ring-indigo-200"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 rounded-lg px-2 py-1 text-left text-sm font-bold text-slate-900 hover:bg-slate-100"
              title="Click to rename board"
            >
              <span>{title}</span>
              <span className="text-xs text-slate-400 opacity-0 transition group-hover:opacity-100">
                ✏️
              </span>
            </button>
          )}

          <Badge variant="indigo" size="sm">
            #{roomId}
          </Badge>
        </div>
      </div>

      {/* Right: Presence Avatars & Actions */}
      <div className="flex items-center gap-3">
        {/* Active Collaborator Avatar Stack (Design Preview for Step 8) */}
        <div className="hidden sm:flex items-center -space-x-2 overflow-hidden py-1">
          <Avatar name="You" color="indigo" size="sm" title="You (Host)" />
          <div
            title="Additional teammate slots will activate in Milestone 8 (Multiplayer)"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-400 select-none ring-2 ring-white"
          >
            +
          </div>
        </div>

        {/* Share Button with Live Clipboard Copy */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="relative"
        >
          {copied ? (
            <>
              <span className="text-emerald-600 font-bold">✓ Copied Link!</span>
            </>
          ) : (
            <>
              <span>🔗 Share</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
