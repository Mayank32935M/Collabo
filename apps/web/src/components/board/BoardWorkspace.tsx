"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BoardHeader } from "@/components/board/BoardHeader";
import { CanvasToolbar } from "@/components/board/CanvasToolbar";
import { CanvasStateHUD } from "@/components/board/CanvasStateHUD";
import { CanvasZoomControls } from "@/components/board/CanvasZoomControls";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { ScreenShareStage } from "@/components/classroom/ScreenShareStage";
import { ClassroomSidebar } from "@/components/classroom/ClassroomSidebar";
import { ScreenShareController } from "@collabo/voice";
import { clampScale } from "@collabo/whiteboard";
import {
  ActivePollState,
  ActiveScreenShareState,
  CANVAS_TOOLS,
  CanvasTool,
  QAQuestion,
  ServerChatMessagePayload,
  StrokeWidth,
  ToolbarState,
  ViewportTransform,
} from "@collabo/shared";

// Dynamically import CanvasStage with ssr: false so Konva never attempts to mount on the server
const CanvasStage = dynamic(
  () => import("@/components/board/CanvasStage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 backdrop-blur-md">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping" />
          Mounting Konva 2D Canvas Engine...
        </div>
      </div>
    ),
  }
);

export interface BoardWorkspaceProps {
  roomId: string;
}

