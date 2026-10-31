"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export const QuickBoardLauncher: React.FC = () => {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoom = roomName.trim()
      ? encodeURIComponent(roomName.trim().toLowerCase().replace(/\s+/g, "-"))
      : `study-room-${Math.floor(1000 + Math.random() * 9000)}`;

    router.push(`/board/${targetRoom}`);
  };

  const handleSampleRoom = (sampleName: string) => {
    router.push(`/board/${sampleName}`);
  };

  return (
    <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-indigo-100 bg-white p-5 shadow-lg shadow-indigo-100/50">
      <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name (e.g. hackathon-team)"
          className="flex-1 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
        <Button type="submit" variant="primary" size="md">
          Open Board &rarr;
        </Button>
      </form>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span>Or try a quick demo:</span>
        <button
          type="button"
          onClick={() => handleSampleRoom("math-study-group")}
          className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          #math-study-group
        </button>
        <span>&bull;</span>
        <button
          type="button"
          onClick={() => handleSampleRoom("hackathon-2026")}
          className="font-medium text-rose-600 hover:text-rose-800 hover:underline"
        >
          #hackathon-2026
        </button>
      </div>
    </div>
  );
};
