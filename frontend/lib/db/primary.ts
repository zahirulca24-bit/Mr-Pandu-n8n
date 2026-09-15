import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Run } from "./types";

let supabase: SupabaseClient | null = null;

export function getPrimaryDb(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  return supabase;
}

export async function checkPrimaryHealth(): Promise<"connected" | "disconnected" | "not_configured"> {
  const db = getPrimaryDb();
  if (!db) return "not_configured";

  try {
    // A simple query to check connection
    const { error } = await db.from("users").select("id").limit(1);
    if (error) {
      console.error("Primary DB health check failed:", error.message);
      return "disconnected";
    }
    return "connected";
  } catch (err) {
    console.error("Primary DB health check exception:", err);
    return "disconnected";
  }
}

export async function saveRun(data: Partial<Run>): Promise<Run | null> {
  const db = getPrimaryDb();
  if (!db) {
    console.warn("Cannot save run: Primary DB not configured");
    return null;
  }

  const { data: savedRun, error } = await db
    .from("runs")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Failed to save run to Primary DB:", error.message);
    throw error;
  }

  return savedRun;
}