export const BoardWorkspace: React.FC<BoardWorkspaceProps> = ({ roomId }) => {
  // Milestone 5 & 6: History stack, LocalStorage & PostgreSQL backend persistence hook
  const {
    elements,
    setElementsLive,
    commitElements,
    undo,
    redo,
    clearCanvas,
    canUndo,
    canRedo,
    isHydrated,
    syncStatus,
    lastSavedAt,
  } = useCanvasHistory(roomId);

  // Selected element ID for Transformer manipulation
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Camera viewport state (infinite canvas pan & zoom)
  const [camera, setCamera] = useState<ViewportTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const handleZoomIn = () =>
    setCamera((c) => ({ ...c, scale: clampScale(c.scale * 1.2, 0.1, 5.0) }));
  const handleZoomOut = () =>
    setCamera((c) => ({ ...c, scale: clampScale(c.scale / 1.2, 0.1, 5.0) }));
  const handleResetZoom = () => setCamera({ x: 0, y: 0, scale: 1 });

  // Toolbar & drawing attributes state
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    activeTool: "select",
    activeColor: "#6366f1",
    strokeWidth: 4,
  });

  const [lastAction, setLastAction] = useState<string>("Select tool active");

  const handleToolChange = (tool: CanvasTool) => {
    const def = CANVAS_TOOLS.find((t) => t.id === tool);
    setToolbarState((prev) => ({ ...prev, activeTool: tool }));
    setLastAction(`Tool: ${def?.label || tool}`);
    if (tool !== "select") {
      setSelectedId(null);
    }
  };

  const handleColorChange = (color: string) => {
    setToolbarState((prev) => ({ ...prev, activeColor: color }));
    setLastAction(`Color: ${color}`);
  };

  const handleStrokeWidthChange = (width: StrokeWidth) => {
    setToolbarState((prev) => ({ ...prev, strokeWidth: width }));
    setLastAction(`Thickness: ${width}px`);
  };

  const handleUndo = () => {
    undo();
    setSelectedId(null);
    setLastAction("Undo action");
  };

  const handleRedo = () => {
    redo();
    setSelectedId(null);
    setLastAction("Redo action");
  };

  const handleClear = () => {
    if (elements.length === 0) return;
    if (window.confirm(`Clear all ${elements.length} elements from this board?`)) {
      clearCanvas();
      setSelectedId(null);
      setLastAction("Board cleared");
    }
  };

  // Milestone M7: Screen Sharing & Classroom Interaction State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeScreenShare, setActiveScreenShare] = useState<ActiveScreenShareState | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isPresenter, setIsPresenter] = useState(false);
  const screenControllerRef = useRef<ScreenShareController | null>(null);

  // In-Classroom Chat, Polls & Q&A
  const [messages, setMessages] = useState<ServerChatMessagePayload[]>([]);
  const [activePoll, setActivePoll] = useState<ActivePollState | null>(null);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);

  const handleToggleScreenShare = async () => {
    if (!screenControllerRef.current) {
      screenControllerRef.current = new ScreenShareController();
    }
    const controller = screenControllerRef.current;
    if (!controller) return;

    if (isPresenter) {
      controller.stopScreenShare();
      setIsPresenter(false);
      setScreenStream(null);
      setActiveScreenShare(null);
      setLastAction("Screen share stopped");
    } else {
      const status = await controller.startScreenShare({
        audio: true,
        onEnded: () => {
          setIsPresenter(false);
          setScreenStream(null);
          setActiveScreenShare(null);
          setLastAction("Screen share ended by presenter");
        },
      });

      if (status.isSharing) {
        setIsPresenter(true);
        setActiveScreenShare({
          socketId: "self",
          profileId: "current_user",
          name: "You",
          streamId: status.streamId,
          hasAudio: status.hasAudio,
          startedAt: new Date().toISOString(),
        });
        setLastAction("Screen share broadcasting");
      } else if (status.error) {
        setLastAction(`Screen share error: ${status.error}`);
      }
    }
  };

  const handleSendMessage = (text: string) => {
    const newMsg: ServerChatMessagePayload = {
      id: `msg-${Math.random().toString(36).slice(2, 9)}`,
      roomId,
      senderSocketId: "self",
      senderProfileId: "current_user",
      senderName: "You",
      senderRole: "host",
      body: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleLaunchPoll = (question: string, options: string[]) => {
    const newPoll: ActivePollState = {
      id: `poll-${Math.random().toString(36).slice(2, 9)}`,
      question,
      options,
      votes: {},
      totalVotes: 0,
      results: new Array(options.length).fill(0),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setActivePoll(newPoll);
    setLastAction("Live poll launched");
  };

  const handleVotePoll = (pollId: string, optionIndex: number) => {
    if (!activePoll || activePoll.id !== pollId || !activePoll.isActive) return;
    const prevOption = activePoll.votes["current_user"];
    const results = [...activePoll.results];

    if (prevOption !== undefined) {
      results[prevOption] = Math.max(0, results[prevOption] - 1);
    }
    results[optionIndex] = (results[optionIndex] || 0) + 1;

    const votes = { ...activePoll.votes, current_user: optionIndex };
    const totalVotes =
      prevOption !== undefined ? activePoll.totalVotes : activePoll.totalVotes + 1;

    setActivePoll({
      ...activePoll,
      votes,
      totalVotes,
      results,
    });
  };

  const handleClosePoll = () => {
    if (activePoll) {
      setActivePoll({ ...activePoll, isActive: false });
      setLastAction("Live poll ended");
    }
  };

  const handleAskQuestion = (questionText: string) => {
    const newQ: QAQuestion = {
      id: `q-${Math.random().toString(36).slice(2, 9)}`,
      roomId,
      authorProfileId: "current_user",
      authorName: "You",
      authorRole: "host",
      question: questionText,
      upvotes: [],
      upvoteCount: 0,
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) => [newQ, ...prev]);
    setLastAction("Question posted to Q&A");
  };

  const handleUpvoteQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const hasUpvoted = q.upvotes.includes("current_user");
        const upvotes = hasUpvoted
          ? q.upvotes.filter((id) => id !== "current_user")
          : [...q.upvotes, "current_user"];
        return {
          ...q,
          upvotes,
          upvoteCount: upvotes.length,
        };
      })
    );
  };

  const handleAnswerQuestion = (questionId: string, isAnswered: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, isAnswered } : q))
    );
    setLastAction(isAnswered ? "Question marked answered" : "Question reopened");
  };

  // Dynamic cursor feedback based on tool
  const getCursorClass = () => {
    switch (toolbarState.activeTool) {
      case "select":
        return "cursor-default";
      case "pen":
      case "rectangle":
      case "circle":
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
      <BoardHeader
        roomId={roomId}
        initialTitle={`${roomId} Board`}
        isSharingScreen={isPresenter}
        canShareScreen={true}
        onToggleScreenShare={handleToggleScreenShare}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Board Workspace Shell */}
      <main className="relative flex-1 overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] select-none">
        {/* Active Presentation Screen Share Overlay */}
        {activeScreenShare && (
          <div className="absolute top-4 left-4 z-20 w-80 sm:w-96 md:w-[480px]">
            <ScreenShareStage
              screenShare={activeScreenShare}
              stream={screenStream}
              isPresenter={isPresenter}
              onStopSharing={handleToggleScreenShare}
            />
          </div>
        )}

        {/* Floating Canvas State Inspector HUD */}
        <CanvasStateHUD
          state={toolbarState}
          elementCount={elements.length}
          selectedId={selectedId}
          canUndo={canUndo}
          canRedo={canRedo}
          lastAction={lastAction}
          syncStatus={syncStatus}
          lastSavedAt={lastSavedAt}
          onClearCanvas={handleClear}
        />

        {/* Floating Interactive Canvas Toolbar */}
        <CanvasToolbar
          state={toolbarState}
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onStrokeWidthChange={handleStrokeWidthChange}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* First-time Drawing Guidance Watermark (fades when elements exist) */}
        {isHydrated && elements.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="max-w-md rounded-3xl border border-dashed border-indigo-200 bg-white/80 p-6 text-center backdrop-blur-xs shadow-sm">
              <span className="text-3xl">🎨</span>
              <h2 className="mt-2 text-base font-bold text-slate-800">
                Interactive Whiteboard Ready
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Draw with the <strong className="text-indigo-600">Pen (P)</strong> or place shapes with{" "}
                <strong className="text-indigo-600">Rectangle (R)</strong>,{" "}
                <strong className="text-indigo-600">Circle (C)</strong>, or{" "}
                <strong className="text-indigo-600">Sticky Note (S)</strong>.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span>Undo: <kbd className="font-mono font-bold text-slate-700">Ctrl+Z</kbd></span>
                <span>&bull;</span>
                <span>Resize: <kbd className="font-mono font-bold text-slate-700">Select (V)</kbd></span>
                <span>&bull;</span>
                <span>Auto-saved locally</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Canvas Zoom Controls */}
        <CanvasZoomControls
          scale={camera.scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          className="absolute bottom-6 right-6 z-20"
        />

        {/* Konva 2D Canvas Stage */}
        <CanvasStage
          elements={elements}
          onElementsChange={setElementsLive}
          onCommitElements={commitElements}
          toolbarState={toolbarState}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          camera={camera}
          onCameraChange={setCamera}
        />

        {/* In-Classroom Interaction Sidebar (Chat, Live Polls & Q&A) */}
        <ClassroomSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentProfileId="current_user"
          currentRole="host"
          messages={messages}
          onSendMessage={handleSendMessage}
          activePoll={activePoll}
          onLaunchPoll={handleLaunchPoll}
          onVotePoll={handleVotePoll}
          onClosePoll={handleClosePoll}
          questions={questions}
          onAskQuestion={handleAskQuestion}
          onUpvoteQuestion={handleUpvoteQuestion}
          onAnswerQuestion={handleAnswerQuestion}
        />
      </main>
    </div>
  );
};
