import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  checkActionPassword,
  duplicatePhoneResponse,
  findDuplicatePhone,
  requireDeletePassword,
  requireRole,
} from "@/lib/api-helpers";
import { toContactedLead } from "@/lib/serializers";
import { normalizePhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
  const auth = await requireRole(["admin", "sales"]);
  if (auth.error) return auth.error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const pw = checkActionPassword(body?.password);
  if (pw.error) return pw.error;

  // Sales can only edit leads they own.
  if (auth.session.role === "sales") {
    const own = await query(
      "SELECT owner FROM contacted_leads WHERE id = $1",
      [params.id]
    );
    if (own.rows.length === 0 || own.rows[0].owner !== auth.session.username) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const phone = (body.phone || "").trim();
  const phoneNorm = normalizePhone(phone);

  const existing = await findDuplicatePhone(phoneNorm, {
    excludeContactedId: params.id,
  });
  if (existing) return duplicatePhoneResponse(existing);

  const { rows } = await query(
    `UPDATE contacted_leads SET
       name = $1,
       phone = $2,
       phone_normalized = $3,
       email = $4,
       area = $5,
       unit = $6,
       sales_name = $7,
       sales_phone_used = $8,
       sales_whatsapp_used = $9,
       status = $10,
       unit_link = $11,
       web_lead_source_link = $12,
       lead_type = $13,
       notes = $14,
       call_at = $15,
       updated_at = NOW()
     WHERE id = $16
     RETURNING *`,
    [
      (body.name || "").trim(),
      phone,
      phoneNorm,
      body.email ? body.email.trim() : null,
      body.area ? body.area.trim() : null,
      body.unit ? body.unit.trim() : null,
      (body.salesName || "").trim(),
      body.salesPhoneUsed ? body.salesPhoneUsed.trim() : null,
      body.salesWhatsAppUsed ? body.salesWhatsAppUsed.trim() : null,
      body.status,
      body.unitLink ? body.unitLink.trim() : null,
      body.webLeadSourceLink ? body.webLeadSourceLink.trim() : null,
      body.leadType ? body.leadType.trim() : null,
      body.notes ? body.notes.toString().trim() : null,
      body.callAt || null,
      params.id,
    ]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ lead: toContactedLead(rows[0]) });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole(["admin", "sales"]);
  if (auth.error) return auth.error;
  const pw = await requireDeletePassword(req);
  if (pw.error) return pw.error;

  let sql = "DELETE FROM contacted_leads WHERE id = $1";
  const args = [params.id];
  if (auth.session.role === "sales") {
    sql += " AND owner = $2";
    args.push(auth.session.username);
  }
  const { rowCount } = await query(sql, args);
  if (!rowCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
