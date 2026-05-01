import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { query } from "./db";

export async function requireRole(roles) {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session };
}

// Look up an existing lead with the same phone (normalized) in either
// table. Optionally exclude one row by id (for PUT, where the row being
// updated naturally matches itself). Returns the duplicate or null.
export async function findDuplicatePhone(
  phoneNormalized,
  { excludeFreshId, excludeContactedId } = {}
) {
  if (!phoneNormalized) return null;
  const tail = `%${phoneNormalized.slice(-9)}`;

  const freshParams = excludeFreshId
    ? [phoneNormalized, tail, excludeFreshId]
    : [phoneNormalized, tail];
  const freshSql = excludeFreshId
    ? `SELECT id, name, phone
       FROM fresh_leads
       WHERE (phone_normalized = $1 OR phone_normalized LIKE $2)
         AND id <> $3
       LIMIT 1`
    : `SELECT id, name, phone
       FROM fresh_leads
       WHERE phone_normalized = $1 OR phone_normalized LIKE $2
       LIMIT 1`;
  const fresh = await query(freshSql, freshParams);
  if (fresh.rows.length > 0) {
    return {
      location: "fresh",
      id: fresh.rows[0].id,
      name: fresh.rows[0].name,
      phone: fresh.rows[0].phone,
    };
  }

  const ctcParams = excludeContactedId
    ? [phoneNormalized, tail, excludeContactedId]
    : [phoneNormalized, tail];
  const ctcSql = excludeContactedId
    ? `SELECT id, name, phone, status, sales_name
       FROM contacted_leads
       WHERE (phone_normalized = $1 OR phone_normalized LIKE $2)
         AND id <> $3
       LIMIT 1`
    : `SELECT id, name, phone, status, sales_name
       FROM contacted_leads
       WHERE phone_normalized = $1 OR phone_normalized LIKE $2
       LIMIT 1`;
  const ctc = await query(ctcSql, ctcParams);
  if (ctc.rows.length > 0) {
    return {
      location: "contacted",
      id: ctc.rows[0].id,
      name: ctc.rows[0].name,
      phone: ctc.rows[0].phone,
      status: ctc.rows[0].status,
      salesName: ctc.rows[0].sales_name,
    };
  }

  return null;
}

export function duplicatePhoneResponse(existing) {
  return NextResponse.json(
    {
      error: "A lead with this phone number already exists.",
      code: "PHONE_ALREADY_EXISTS",
      existing,
    },
    { status: 409 }
  );
}

export async function requireDeletePassword(req) {
  const expected = process.env.DELETE_PASSWORD;
  if (!expected) {
    return {
      error: NextResponse.json(
        { error: "DELETE_PASSWORD is not configured on the server." },
        { status: 503 }
      ),
    };
  }
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const supplied =
    body?.password || req.headers.get("x-delete-password") || "";
  if (supplied !== expected) {
    return {
      error: NextResponse.json(
        { error: "Wrong password.", code: "WRONG_PASSWORD" },
        { status: 401 }
      ),
    };
  }
  return { ok: true };
}
