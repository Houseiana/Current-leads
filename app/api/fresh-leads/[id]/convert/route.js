import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import {
  duplicatePhoneResponse,
  findDuplicatePhone,
  requireRole,
} from "@/lib/api-helpers";
import { toContactedLead } from "@/lib/serializers";
import { displayName, normalizePhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  const auth = await requireRole(["admin", "sales"]);
  if (auth.error) return auth.error;
  const isSales = auth.session.role === "sales";

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Sales reps don't pick a sales name — it's their own.
  if (isSales && !body?.salesName) {
    body.salesName = displayName(auth.session.username);
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

      // Sales can only convert leads they own.
      if (isSales && f.owner !== auth.session.username) {
        const err = new Error("not_found");
        err.code = "NOT_FOUND";
        throw err;
      }

      // Guard: a contacted_leads row with the same phone may already
      // exist (e.g., inserted manually). Fail before touching anything.
      const dupCtc = await client.query(
        `SELECT id, name, phone, status, sales_name
         FROM contacted_leads
         WHERE phone_normalized = $1 OR phone_normalized LIKE $2
         LIMIT 1`,
        [normalizePhone(f.phone), `%${normalizePhone(f.phone).slice(-9)}`]
      );
      if (dupCtc.rows.length > 0) {
        const e = dupCtc.rows[0];
        const err = new Error("duplicate");
        err.code = "PHONE_ALREADY_EXISTS";
        err.existing = {
          location: "contacted",
          id: e.id,
          name: e.name,
          phone: e.phone,
          status: e.status,
          salesName: e.sales_name,
        };
        throw err;
      }

      const inserted = await client.query(
        `INSERT INTO contacted_leads (
           name, phone, phone_normalized, email, area, unit,
           sales_name, sales_phone_used, sales_whatsapp_used,
           status, unit_link, web_lead_source_link, lead_type, notes,
           call_at, owner, created_at, updated_at, contacted_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9,
           $10, $11, $12, $13, $14,
           $15, $16, $17, NOW(), NOW()
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
          body.notes ? body.notes.toString().trim() : null,
          body.callAt || null,
          f.owner || null,
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
    if (err.code === "PHONE_ALREADY_EXISTS") {
      return duplicatePhoneResponse(err.existing);
    }
    throw err;
  }
}
