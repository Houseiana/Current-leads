import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  checkActionPassword,
  duplicatePhoneResponse,
  findDuplicatePhone,
  requireDeletePassword,
  requireRole,
} from "@/lib/api-helpers";
import { toBlacklistEntry } from "@/lib/serializers";
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

  if (!body?.phone?.toString().trim()) {
    return NextResponse.json(
      { error: "Phone is required." },
      { status: 400 }
    );
  }

  const phone = body.phone.trim();
  const phoneNorm = normalizePhone(phone);

  const existing = await findDuplicatePhone(phoneNorm, {
    excludeBlacklistId: params.id,
  });
  if (existing) return duplicatePhoneResponse(existing);

  const { rows } = await query(
    `UPDATE blacklist SET
       name = $1,
       phone = $2,
       phone_normalized = $3,
       reason = $4,
       notes = $5,
       updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [
      body.name ? body.name.trim() : null,
      phone,
      phoneNorm,
      body.reason ? body.reason.trim() : null,
      body.notes ? body.notes.toString().trim() : null,
      params.id,
    ]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ entry: toBlacklistEntry(rows[0]) });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const pw = await requireDeletePassword(req);
  if (pw.error) return pw.error;
  const { rowCount } = await query(
    "DELETE FROM blacklist WHERE id = $1",
    [params.id]
  );
  if (!rowCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
