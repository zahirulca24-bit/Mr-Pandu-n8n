import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DEFAULT_PATH = "pandu/control"
const MAX_MESSAGE_LENGTH = 4_000

function getConfig() {
  const rawBaseUrl = process.env.N8N_BASE_URL?.trim()
  const sharedSecret = process.env.PANDU_N8N_SHARED_SECRET?.trim()
  const webhookPath = (process.env.N8N_WEBHOOK_PATH?.trim() || DEFAULT_PATH).replace(/^\/+|\/+$/g, "")

  if (!rawBaseUrl || !sharedSecret || !/^[A-Za-z0-9._/-]+$/.test(webhookPath) || webhookPath.includes("..")) {
    return null
  }

  try {
    const parsed = new URL(rawBaseUrl)
    const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"
    if (parsed.protocol !== "https:" && !isLocal) return null
    return {
      baseUrl: rawBaseUrl.replace(/\/+$/, ""),
      sharedSecret,
      webhookPath,
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const config = getConfig()
  if (!config) {
    return NextResponse.json(
      { ok: false, connected: false, error: "bridge configuration missing" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  let message = ""
  try {
    const payload = (await request.json()) as { message?: unknown }
    message = typeof payload.message === "string" ? payload.message.trim() : ""
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 })
  }

  if (!message) {
    return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ ok: false, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }, { status: 413 })
  }

  const requestId = randomUUID()
  const webhookUrl = `${config.baseUrl}/webhook/${config.webhookPath}`

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Pandu-Shared-Secret": config.sharedSecret,
      },
      body: JSON.stringify({
        requestId,
        source: "mr-pandu-web",
        message,
        requestedAt: new Date().toISOString(),
      }),
    })

    const raw = await upstream.text()
    let upstreamBody: Record<string, unknown> | null = null
    try {
      upstreamBody = raw ? (JSON.parse(raw) as Record<string, unknown>) : null
    } catch {
      upstreamBody = null
    }

    if (!upstream.ok) {
      let friendlyError = `n8n returned HTTP ${upstream.status}.`
      const n8nMessage = typeof upstreamBody?.message === "string" ? upstreamBody.message : ""
      
      if (upstream.status === 404 || n8nMessage.includes("is not registered")) {
        friendlyError = "workflow inactive / webhook not found"
      } else if (upstream.status === 401 || upstream.status === 403 || n8nMessage.includes("Unauthorized")) {
        friendlyError = "authentication failed"
      } else if (n8nMessage) {
        friendlyError = n8nMessage
      }

      return NextResponse.json(
        {
          ok: false,
          connected: true,
          requestId,
          error: friendlyError,
        },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      )
    }

    const messageResponse = typeof upstreamBody?.message === "string"
      ? upstreamBody.message
      : "n8n accepted the request."

    try {
      const { saveRun } = await import("@/lib/db")
      await saveRun({
        id: requestId, // We use the requestId as the run ID
        status: "running",
        started_at: new Date().toISOString(),
        metadata: { message, source: "mr-pandu-web" }
      })
    } catch (dbError) {
      // Ignore DB errors so the chat doesn't break if DB is missing/down
      console.warn("Failed to persist run:", dbError)
    }

    return NextResponse.json(
      {
        ok: true,
        connected: true,
        requestId,
        message: messageResponse,
        approvalRequired: upstreamBody?.approvalRequired === true,
        upstreamRequestId:
          typeof upstreamBody?.requestId === "string" ? upstreamBody.requestId : null,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      { ok: false, connected: false, requestId, error: "n8n unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    )
  }
}
