import { NextResponse } from "next/server";
import { checkPrimaryHealth, checkSecondaryHealth } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function checkN8nHealth(): Promise<"connected" | "disconnected" | "not_configured"> {
  const baseUrl = process.env.N8N_BASE_URL?.trim()?.replace(/\/+$/, "");
  if (!baseUrl) return "not_configured";

  try {
    const response = await fetch(`${baseUrl}/healthz`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) return "connected";
    return "disconnected";
  } catch {
    return "disconnected";
  }
}

export async function GET() {
  const [primaryDb, secondaryDb, n8n] = await Promise.all([
    checkPrimaryHealth(),
    checkSecondaryHealth(),
    checkN8nHealth(),
  ]);

  return NextResponse.json(
    {
      primaryDb,
      secondaryDb,
      n8n,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
