import React, { Suspense } from "react";
import Link from "next/link";
import { BoardHeader } from "@/components/board/BoardHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 1. Async component that awaits dynamic route parameters
async function BoardWorkspace({ params }: BoardPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  return (
    <div className="flex h-screen flex-col bg-slate-100 overflow-hidden">
      {/* Board Navigation Header */}
      <BoardHeader roomId={decodedId} initialTitle={`${decodedId} Board`} />

      {/* Main Board Workspace Shell */}
      <main className="relative flex-1 overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] flex items-center justify-center p-6">
        {/* Workspace Shell Center Card */}
        <div className="relative z-10 max-w-xl w-full rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-2xl shadow-inner">
            🎨
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="indigo" size="sm" dot>
              Milestone 2 Live
            </Badge>
            <Badge variant="slate" size="sm">
              Dynamic Route: /board/{decodedId}
            </Badge>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Board Workspace Ready
          </h1>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            You successfully navigated to room{" "}
            <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {decodedId}
            </span>
            . In this milestone, we established the Next.js App Router dynamic segment,
            workspace layout, and reusable UI design system.
          </p>

          {/* Educational Inspector Box */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Next.js Routing Verification
            </h2>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <dt className="text-slate-400">Route Pattern</dt>
                <dd className="font-mono font-semibold text-slate-800">
                  /app/board/[id]/page.tsx
                </dd>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <dt className="text-slate-400">Received Param (id)</dt>
                <dd className="font-mono font-semibold text-indigo-700">
                  {decodedId}
                </dd>
              </div>
            </dl>
          </div>

          {/* Navigation & Next Step Teaser */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                &larr; Back to Home
              </Button>
            </Link>
            <Link href="/board/hackathon-sprint" className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                Try Another Room (#hackathon-sprint)
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-[11px] text-slate-400">
            Coming in Milestone 3: Interactive toolbar state &amp; tool selector &bull; Milestone 4: Konva 2D Canvas Engine
          </p>
        </div>
      </main>
    </div>
  );
}

// 2. Loading skeleton shown while dynamic params stream in
function BoardLoadingSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-slate-100 overflow-hidden animate-pulse">
      <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-slate-200" />
        <div className="h-8 w-20 rounded-xl bg-slate-200" />
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="h-64 w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100" />
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="h-4 w-64 rounded bg-slate-100" />
        </div>
      </main>
    </div>
  );
}

// 3. Page component wrapped in Suspense for Next.js Partial Prerendering (PPR)
export default function BoardPage({ params }: BoardPageProps) {
  return (
    <Suspense fallback={<BoardLoadingSkeleton />}>
      <BoardWorkspace params={params} />
    </Suspense>
  );
}
