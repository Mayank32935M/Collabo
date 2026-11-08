"use client";

import React, { useEffect, useRef, useState } from "react";
import { ActiveScreenShareState } from "@collabo/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ScreenShareStageProps {
  screenShare: ActiveScreenShareState | null;
  stream?: MediaStream | null;
  isPresenter?: boolean;
  onStopSharing?: () => void;
  className?: string;
}

export const ScreenShareStage: React.FC<ScreenShareStageProps> = ({
  screenShare,
  stream,
  isPresenter = false,
  onStopSharing,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  if (!screenShare) return null;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl transition-all ${className}`}
    >
      {/* Presentation Stream Header Bar */}
      <div className="z-10 flex h-12 items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Badge variant="rose" size="sm" dot>
            LIVE PRESENTATION
          </Badge>
          <span className="text-xs font-semibold text-slate-200">
            {screenShare.name}
            {isPresenter ? " (You)" : ""}
          </span>
          {screenShare.hasAudio && (
            <span
              className="text-xs text-slate-400"
              title="Presentation includes system audio"
            >
              🔊 Audio
            </span>
          )}
        </div>

        {/* Video Surface Controls */}
        <div className="flex items-center gap-2">
          {screenShare.hasAudio && (
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
              title={isAudioMuted ? "Unmute presentation" : "Mute presentation"}
            >
              {isAudioMuted ? "🔇" : "🔉"}
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen presentation"}
          >
            {isFullscreen ? "⛶ Exit" : "⛶ Expand"}
          </button>

          {isPresenter && onStopSharing && (
            <Button
              variant="danger"
              size="sm"
              onClick={onStopSharing}
              className="py-1 text-xs"
            >
              Stop Sharing
            </Button>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex flex-1 items-center justify-center bg-black aspect-video min-h-[240px]">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isPresenter || isAudioMuted}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl text-indigo-400 shadow-inner">
              🖥️
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Incoming Video Stream: {screenShare.name}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Broadcasting via LiveKit WebRTC SFU at high-definition 1080p
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

