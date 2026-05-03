import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import {
  toBlacklistEntry,
  toContactedLead,
  toFreshLead,
} from "@/lib/serializers";
import { displayName, normalizePhone } from "@/lib/utils";

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

  // 1. Blacklist (highest priority — visible to everyone)
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
    const full = toContactedLead(contacted.rows[0]);

    if (auth.session.role === "sales") {
      const owner = full.owner || null;
      const isSelf = owner && owner === auth.session.username;
      return NextResponse.json({
        type: "contacted",
        ownership: isSelf ? "self" : owner ? "other" : "noOwner",
        ownerDisplay: owner ? displayName(owner) : null,
        lead: {
          name: full.name,
          phone: full.phone,
          area: full.area,
          unit: full.unit,
          status: full.status,
          contactedAt: full.contactedAt,
          // expose only enough for sales to know the call status
          // when it's their own client
          ...(isSelf
            ? {
                email: full.email,
                salesName: full.salesName,
                callAt: full.callAt,
                notes: full.notes,
              }
            : {}),
        },
      });
    }

    return NextResponse.json({ type: "contacted", lead: full });
  }

  // 3. Fresh leads — admin always sees; sales also sees but with ownership.
  const fresh = await query(
    `SELECT * FROM fresh_leads
     WHERE phone_normalized = $1 OR phone_normalized LIKE $2
     LIMIT 1`,
    [norm, tailPattern]
  );
  if (fresh.rows.length > 0) {
    const full = toFreshLead(fresh.rows[0]);
    if (auth.session.role === "sales") {
      const owner = full.owner || null;
      const isSelf = owner && owner === auth.session.username;
      return NextResponse.json({
        type: "fresh",
        ownership: isSelf ? "self" : owner ? "other" : "noOwner",
        ownerDisplay: owner ? displayName(owner) : null,
        lead: {
          name: full.name,
          phone: full.phone,
          area: full.area,
          ...(isSelf
            ? {
                projectName: full.projectName,
                leadSource: full.leadSource,
                leadSourceLink: full.leadSourceLink,
                createdAt: full.createdAt,
              }
            : {}),
        },
      });
    }
    return NextResponse.json({ type: "fresh", lead: full });
  }

  return NextResponse.json({ type: "none" });
}
