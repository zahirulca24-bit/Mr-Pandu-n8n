import { Pool } from "pg";
import { ActivityLog } from "./types";

let pool: Pool | null = null;

export function getSecondaryDb(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Common requirement for Neon Serverless
  });

  return pool;
}

export async function checkSecondaryHealth(): Promise<"connected" | "disconnected" | "not_configured"> {
  const db = getSecondaryDb();
  if (!db) return "not_configured";

  try {
    const res = await db.query("SELECT 1");
    if (res.rowCount === 1) {
      return "connected";
    }
    return "disconnected";
  } catch (err) {
    console.error("Secondary DB health check exception:", err);
    return "disconnected";
  }
}

export async function logActivity(data: Partial<ActivityLog>): Promise<void> {
  const db = getSecondaryDb();
  if (!db) {
    console.warn("Cannot log activity: Secondary DB not configured");
    return;
  }

  try {
    const query = `
      INSERT INTO activity_logs (source_type, source_id, event_type, level, message, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await db.query(query, [
      data.source_type,
      data.source_id || null,
      data.event_type,
      data.level || 'info',
      data.message,
      data.metadata ? JSON.stringify(data.metadata) : '{}',
    ]);
  } catch (error) {
    console.error("Failed to save activity log to Secondary DB:", error);
    // Don't throw for non-critical logging
  }
}
