"use client";

import React, { useState } from "react";
import {
  ActivePollState,
  ParticipantRole,
  QAQuestion,
  ServerChatMessagePayload,
} from "@collabo/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type SidebarTab = "chat" | "polls" | "qa";

export interface ClassroomSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfileId: string;
  currentRole: ParticipantRole;
  messages: ServerChatMessagePayload[];
  onSendMessage: (text: string) => void;
  activePoll: ActivePollState | null;
  onLaunchPoll: (question: string, options: string[]) => void;
  onVotePoll: (pollId: string, optionIndex: number) => void;
  onClosePoll: (pollId: string) => void;
  questions: QAQuestion[];
  onAskQuestion: (question: string) => void;
  onUpvoteQuestion: (questionId: string) => void;
  onAnswerQuestion: (questionId: string, isAnswered: boolean) => void;
  className?: string;
}

export const ClassroomSidebar: React.FC<ClassroomSidebarProps> = ({
  isOpen,
  onClose,
  currentProfileId,
  currentRole,
  messages,
  onSendMessage,
  activePoll,
  onLaunchPoll,
  onVotePoll,
  onClosePoll,
  questions,
  onAskQuestion,
  onUpvoteQuestion,
  onAnswerQuestion,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("chat");
  const [chatInput, setChatInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [qaFilter, setQaFilter] = useState<"all" | "unanswered" | "answered">("all");

  // Host poll creation state
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const isHostOrCoHost = currentRole === "host" || currentRole === "co-host";

  if (!isOpen) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim().length === 0) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionInput.trim().length === 0) return;
    onAskQuestion(questionInput.trim());
    setQuestionInput("");
  };

  const handleCreatePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = pollOptions.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!pollQuestion.trim() || validOptions.length < 2) return;

    onLaunchPoll(pollQuestion.trim(), validOptions);
    setIsCreatingPoll(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Filtered Q&A questions
  const filteredQuestions = questions.filter((q) => {
    if (qaFilter === "unanswered") return !q.isAnswered;
    if (qaFilter === "answered") return q.isAnswered;
    return true;
  });

  return (
    <aside
      className={`fixed top-16 right-0 bottom-0 z-30 flex w-80 sm:w-96 flex-col border-l border-slate-200 bg-white shadow-xl transition-all ${className}`}
    >
      {/* Header & Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab("polls")}
            className={`relative rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeTab === "polls"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            📊 Polls
            {activePoll && activePoll.isActive && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`relative rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeTab === "qa"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            ❓ Q&A
            {questions.length > 0 && (
              <span className="ml-1 rounded-full bg-indigo-100 px-1 text-[10px] text-indigo-700">
                {questions.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          title="Close interaction sidebar"
        >
          ✕
        </button>
      </div>

      {/* Tab 1: Chat Stream */}
      {activeTab === "chat" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
                <span className="text-3xl">💬</span>
                <p className="mt-2 text-xs font-medium">No messages yet</p>
                <p className="text-[11px] text-slate-400">
                  Say hello to the classroom!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderProfileId === currentProfileId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-700">
                        {isOwn ? "You" : msg.senderName}
                      </span>
                      {msg.senderRole === "host" && (
                        <Badge variant="indigo" size="sm">Host</Badge>
                      )}
                      {msg.senderRole === "co-host" && (
                        <Badge variant="indigo" size="sm">TA</Badge>
                      )}
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`mt-1 rounded-2xl px-3 py-2 text-xs max-w-[85%] break-words ${
                        isOwn
                          ? "bg-indigo-600 text-white rounded-br-xs"
                          : "bg-slate-100 text-slate-800 rounded-bl-xs"
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendChat} className="border-t border-slate-200 p-3 bg-white flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to classroom..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
            <Button variant="primary" size="sm" type="submit" disabled={!chatInput.trim()}>
              Send
            </Button>
          </form>
        </div>
      )}

      {/* Tab 2: Live Polls */}
      {activeTab === "polls" && (
        <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-4">
          {/* Host Poll Creator Action */}
          {isHostOrCoHost && !isCreatingPoll && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingPoll(true)}
              className="w-full justify-center"
            >
              + Create New Poll
            </Button>
          )}

          {/* Host Poll Form */}
          {isCreatingPoll && (
            <form onSubmit={handleCreatePollSubmit} className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">New Live Poll</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingPoll(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Question (e.g. Which algorithm is O(log n)?)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
              />

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Options</span>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(i)}
                        className="text-xs text-slate-400 hover:text-rose-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="w-full justify-center"
                disabled={!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2}
              >
                Launch Poll
              </Button>
            </form>
          )}

          {/* Active / Current Poll View */}
          {activePoll ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant={activePoll.isActive ? "emerald" : "slate"} size="sm" dot={activePoll.isActive}>
                    {activePoll.isActive ? "ACTIVE POLL" : "CLOSED POLL"}
                  </Badge>
                  <h4 className="mt-1 text-xs font-bold text-slate-900">
                    {activePoll.question}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {activePoll.totalVotes} {activePoll.totalVotes === 1 ? "vote" : "votes"}
                </span>
              </div>

              {/* Poll Options & Live Bar Chart */}
              <div className="space-y-2 pt-1">
                {activePoll.options.map((option, idx) => {
                  const voteCount = activePoll.results[idx] || 0;
                  const pct = activePoll.totalVotes > 0 ? Math.round((voteCount / activePoll.totalVotes) * 100) : 0;
                  const hasVotedThis = activePoll.votes[currentProfileId] === idx;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${hasVotedThis ? "text-indigo-600 font-bold" : "text-slate-700"}`}>
                          {option} {hasVotedThis && "✓"}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {pct}% ({voteCount})
                        </span>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full transition-all duration-300 ${
                            hasVotedThis ? "bg-indigo-600" : "bg-slate-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {activePoll.isActive && (
                        <button
                          onClick={() => onVotePoll(activePoll.id, idx)}
                          className={`mt-1 text-[11px] rounded px-2 py-0.5 border ${
                            hasVotedThis
                              ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {hasVotedThis ? "Voted" : "Vote for this"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Host Controls */}
              {isHostOrCoHost && activePoll.isActive && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onClosePoll(activePoll.id)}
                    className="text-xs py-1"
                  >
                    End Poll
                  </Button>
                </div>
              )}
            </div>
          ) : (
            !isCreatingPoll && (
              <div className="flex h-48 flex-col items-center justify-center text-center p-6 text-slate-400">
                <span className="text-3xl">📊</span>
                <p className="mt-2 text-xs font-medium">No active poll</p>
                <p className="text-[11px] text-slate-400">
                  {isHostOrCoHost
                    ? "Click above to launch a quick question to the class."
                    : "The instructor will launch questions here."}
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* Tab 3: Live Q&A */}
      {activeTab === "qa" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Ask Question Bar */}
          <form onSubmit={handleAskQuestion} className="border-b border-slate-200 p-3 bg-slate-50 space-y-2">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask a question for the instructor..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-between">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQaFilter("all")}
                  className={`rounded px-1.5 py-0.5 ${qaFilter === "all" ? "bg-slate-200 font-bold text-slate-800" : "text-slate-500"}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setQaFilter("unanswered")}
                  className={`rounded px-1.5 py-0.5 ${qaFilter === "unanswered" ? "bg-slate-200 font-bold text-slate-800" : "text-slate-500"}`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setQaFilter("answered")}
                  className={`rounded px-1.5 py-0.5 ${qaFilter === "answered" ? "bg-slate-200 font-bold text-slate-800" : "text-slate-500"}`}
                >
                  Answered
                </button>
              </div>

              <Button variant="primary" size="sm" type="submit" disabled={!questionInput.trim()}>
                Ask
              </Button>
            </div>
          </form>

          {/* Questions Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center p-6 text-slate-400">
                <span className="text-3xl">❓</span>
                <p className="mt-2 text-xs font-medium">No questions yet</p>
                <p className="text-[11px] text-slate-400">
                  Ask a question above or upvote existing questions.
                </p>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const hasUpvoted = q.upvotes.includes(currentProfileId);

                return (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition"
                  >
                    {/* Upvote Button Column */}
                    <button
                      onClick={() => onUpvoteQuestion(q.id)}
                      className={`flex flex-col items-center justify-center rounded-xl p-1.5 min-w-[36px] transition border ${
                        hasUpvoted
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                      title={hasUpvoted ? "Remove upvote" : "Upvote this question"}
                    >
                      <span className="text-xs leading-none">▲</span>
                      <span className="text-[11px] font-bold mt-0.5">{q.upvoteCount}</span>
                    </button>

                    {/* Question Content Column */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {q.authorName}
                        </span>
                        <Badge variant={q.isAnswered ? "emerald" : "amber"} size="sm">
                          {q.isAnswered ? "Answered" : "Pending"}
                        </Badge>
                      </div>

                      <p className={`text-xs ${q.isAnswered ? "text-slate-500 line-through" : "text-slate-900 font-medium"}`}>
                        {q.question}
                      </p>

                      {/* Instructor Action: Mark Answered */}
                      {isHostOrCoHost && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => onAnswerQuestion(q.id, !q.isAnswered)}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline"
                          >
                            {q.isAnswered ? "Reopen Question" : "Mark as Answered ✓"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
