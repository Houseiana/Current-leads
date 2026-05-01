import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireDeletePassword, requireRole } from "@/lib/api-helpers";
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
  const phoneNorm = normalizePhone(phone);

  const dup = await query(
    `SELECT name, phone, status, sales_name
     FROM contacted_leads
     WHERE phone_normalized = $1
        OR phone_normalized LIKE $2
     LIMIT 1`,
    [phoneNorm, `%${phoneNorm.slice(-9)}`]
  );
  if (dup.rows.length > 0) {
    const e = dup.rows[0];
    return NextResponse.json(
      {
        error: "This phone is already a contacted lead.",
        code: "PHONE_EXISTS_IN_CONTACTED",
        existing: {
          name: e.name,
          phone: e.phone,
          status: e.status,
          salesName: e.sales_name,
        },
      },
      { status: 409 }
    );
  }

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
