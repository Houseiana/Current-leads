import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import {
  toBlacklistEntry,
  toContactedLead,
  toFreshLead,
} from "@/lib/serializers";
import { normalizePhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req) {
  const auth = await requireRole(["admin", "sales"]);
  if (auth.error) return auth.error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const raw = (body?.phone || "").trim();
  if (!raw) return NextResponse.json({ type: "none" });
  const norm = normalizePhone(raw);
  if (!norm) return NextResponse.json({ type: "none" });

  const tail = norm.slice(-9);
  const tailPattern = `%${tail}`;

  // 1. Blacklist — visible to both roles, highest priority
  const blacklist = await query(
    `SELECT * FROM blacklist
     WHERE phone_normalized = $1 OR phone_normalized LIKE $2
     LIMIT 1`,
    [norm, tailPattern]
  );
  if (blacklist.rows.length > 0) {
    return NextResponse.json({
      type: "blacklist",
      lead: toBlacklistEntry(blacklist.rows[0]),
    });
  }

  // 2. Contacted leads
  const contacted = await query(
    `SELECT * FROM contacted_leads
     WHERE phone_normalized = $1 OR phone_normalized LIKE $2
     LIMIT 1`,
    [norm, tailPattern]
  );
  if (contacted.rows.length > 0) {
    const lead = toContactedLead(contacted.rows[0]);
    if (auth.session.role === "sales") {
      return NextResponse.json({
        type: "contacted",
        lead: {
          name: lead.name,
          phone: lead.phone,
          area: lead.area,
          unit: lead.unit,
          salesName: lead.salesName,
          status: lead.status,
          contactedAt: lead.contactedAt,
        },
      });
    }
    return NextResponse.json({ type: "contacted", lead });
  }

  // 3. Fresh leads — admin only
  if (auth.session.role === "admin") {
    const fresh = await query(
      `SELECT * FROM fresh_leads
       WHERE phone_normalized = $1 OR phone_normalized LIKE $2
       LIMIT 1`,
      [norm, tailPattern]
    );
    if (fresh.rows.length > 0) {
      return NextResponse.json({
        type: "fresh",
        lead: toFreshLead(fresh.rows[0]),
      });
    }
  }

  return NextResponse.json({ type: "none" });
}
