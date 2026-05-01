import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  duplicatePhoneResponse,
  findDuplicatePhone,
  requireRole,
} from "@/lib/api-helpers";
import { toFreshLead } from "@/lib/serializers";
import { normalizePhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { rows } = await query(
    "SELECT * FROM fresh_leads ORDER BY created_at DESC"
  );
  return NextResponse.json({ leads: rows.map(toFreshLead) });
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
  const required = ["name", "phone", "area", "projectName", "leadSource"];
  for (const k of required) {
    if (!body?.[k]?.toString().trim()) {
      return NextResponse.json(
        { error: `Missing field: ${k}` },
        { status: 400 }
      );
    }
  }

  const phone = body.phone.trim();
  const phoneNorm = normalizePhone(phone);

  const existing = await findDuplicatePhone(phoneNorm);
  if (existing) return duplicatePhoneResponse(existing);

  const { rows } = await query(
    `INSERT INTO fresh_leads
      (name, phone, phone_normalized, area, project_name, lead_source, lead_source_link, lead_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      body.name.trim(),
      phone,
      phoneNorm,
      body.area.trim(),
      body.projectName.trim(),
      body.leadSource.trim(),
      body.leadSourceLink ? body.leadSourceLink.trim() : null,
      body.leadType ? body.leadType.trim() : null,
    ]
  );
  return NextResponse.json({ lead: toFreshLead(rows[0]) }, { status: 201 });
}
