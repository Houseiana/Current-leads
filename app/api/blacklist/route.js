import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  duplicatePhoneResponse,
  findDuplicatePhone,
  requireRole,
} from "@/lib/api-helpers";
import { toBlacklistEntry } from "@/lib/serializers";
import { normalizePhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { rows } = await query(
    "SELECT * FROM blacklist ORDER BY created_at DESC"
  );
  return NextResponse.json({ entries: rows.map(toBlacklistEntry) });
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

  if (!body?.phone?.toString().trim()) {
    return NextResponse.json(
      { error: "Phone is required." },
      { status: 400 }
    );
  }

  const phone = body.phone.trim();
  const phoneNorm = normalizePhone(phone);

  // Reject if already on the blacklist (or anywhere else with this phone)
  const existing = await findDuplicatePhone(phoneNorm);
  if (existing) return duplicatePhoneResponse(existing);

  const { rows } = await query(
    `INSERT INTO blacklist (name, phone, phone_normalized, reason, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      body.name ? body.name.trim() : null,
      phone,
      phoneNorm,
      body.reason ? body.reason.trim() : null,
      body.notes ? body.notes.toString().trim() : null,
    ]
  );
  return NextResponse.json(
    { entry: toBlacklistEntry(rows[0]) },
    { status: 201 }
  );
}
