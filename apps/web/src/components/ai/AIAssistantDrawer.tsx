"use client";

import React, { useState } from "react";
import { CanvasElement, LectureRecapResponse } from "@collabo/shared";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export type AIAssistantTab = "mindmap" | "qa" | "recap";

export interface QAHistoryItem {
  id: string;
  query: string;
  answer: string;
  referencedElementIds: string[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

export interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  boardElements: CanvasElement[];
  chatMessages?: Array<{ senderName: string; body: string }>;
  onPreviewMindMap: (elements: CanvasElement[], topic: string) => void;
  onSelectElement?: (id: string | null) => void;
  className?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  boardElements,
  chatMessages = [],
  onPreviewMindMap,
  onSelectElement,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<AIAssistantTab>("mindmap");

  // 1. Mind Map Generator State
  const [mindMapTopic, setMindMapTopic] = useState("");
  const [mindMapDepth, setMindMapDepth] = useState<number>(2);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [mindMapError, setMindMapError] = useState<string | null>(null);

  // 2. Board Q&A State
  const [qaQuery, setQaQuery] = useState("");
  const [isAnsweringQA, setIsAnsweringQA] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAHistoryItem[]>([]);
  const [qaError, setQaError] = useState<string | null>(null);

  // 3. Lecture Recap & Quiz State
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  const [recapData, setRecapData] = useState<LectureRecapResponse | null>(null);
  const [recapError, setRecapError] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  if (!isOpen) return null;

  // --- Handlers: Mind Map ---
  const handleGenerateMindMap = async (e?: React.FormEvent, overrideTopic?: string) => {
    if (e) e.preventDefault();
    const topic = (overrideTopic ?? mindMapTopic).trim();
    if (!topic) return;

    setIsGeneratingMindMap(true);
    setMindMapError(null);

    try {
      const res = await fetch("/api/ai/mind-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          depth: mindMapDepth,
          originX: 300,
          originY: 250,
          layoutStyle: "tree",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate mind map");
      }

      if (data.mindMap?.elements) {
        onPreviewMindMap(data.mindMap.elements, topic);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setMindMapError(msg);
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  // --- Handlers: Board Q&A ---
  const handleAskBoardQA = async (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const query = (overridePrompt ?? qaQuery).trim();
    if (!query) return;

    setIsAnsweringQA(true);
    setQaError(null);

    try {
      const res = await fetch("/api/ai/board-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          elements: boardElements,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze board");
      }

      const newItem: QAHistoryItem = {
        id: `qa-${Date.now()}`,
        query,
        answer: data.answer?.answer || "No response received",
        referencedElementIds: data.answer?.referencedElementIds || [],
        suggestedFollowUps: data.answer?.suggestedFollowUps || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setQaHistory((prev) => [newItem, ...prev]);
      setQaQuery("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Board Q&A failed";
      setQaError(msg);
    } finally {
      setIsAnsweringQA(false);
    }
  };

  // --- Handlers: Lecture Recap & Quiz ---
  const handleGenerateRecap = async () => {
    setIsGeneratingRecap(true);
    setRecapError(null);

    try {
      const res = await fetch("/api/ai/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardElements,
          chatMessages,
          transcript: `Lecture recording for whiteboard session with ${boardElements.length} elements.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate recap");
      }

      setRecapData(data.recap);
      setQuizAnswers({});
      setFlashcardIndex(0);
      setIsFlashcardFlipped(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Recap generation failed";
      setRecapError(msg);
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="COLLABO AI Assistant"
      className={`fixed top-16 right-0 bottom-0 z-30 flex w-80 sm:w-[430px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-all ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white shadow-xs">
            ✨
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-800">COLLABO Intelligence</h2>
            <p className="text-[11px] text-slate-500">Board-Aware Classroom AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          title="Close AI Assistant"
        >
          ✕
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-1 gap-1">
        <button
          onClick={() => setActiveTab("mindmap")}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
            activeTab === "mindmap"
              ? "bg-white text-indigo-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🧠 Mind Map
        </button>
        <button
          onClick={() => setActiveTab("qa")}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
            activeTab === "qa"
              ? "bg-white text-indigo-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🔍 Board Q&amp;A
        </button>
        <button
          onClick={() => setActiveTab("recap")}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
            activeTab === "recap"
              ? "bg-white text-indigo-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📝 Study Guide
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= TAB 1: MIND MAP GENERATOR ================= */}
        {activeTab === "mindmap" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
              <h3 className="text-xs font-bold text-indigo-900">Algorithmic Concept Tree</h3>
              <p className="mt-1 text-xs text-indigo-700/90 leading-relaxed">
                Generates a non-overlapping concept tree with auto-routed connector lines.
                Results render in a <strong>translucent preview layer</strong> so you can inspect before committing.
              </p>
            </div>

            <form onSubmit={handleGenerateMindMap} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic or Curriculum Concept
                </label>
                <input
                  type="text"
                  value={mindMapTopic}
                  onChange={(e) => setMindMapTopic(e.target.value)}
                  placeholder="e.g. Operating System Process Scheduling"
                  disabled={isGeneratingMindMap}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hierarchy Depth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((depth) => (
                    <button
                      key={depth}
                      type="button"
                      onClick={() => setMindMapDepth(depth)}
                      className={`rounded-lg py-1.5 text-xs font-medium border transition ${
                        mindMapDepth === depth
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {depth === 1 ? "1 Level" : `${depth} Levels`}
                    </button>
                  ))}
                </div>
              </div>

              {mindMapError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs text-rose-700">
                  {mindMapError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isGeneratingMindMap || !mindMapTopic.trim()}
                className="w-full"
              >
                {isGeneratingMindMap ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Synthesizing Concept Tree...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Generate &amp; Preview Mind Map</span>
                  </>
                )}
              </Button>
            </form>

            {/* Quick Inspiration Prompts */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Academic Prompts
              </span>
              <div className="mt-2 space-y-1.5">
                {[
                  "Operating System Process Scheduling",
                  "Database Normalization (1NF to BCNF)",
                  "Binary Search Trees & Rebalancing",
                  "TCP 3-Way Handshake & Teardown",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setMindMapTopic(prompt);
                      handleGenerateMindMap(undefined, prompt);
                    }}
                    disabled={isGeneratingMindMap}
                    className="w-full text-left rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-xs text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900 transition"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: BOARD-AWARE Q&A ================= */}
        {activeTab === "qa" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Visual Board Context</span>
                <p className="text-[11px] text-slate-500">
                  {boardElements.length} element{boardElements.length === 1 ? "" : "s"} serialized
                </p>
              </div>
              <Badge variant="indigo" size="sm">
                Active
              </Badge>
            </div>

            <form onSubmit={handleAskBoardQA} className="space-y-2">
              <textarea
                value={qaQuery}
                onChange={(e) => setQaQuery(e.target.value)}
                placeholder="Ask anything about what's drawn on the board... (e.g. 'Explain the relationship between the green and yellow concepts')"
                rows={3}
                disabled={isAnsweringQA}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAnsweringQA || !qaQuery.trim()}
                  className="flex-1"
                >
                  {isAnsweringQA ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Analyzing Board...</span>
                    </>
                  ) : (
                    <span>Ask Question</span>
                  )}
                </Button>
              </div>
            </form>

            {qaError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs text-rose-700">
                {qaError}
              </div>
            )}

            {/* Suggested Starter Questions */}
            {qaHistory.length === 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Suggested Questions
                </span>
                {[
                  "Summarize the key architecture on this canvas",
                  "What concepts or edge cases are missing?",
                  "Explain how these components relate to each other",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setQaQuery(sug);
                      handleAskBoardQA(undefined, sug);
                    }}
                    className="w-full text-left rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-700 transition"
                  >
                    💬 {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Q&A Stream */}
            <div className="space-y-3 pt-2">
              {qaHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Q: {item.query}</span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </p>

                  {/* Referenced Element Tags */}
                  {item.referencedElementIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Grounded in:
                      </span>
                      {item.referencedElementIds.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onSelectElement?.(id)}
                          className="rounded-md bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-mono text-indigo-700 hover:bg-indigo-100 transition"
                          title={`Click to focus on canvas element #${id}`}
                        >
                          #{id}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Prompts */}
                  {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 && (
                    <div className="border-t border-slate-100 pt-2 space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Next questions:
                      </span>
                      {item.suggestedFollowUps.map((fu) => (
                        <button
                          key={fu}
                          type="button"
                          onClick={() => {
                            setQaQuery(fu);
                            handleAskBoardQA(undefined, fu);
                          }}
                          className="block text-left text-[11px] text-indigo-600 hover:underline"
                        >
                          &rarr; {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: STUDY GUIDE & QUIZZES ================= */}
        {activeTab === "recap" && (
          <div className="space-y-4">
            {!recapData ? (
              <div className="text-center py-6 px-4 space-y-3">
                <span className="inline-block text-4xl">📝</span>
                <h3 className="text-sm font-bold text-slate-800">
                  Lecture Study Guide &amp; Quiz Engine
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Synthesizes board elements, chat interactions, and lecture content into an
                  executive summary, active recall quiz questions, and flashcards.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleGenerateRecap}
                  disabled={isGeneratingRecap}
                  className="w-full"
                >
                  {isGeneratingRecap ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Synthesizing Study Guide...</span>
                    </>
                  ) : (
                    <span>✨ Generate Lecture Study Guide</span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Re-generate button */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Generated Study Guide</span>
                  <button
                    onClick={handleGenerateRecap}
                    disabled={isGeneratingRecap}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    🔄 Refresh Guide
                  </button>
                </div>

                {/* 1. Executive Summary */}
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Executive Summary
                  </span>
                  <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {recapData.summaryMarkdown}
                  </div>
                </div>

                {/* 2. Key Takeaways */}
                {recapData.keyTakeaways.length > 0 && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      Key Takeaways
                    </span>
                    <ul className="space-y-1.5 text-xs text-indigo-950">
                      {recapData.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">&bull;</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. Active Recall Quiz */}
                {recapData.quiz && recapData.quiz.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Active Recall Quiz ({recapData.quiz.length} Questions)
                    </span>
                    {recapData.quiz.map((q, qIdx) => {
                      const selectedOpt = quizAnswers[q.id];
                      const isAnswered = selectedOpt !== undefined;
                      const isCorrect = isAnswered && selectedOpt === q.correctOptionIndex;

                      return (
                        <div
                          key={q.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs"
                        >
                          <div className="text-xs font-semibold text-slate-800">
                            {qIdx + 1}. {q.question}
                          </div>
                          <div className="space-y-1.5">
                            {q.options.map((opt, optIdx) => {
                              let optStyles =
                                "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100";
                              if (isAnswered) {
                                if (optIdx === q.correctOptionIndex) {
                                  optStyles =
                                    "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                                } else if (selectedOpt === optIdx) {
                                  optStyles =
                                    "border-rose-400 bg-rose-50 text-rose-800 line-through";
                                } else {
                                  optStyles = "border-slate-200 bg-slate-50/30 text-slate-400 opacity-60";
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={isAnswered}
                                  onClick={() =>
                                    setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                                  }
                                  className={`w-full text-left rounded-lg border p-2 text-xs transition ${optStyles}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {isAnswered && (
                            <div
                              className={`rounded-lg p-2 text-[11px] leading-relaxed ${
                                isCorrect
                                  ? "bg-emerald-50 text-emerald-800"
                                  : "bg-amber-50 text-amber-800"
                              }`}
                            >
                              <strong>{isCorrect ? "✓ Correct!" : "✕ Note:"}</strong>{" "}
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 4. Interactive Flashcards */}
                {recapData.flashcards && recapData.flashcards.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Flashcards ({flashcardIndex + 1}/{recapData.flashcards.length})
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFlashcardIndex((idx) =>
                              idx > 0 ? idx - 1 : recapData.flashcards.length - 1
                            );
                            setIsFlashcardFlipped(false);
                          }}
                          className="rounded-md border border-slate-200 px-2 py-0.5 text-xs hover:bg-slate-50"
                        >
                          &larr;
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFlashcardIndex((idx) =>
                              idx < recapData.flashcards.length - 1 ? idx + 1 : 0
                            );
                            setIsFlashcardFlipped(false);
                          }}
                          className="rounded-md border border-slate-200 px-2 py-0.5 text-xs hover:bg-slate-50"
                        >
                          &rarr;
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const card = recapData.flashcards[flashcardIndex];
                      return (
                        <div
                          onClick={() => setIsFlashcardFlipped((f) => !f)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setIsFlashcardFlipped((f) => !f);
                            }
                          }}
                          className="group relative h-40 cursor-pointer rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-4 shadow-sm flex flex-col justify-between select-none transition hover:border-indigo-400"
                        >
                          <div className="flex justify-between items-center text-[10px] text-indigo-500 font-semibold uppercase">
                            <span>{card.conceptTag || "Flashcard"}</span>
                            <span>{isFlashcardFlipped ? "Back (Answer)" : "Front (Question)"}</span>
                          </div>

                          <div className="text-center py-2 px-1">
                            <p className="text-xs font-bold text-slate-800">
                              {isFlashcardFlipped ? card.back : card.front}
                            </p>
                          </div>

                          <div className="text-center text-[10px] text-slate-400 group-hover:text-indigo-600 transition">
                            Click / Tap to flip ↻
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {recapError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs text-rose-700">
                {recapError}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
