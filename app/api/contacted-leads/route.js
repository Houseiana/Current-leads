import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import { toContactedLead } from "@/lib/serializers";
import { normalizePhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { rows } = await query(
    "SELECT * FROM contacted_leads ORDER BY created_at DESC"
  );
  return NextResponse.json({ leads: rows.map(toContactedLead) });
}

export async function POST(req) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  for (const k of ["name", "phone", "salesName", "status"]) {
    if (!body?.[k]?.toString().trim()) {
      return NextResponse.json(
        { error: `Missing field: ${k}` },
        { status: 400 }
      );
    }
  }

  const phone = body.phone.trim();
  const { rows } = await query(
    `INSERT INTO contacted_leads (
       name, phone, phone_normalized, email, area, unit,
       sales_name, sales_phone_used, sales_whatsapp_used,
       status, houseiana_unit_link, web_lead_source_link
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9,
       $10, $11, $12
     ) RETURNING *`,
    [
      body.name.trim(),
      phone,
      normalizePhone(phone),
      body.email ? body.email.trim() : null,
      body.area ? body.area.trim() : null,
      body.unit ? body.unit.trim() : null,
      body.salesName.trim(),
      body.salesPhoneUsed ? body.salesPhoneUsed.trim() : null,
      body.salesWhatsAppUsed ? body.salesWhatsAppUsed.trim() : null,
      body.status,
      body.houseianaUnitLink ? body.houseianaUnitLink.trim() : null,
      body.webLeadSourceLink ? body.webLeadSourceLink.trim() : null,
    ]
  );
  return NextResponse.json({ lead: toContactedLead(rows[0]) }, { status: 201 });
}
