import React, { Suspense } from "react";
import { BoardWorkspace } from "@/components/board/BoardWorkspace";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Async container that awaits dynamic route parameters and mounts the interactive workspace
async function BoardWorkspaceContainer({ params }: BoardPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  return <BoardWorkspace roomId={decodedId} />;
}

// Loading skeleton displayed during partial prerendering streaming
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

export default function BoardPage({ params }: BoardPageProps) {
  return (
    <Suspense fallback={<BoardLoadingSkeleton />}>
      <BoardWorkspaceContainer params={params} />
    </Suspense>
  );
}
