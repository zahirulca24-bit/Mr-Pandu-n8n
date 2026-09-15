"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, Mic, Paperclip, Send, Sparkles, Square } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Activity = "empty" | "thinking" | "approval" | "completed" | "tool" | "error"
interface ChatWorkspaceProps { onActivityChange?: (activity: Activity) => void }

interface RunResponse {
  ok?: boolean
  connected?: boolean
  message?: string
  error?: string
  approvalRequired?: boolean
  requestId?: string
}

export default function ChatWorkspace({ onActivityChange }: ChatWorkspaceProps) {
  const [input, setInput] = useState("")
  const [submittedText, setSubmittedText] = useState("")
  const [responseText, setResponseText] = useState("")
  const [running, setRunning] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [approvalRequired, setApprovalRequired] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const send = async () => {
    const message = input.trim()
    if (!message || running) return

    const controller = new AbortController()
    setAbortController(controller)
    setSubmittedText(message)
    setResponseText("")
    setError("")
    setApprovalRequired(false)
    setSent(true)
    setRunning(true)
    onActivityChange?.("thinking")
    setInput("")

    try {
      const response = await fetch("/api/n8n/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      })
      const body = (await response.json()) as RunResponse

      if (!response.ok || body.ok !== true) {
        throw new Error(body.error || "n8n request failed.")
      }

      setResponseText(body.message || "n8n accepted the request.")
      setApprovalRequired(body.approvalRequired === true)
      onActivityChange?.(body.approvalRequired ? "approval" : "completed")
    } catch (requestError) {
      if (controller.signal.aborted) {
        setError("Request stopped.")
        onActivityChange?.("empty")
      } else {
        setError(requestError instanceof Error ? requestError.message : "Could not reach n8n.")
        onActivityChange?.("error")
      }
    } finally {
      setRunning(false)
      setAbortController(null)
    }
  }

  const stop = () => abortController?.abort()

  return (
    <section className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 shadow-2xl shadow-black/20">
      <header className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><Sparkles className="h-4 w-4" /></div>
          <div><h2 className="text-sm font-semibold text-slate-100">Mr. Pandu</h2><p className="text-xs text-slate-500">{running ? "Sending to n8n" : "Your Personal Agent"}</p></div>
        </div>
        <span className="flex items-center gap-2 text-xs text-slate-500"><i className={`h-2 w-2 rounded-full ${running ? "animate-pulse bg-amber-400" : "bg-slate-600"}`} />{running ? "Running" : "Ready"}</span>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        {!sent ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5"><Sparkles className="h-7 w-7 text-cyan-300" /></div>
            <h3 className="text-lg font-semibold text-slate-100">What can I help you with?</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">The web workspace now sends requests through the secured server-side n8n bridge.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Test n8n connection", "Plan a workflow", "Explain a task"].map((item) => <button key={item} onClick={() => setInput(item)} className="rounded-full border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-400/40 hover:text-cyan-200">{item}</button>)}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-br-md bg-cyan-400/10 px-4 py-3 text-sm text-slate-200">{submittedText}</div></div>
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-900 text-cyan-300"><Sparkles className="h-4 w-4" /></div>
              <div className="max-w-[80%]">
                {running && <div className="rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400"><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 animate-pulse" />Waiting for n8n…</span></div>}
                {!running && responseText && <div className="rounded-2xl rounded-bl-md border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm leading-6 text-slate-300"><span className="mb-2 flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" />n8n responded</span>{responseText}{approvalRequired && <p className="mt-3 text-xs text-amber-300">Approval is required by the upstream workflow. Execution is not performed by this frontend.</p>}</div>}
                {!running && error && <div className="rounded-2xl rounded-bl-md border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{error}</span></div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800/80 bg-slate-950/80 p-4">
        <div className="flex items-end gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
          <Button variant="ghost" size="icon" className="text-slate-500" disabled title="File wiring will be added later"><Paperclip className="h-4 w-4" /></Button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); void send() } }} placeholder="Ask Mr. Pandu anything…" rows={1} className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600" />
          <Button variant="ghost" size="icon" className="text-slate-500" disabled title="Voice wiring will be added later"><Mic className="h-4 w-4" /></Button>
          {running ? <Button size="icon" variant="outline" className="border-amber-400/40 text-amber-300" onClick={stop}><Square className="h-4 w-4" /></Button> : <Button size="icon" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => void send()} disabled={!input.trim()}><Send className="h-4 w-4" /></Button>}
        </div>
        <p className="mt-2 px-2 text-[10px] text-slate-600">Secrets stay server-side. The browser never receives the n8n shared secret.</p>
      </div>
    </section>
  )
}
