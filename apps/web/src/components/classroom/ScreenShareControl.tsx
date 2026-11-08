"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface ScreenShareControlProps {
  isSharing: boolean;
  canShare: boolean;
  onStartShare: () => void;
  onStopShare: () => void;
  disabledReason?: string;
  className?: string;
}

export const ScreenShareControl: React.FC<ScreenShareControlProps> = ({
  isSharing,
  canShare,
  onStartShare,
  onStopShare,
  disabledReason,
  className = "",
}) => {
  if (isSharing) {
    return (
      <Button
        variant="danger"
        size="sm"
        onClick={onStopShare}
        className={`animate-pulse ${className}`}
        title="Stop sharing your screen"
      >
        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
        <span>Stop Screen</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!canShare}
      onClick={onStartShare}
      className={className}
      title={
        !canShare
          ? disabledReason || "Only instructors or designated speakers can share screen"
          : "Share your screen with the classroom"
      }
    >
      <span>🖥️</span>
      <span>Share Screen</span>
    </Button>
  );
};

