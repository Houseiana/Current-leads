import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import { toFreshLead } from "@/lib/serializers";
import { normalizePhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const phone = (body.phone || "").trim();
  const { rows } = await query(
    `UPDATE fresh_leads SET
       name = $1,
       phone = $2,
       phone_normalized = $3,
       area = $4,
       project_name = $5,
       lead_source = $6,
       lead_source_link = $7,
       updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      (body.name || "").trim(),
      phone,
      normalizePhone(phone),
      (body.area || "").trim(),
      (body.projectName || "").trim(),
      (body.leadSource || "").trim(),
      body.leadSourceLink ? body.leadSourceLink.trim() : null,
      params.id,
    ]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ lead: toFreshLead(rows[0]) });
}

export async function DELETE(_req, { params }) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { rowCount } = await query("DELETE FROM fresh_leads WHERE id = $1", [
    params.id,
  ]);
  if (!rowCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
