import Image from "next/image";

export default function Home() {
  const futureCapabilities = [
    {
      title: "Infinite Canvas & Shapes",
      badge: "Canvas Engine",
      color: "border-indigo-200 bg-indigo-50/50 text-indigo-700",
      description:
        "Smooth drawing, sticky notes, geometry shapes, mind mapping tools, and freehand sketching tuned for creative student teams.",
    },
    {
      title: "Real-Time Multiplayer",
      badge: "WebSocket / Socket.IO",
      color: "border-rose-200 bg-rose-50/50 text-rose-700",
      description:
        "Watch teammates move across the board with live color-coded cursors, real-time edits, and zero-conflict synchronization.",
    },
    {
      title: "Study Groups & Hackathons",
      badge: "Team Spaces",
      color: "border-amber-200 bg-amber-50/50 text-amber-700",
      description:
        "Organize boards by project, brainstorm hackathon ideas, create revision maps for exams, and share join links instantly.",
    },
    {
      title: "Persistent & Secure",
      badge: "Cloud Storage & Auth",
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-700",
      description:
        "Cloud-saved boards with PostgreSQL persistence and secure access controls so you can close your laptop and return anytime.",
    },
  ];

  const roadmapMilestones = [
    { step: "Step 01", name: "Foundation & Git Architecture", status: "Completed", current: true },
    { step: "Step 02", name: "Next.js UI & Layouts", status: "Up Next", current: false },
    { step: "Step 03", name: "Interactive State & Controls", status: "Planned", current: false },
    { step: "Step 04", name: "Single-User Konva Canvas", status: "Planned", current: false },
    { step: "Step 05", name: "Object Manipulation & Persistence", status: "Planned", current: false },
    { step: "Step 06", name: "Backend & Database Schema", status: "Planned", current: false },
    { step: "Step 07", name: "Real-time Socket.IO Server", status: "Planned", current: false },
    { step: "Step 08", name: "Live Multiplayer & Cursors", status: "Planned", current: false },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="COLLABO logo"
              width={36}
              height={36}
              className="rounded-xl shadow-sm"
              priority
            />
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                COLLABO
              </span>
              <span className="hidden text-xs text-slate-500 sm:inline sm:ml-2">
                Whiteboard for Students
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Step 1: Foundation
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Pill Announcement */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-900 shadow-sm">
              <span className="text-base">✨</span>
              <span>Built for GGSIPU's study groups, hackathons &amp; student project teams</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
              Think together. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                Build ideas together.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
              COLLABO is an upcoming real-time collaborative whiteboard designed to make group
              brainstorming, mind mapping, diagramming, and project sprint planning playful, visual,
              and frictionless.
            </p>

            {/* Stage Notice Banner */}
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-indigo-100 bg-white/90 p-6 text-left shadow-xl shadow-indigo-100/40">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white font-bold">
                  01
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Current Milestone: Step 1 Foundation Stage
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    We are building COLLABO systematically step-by-step. In this milestone, we have
                    established the project architecture, Next.js framework base, Git repository
                    rules, and technical documentation. Interactive canvases and real-time sockets
                    will be added in following steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Capabilities Section */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Planned Product Capabilities
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Here is what we will architect and implement across our upcoming milestones.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {futureCapabilities.map((capability) => (
                <article
                  key={capability.title}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
                >
                  <div>
                    <span
                      className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold ${capability.color}`}
                    >
                      {capability.badge}
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {capability.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-400">
                    Status: Architecture Planned
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Step-by-Step Learning Roadmap Overview */}
        <section className="px-6 py-12 bg-white/60 border-y border-slate-200/60">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Development Roadmap
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Our staged engineering milestones from empty directory to full-stack real-time product.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {roadmapMilestones.map((m) => (
                <div
                  key={m.step}
                  className={`rounded-xl border p-4 transition ${m.current
                      ? "border-indigo-400 bg-indigo-50/70 shadow-sm"
                      : "border-slate-200 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={m.current ? "text-indigo-700" : "text-slate-400"}>
                      {m.step}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.current
                          ? "bg-indigo-600 text-white"
                          : m.status === "Up Next"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-800">
                    {m.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Semantic Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-sm text-slate-500">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-700">
            COLLABO &bull; Think together. Build ideas together.
          </p>
          <p className="text-xs text-slate-400">
            Step 1: Project Foundation &bull; Designed for portfolio-grade engineering
          </p>
        </div>
      </footer>
    </div>
  );
}
