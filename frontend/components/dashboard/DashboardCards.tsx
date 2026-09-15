"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Database, MoreVertical, Radio, Users, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SystemHealth = {
  primaryDb: "connected" | "disconnected" | "not_configured" | "checking";
  secondaryDb: "connected" | "disconnected" | "not_configured" | "checking";
  n8n: "connected" | "disconnected" | "not_configured" | "checking";
}

export default function DashboardCards() {
  const [health, setHealth] = useState<SystemHealth>({
    primaryDb: "checking",
    secondaryDb: "checking",
    n8n: "checking",
  })

  useEffect(() => {
    let active = true
    fetch("/api/system/health", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as SystemHealth
        if (active) setHealth({
          primaryDb: body.primaryDb || "disconnected",
          secondaryDb: body.secondaryDb || "disconnected",
          n8n: body.n8n || "disconnected",
        })
      })
      .catch(() => {
        if (active) setHealth({ primaryDb: "disconnected", secondaryDb: "disconnected", n8n: "disconnected" })
      })
    return () => { active = false }
  }, [])

  const cards = [
    { title: "Agents Online", icon: Users, value: "—", color: "cyan", status: "No data connected" },
    { title: "Workers Running", icon: Zap, value: "—", color: "blue", status: "No data connected" },
    { title: "Tasks Today", icon: CheckCircle, value: "—", color: "green", status: "No data connected" },
    { title: "Primary DB (Supabase)", icon: Database, value: health.primaryDb === "connected" ? "OK" : "—", color: "purple", status: health.primaryDb },
    { title: "Secondary DB (Neon)", icon: Database, value: health.secondaryDb === "connected" ? "OK" : "—", color: "orange", status: health.secondaryDb },
    { title: "n8n Health", icon: Radio, value: health.n8n === "connected" ? "OK" : "—", color: "green", status: health.n8n },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const colorClasses = {
          cyan: "text-cyan-500 bg-cyan-500/10",
          blue: "text-blue-500 bg-blue-500/10",
          green: "text-green-500 bg-green-500/10",
          purple: "text-purple-500 bg-purple-500/10",
          orange: "text-orange-500 bg-orange-500/10",
        }
        return (
          <Card key={card.title} className="border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-colors hover:border-slate-600/50">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">{card.title}</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled><MoreVertical className="h-4 w-4 text-slate-500" /></Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div><div className="text-2xl font-bold text-slate-100">{card.value}</div><div className="mt-1 text-xs text-slate-500">Status: <span className="text-slate-400">{card.status}</span></div></div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}><Icon className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
