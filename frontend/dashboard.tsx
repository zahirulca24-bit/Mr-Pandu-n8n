"use client"

import { useState } from "react"
import {
  Activity,
  ArrowUpRight,
  CheckSquare,
  Clock,
  Database,
  Globe,
  Link2,
  Lock,
  Menu,
  PanelRight,
  Plus,
  Settings,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react"
import Sidebar, { type View } from "@/components/layout/Sidebar"
import ChatWorkspace, { type Activity as WorkspaceActivity } from "@/components/layout/ChatWorkspace"
import RightPanel from "@/components/layout/RightPanel"
import DashboardCards from "@/components/dashboard/DashboardCards"
import { Button } from "@/components/ui/button"

const emptyViews: Record<
  Exclude<View, "chat" | "dashboard" | "agents">,
  { title: string; eyebrow: string; description: string; empty: string; icon: typeof Workflow }
> = {
  automations: {
    title: "Automations",
    eyebrow: "Workflow Control",
    description: "Connect n8n and future automation services here without tying the platform to one provider.",
    empty: "No automation service connected yet.",
    icon: Workflow,
  },
  tasks: {
    title: "Tasks & Runs",
    eyebrow: "Execution",
    description: "Agent tasks, worker runs, approvals, and execution status will appear here when backend wiring is live.",
    empty: "No task or run data connected yet.",
    icon: CheckSquare,
  },
  data: {
    title: "Data & Storage",
    eyebrow: "Storage",
    description: "Manage database and storage connections from one place while keeping provider-specific details separate.",
    empty: "No database or storage provider connected yet.",
    icon: Database,
  },
  communications: {
    title: "Communications",
    eyebrow: "Channels",
    description: "Mail and future communication channels will be available here after secure connection and authorization.",
    empty: "No communication channel connected yet.",
    icon: Globe,
  },
  integrations: {
    title: "Integrations",
    eyebrow: "Connections",
    description: "External services, APIs, and connectors can be registered here as the Pandu ecosystem grows.",
    empty: "No external integration connected yet.",
    icon: Link2,
  },
  scheduled: {
    title: "Scheduled",
    eyebrow: "Planner",
    description: "Recurring agent jobs, worker schedules, and automation timing will appear here once the scheduler is connected.",
    empty: "No scheduled jobs connected yet.",
    icon: Clock,
  },
  activity: {
    title: "Activity & Logs",
    eyebrow: "Observability",
    description: "Real execution events and logs will appear here. This page does not generate placeholder operational history.",
    empty: "Waiting for real activity data.",
    icon: Activity,
  },
  security: {
    title: "Security",
    eyebrow: "Access Control",
    description: "Permissions, approval rules, service access, and secret status can be managed here after backend security wiring.",
    empty: "Security controls are not connected yet.",
    icon: Lock,
  },
  settings: {
    title: "Settings",
    eyebrow: "Platform",
    description: "Workspace preferences and service configuration will live here as real settings become available.",
    empty: "No configurable backend settings connected yet.",
    icon: Settings,
  },
}

function EmptyModule({ view }: { view: Exclude<View, "chat" | "dashboard" | "agents"> }) {
  const config = emptyViews[view]
  const Icon = config.icon

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">{config.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold">{config.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
      </div>
      <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 px-6 text-center">
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-slate-800 bg-slate-900 text-slate-600">
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-slate-400">{config.empty}</p>
          <p className="mt-1 text-xs text-slate-600">Waiting for a real connection — no mock operational data is shown.</p>
        </div>
      </div>
    </div>
  )
}

function viewTitle(view: View) {
  if (view === "chat") return "Mr. Pandu Workspace"
  if (view === "dashboard") return "Workspace Overview"
  if (view === "agents") return "Agents & Workers"
  return emptyViews[view].title
}

export default function Dashboard() {
  const [view, setView] = useState<View>("chat")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [activity, setActivity] = useState<WorkspaceActivity>("empty")
  const [recent, setRecent] = useState<string[]>([])

  const newChat = () => {
    setView("chat")
    setActivity("empty")
    if (!recent.includes("New workspace chat")) {
      setRecent((items) => ["New workspace chat", ...items].slice(0, 3))
    }
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-[#070b12] text-slate-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        currentView={view}
        onViewChange={setView}
        recent={recent}
        onNewChat={newChat}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/50 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-400 md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-100">{viewTitle(view)}</p>
              <p className="hidden text-xs text-slate-600 sm:block">Private workspace · Not connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-slate-800 px-3 py-1.5 text-xs text-slate-500 sm:inline">No live data</span>
            <Button variant="ghost" size="icon" className="text-slate-400 lg:hidden" onClick={() => setContextOpen(true)} aria-label="Open context panel">
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <section className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {view === "chat" && (
              <div className="mx-auto flex h-full max-w-4xl flex-col">
                <div className="min-h-0 flex-1">
                  <ChatWorkspace onActivityChange={setActivity} />
                </div>
              </div>
            )}

            {view === "dashboard" && (
              <div className="mx-auto max-w-6xl space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Overview</p>
                  <h1 className="mt-1 text-2xl font-semibold">Workspace overview</h1>
                  <p className="mt-2 text-sm text-slate-500">A quiet place to see what is connected and what is waiting.</p>
                </div>
                <DashboardCards />
              </div>
            )}

            {view === "agents" && (
              <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Workspace</p>
                    <h1 className="mt-1 text-2xl font-semibold">Agents & Workers</h1>
                    <p className="mt-2 text-sm text-slate-500">Mr. Pandu is the first agent; the workspace is ready for future agents and workers.</p>
                  </div>
                  <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" disabled title="Agent creation will be connected later">
                    <Plus className="mr-2 h-4 w-4" />Add Agent / Worker
                  </Button>
                </div>

                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                  <div className="flex flex-col items-start gap-4 sm:flex-row">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">Mr. Pandu</h2>
                        <span className="rounded-full border border-cyan-400/20 px-2 py-0.5 text-[10px] text-cyan-300">Agent</span>
                        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-500">Not connected</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Your personal agent for reasoning through tasks and preparing actions for approval.</p>
                      <p className="mt-3 text-xs text-slate-600">Last activity: Waiting for data</p>
                    </div>
                    <Button variant="ghost" className="text-slate-400" onClick={() => setView("chat")}>
                      Open Workspace <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-slate-800 text-center">
                  <div>
                    <Users className="mx-auto h-6 w-6 text-slate-700" />
                    <p className="mt-3 text-sm text-slate-500">No other agents or workers connected</p>
                    <p className="mt-1 text-xs text-slate-700">Add one when a real integration is ready.</p>
                  </div>
                </div>
              </div>
            )}

            {view !== "chat" && view !== "dashboard" && view !== "agents" && <EmptyModule view={view} />}
          </section>

          <div className="hidden w-80 shrink-0 border-l border-slate-800/80 lg:block">
            <RightPanel isOpen={contextOpen} onClose={() => setContextOpen(false)} activity={activity} />
          </div>
        </div>
      </div>

      {contextOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setContextOpen(false)} />}
      <div className="lg:hidden">{contextOpen && <RightPanel isOpen onClose={() => setContextOpen(false)} activity={activity} />}</div>
    </main>
  )
}
