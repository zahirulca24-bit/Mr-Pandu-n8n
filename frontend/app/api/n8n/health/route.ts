import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getBaseUrl() {
  const raw = process.env.N8N_BASE_URL?.trim()
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return null
    }
    return raw.replace(/\/+$/, "")
  } catch {
    return null
  }
}

export async function GET() {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    return NextResponse.json(
      { ok: false, connected: false, configured: false, service: "n8n", status: "Not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  try {
    const response = await fetch(`${baseUrl}/healthz`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json,text/plain" },
    })

    return NextResponse.json(
      {
        ok: response.ok,
        connected: response.ok,
        configured: true,
        service: "n8n",
        status: response.ok ? "Connected" : `Health check returned ${response.status}`,
      },
      { status: response.ok ? 200 : 502, headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      { ok: false, connected: false, configured: true, service: "n8n", status: "Unreachable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    )
  }
}
