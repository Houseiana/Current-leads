import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import { toContactedLead } from "@/lib/serializers";
import { normalizePhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body?.salesName?.toString().trim()) {
    return NextResponse.json(
      { error: "salesName is required" },
      { status: 400 }
    );
  }
  if (!body?.status?.toString().trim()) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  try {
    const created = await withTransaction(async (client) => {
      const fresh = await client.query(
        "SELECT * FROM fresh_leads WHERE id = $1",
        [params.id]
      );
      if (fresh.rows.length === 0) {
        const err = new Error("not_found");
        err.code = "NOT_FOUND";
        throw err;
      }
      const f = fresh.rows[0];

      const inserted = await client.query(
        `INSERT INTO contacted_leads (
           name, phone, phone_normalized, email, area, unit,
           sales_name, sales_phone_used, sales_whatsapp_used,
           status, unit_link, web_lead_source_link, lead_type,
           created_at, updated_at, contacted_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9,
           $10, $11, $12, $13,
           $14, NOW(), NOW()
         ) RETURNING *`,
        [
          f.name,
          f.phone,
          normalizePhone(f.phone),
          body.email ? body.email.trim() : null,
          body.area ? body.area.trim() : f.area,
          body.unit ? body.unit.trim() : null,
          body.salesName.trim(),
          body.salesPhoneUsed ? body.salesPhoneUsed.trim() : null,
          body.salesWhatsAppUsed ? body.salesWhatsAppUsed.trim() : null,
          body.status,
          body.unitLink ? body.unitLink.trim() : null,
          f.lead_source_link,
          body.leadType ? body.leadType.trim() : f.lead_type,
          f.created_at,
        ]
      );

      await client.query("DELETE FROM fresh_leads WHERE id = $1", [params.id]);
      return inserted.rows[0];
    });

    return NextResponse.json(
      { lead: toContactedLead(created) },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
