import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
    },
    db: { connected: false, usersTable: false, userCount: 0 },
  };
  try {
    const tables = await query(
      `SELECT to_regclass('public.users') AS t`
    );
    result.db.connected = true;
    result.db.usersTable = !!tables.rows[0]?.t;
    if (result.db.usersTable) {
      const c = await query("SELECT COUNT(*)::int AS c FROM users");
      result.db.userCount = c.rows[0]?.c || 0;
    }
  } catch (err) {
    result.db.error = err.message;
  }
  return NextResponse.json(result);
}
