"use client"

import {
  MessageSquare,
  LayoutDashboard,
  Users,
  Workflow,
  CheckSquare,
  Database,
  Globe,
  Link2,
  Clock,
  Activity,
  Lock,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export type View =
  | "chat"
  | "dashboard"
  | "agents"
  | "automations"
  | "tasks"
  | "data"
  | "communications"
  | "integrations"
  | "scheduled"
  | "activity"
  | "security"
  | "settings"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onCollapsedChange?: (value: boolean) => void
  currentView: View
  onViewChange: (view: View) => void
  recent: string[]
  onNewChat: () => void
}

const items: Array<{ icon: typeof LayoutDashboard; label: string; view: View }> = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: Users, label: "Agents & Workers", view: "agents" },
  { icon: Workflow, label: "Automations", view: "automations" },
  { icon: CheckSquare, label: "Tasks & Runs", view: "tasks" },
  { icon: Database, label: "Data & Storage", view: "data" },
  { icon: Globe, label: "Communications", view: "communications" },
  { icon: Link2, label: "Integrations", view: "integrations" },
  { icon: Clock, label: "Scheduled", view: "scheduled" },
  { icon: Activity, label: "Activity & Logs", view: "activity" },
  { icon: Lock, label: "Security", view: "security" },
]

export default function Sidebar({
  isOpen = true,
  onClose,
  collapsed = false,
  onCollapsedChange,
  currentView,
  onViewChange,
  recent,
  onNewChat,
}: SidebarProps) {
  const navigate = (view: View) => {
    onViewChange(view)
    onClose?.()
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 md:relative ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-800/80 p-4">
          <button
            onClick={() => {
              onNewChat()
              onClose?.()
            }}
            className={`flex items-center gap-3 text-left ${collapsed ? "mx-auto" : ""}`}
            aria-label="New Chat"
            title={collapsed ? "Mr. Pandu — New Chat" : undefined}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-bold text-white shadow-lg shadow-cyan-950/40">
              MP
            </span>
            {!collapsed && (
              <span>
                <span className="block text-sm font-semibold text-slate-100">Mr. Pandu</span>
                <span className="block text-xs text-slate-500">Your Personal Agent</span>
              </span>
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden text-slate-500 hover:text-slate-100 md:inline-flex"
            onClick={() => onCollapsedChange?.(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="text-slate-500 md:hidden" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <button
            onClick={() => {
              onNewChat()
              onClose?.()
            }}
            title={collapsed ? "New Chat" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              currentView === "chat"
                ? "bg-cyan-400/10 text-cyan-300"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            {!collapsed && "New Chat"}
          </button>

          {items.map(({ icon: Icon, label, view }) => (
            <button
              key={label}
              onClick={() => navigate(view)}
              title={collapsed ? label : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                view === currentView
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {!collapsed && (
          <div className="border-t border-slate-800/80 p-3">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Recent</div>
            {recent.length ? (
              recent.map((title) => (
                <button
                  key={title}
                  onClick={() => navigate("chat")}
                  className="block w-full truncate rounded-md px-2 py-2 text-left text-xs text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                  title={title}
                >
                  {title}
                </button>
              ))
            ) : (
              <p className="px-2 py-2 text-xs text-slate-600">No recent chats yet</p>
            )}
          </div>
        )}

        <div className="border-t border-slate-800/80 p-3">
          <button
            onClick={() => navigate("settings")}
            title={collapsed ? "Settings" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              currentView === "settings"
                ? "bg-cyan-400/10 text-cyan-300"
                : "text-slate-500 hover:bg-slate-900 hover:text-slate-100"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && "Settings"}
          </button>
        </div>
      </aside>
    </>
  )
}
