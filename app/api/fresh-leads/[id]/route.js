import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  checkActionPassword,
  duplicatePhoneResponse,
  findDuplicatePhone,
  requireDeletePassword,
  requireRole,
} from "@/lib/api-helpers";
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

  const pw = checkActionPassword(body?.password);
  if (pw.error) return pw.error;

  const phone = (body.phone || "").trim();
  const phoneNorm = normalizePhone(phone);

  const existing = await findDuplicatePhone(phoneNorm, {
    excludeFreshId: params.id,
  });
  if (existing) return duplicatePhoneResponse(existing);

  const { rows } = await query(
    `UPDATE fresh_leads SET
       name = $1,
       phone = $2,
       phone_normalized = $3,
       area = $4,
       project_name = $5,
       lead_source = $6,
       lead_source_link = $7,
       lead_type = $8,
       updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [
      (body.name || "").trim(),
      phone,
      phoneNorm,
      (body.area || "").trim(),
      (body.projectName || "").trim(),
      (body.leadSource || "").trim(),
      body.leadSourceLink ? body.leadSourceLink.trim() : null,
      body.leadType ? body.leadType.trim() : null,
      params.id,
    ]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ lead: toFreshLead(rows[0]) });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const pw = await requireDeletePassword(req);
  if (pw.error) return pw.error;
  const { rowCount } = await query("DELETE FROM fresh_leads WHERE id = $1", [
    params.id,
  ]);
  if (!rowCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
