import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import { displayName } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { rows } = await query(
    "SELECT username FROM users WHERE role = 'sales' ORDER BY username"
  );
  return NextResponse.json({
    users: rows.map((r) => ({
      username: r.username,
      displayName: displayName(r.username),
    })),
  });
}
