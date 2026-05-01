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

// Look up an existing entry with the same phone (normalized) in any
// of the three tables. Optionally exclude one row by id (for PUT,
// where the row being updated naturally matches itself). Returns the
// duplicate or null. Blacklist takes priority — if a phone is on the
// blacklist, that's reported regardless of fresh/contacted matches.
export async function findDuplicatePhone(
  phoneNormalized,
  { excludeFreshId, excludeContactedId, excludeBlacklistId } = {}
) {
  if (!phoneNormalized) return null;
  const tail = `%${phoneNormalized.slice(-9)}`;

  // 1. Blacklist (highest priority)
  const blParams = excludeBlacklistId
    ? [phoneNormalized, tail, excludeBlacklistId]
    : [phoneNormalized, tail];
  const blSql = excludeBlacklistId
    ? `SELECT id, name, phone, reason
       FROM blacklist
       WHERE (phone_normalized = $1 OR phone_normalized LIKE $2)
         AND id <> $3
       LIMIT 1`
    : `SELECT id, name, phone, reason
       FROM blacklist
       WHERE phone_normalized = $1 OR phone_normalized LIKE $2
       LIMIT 1`;
  const bl = await query(blSql, blParams);
  if (bl.rows.length > 0) {
    return {
      location: "blacklist",
      id: bl.rows[0].id,
      name: bl.rows[0].name,
      phone: bl.rows[0].phone,
      reason: bl.rows[0].reason,
    };
  }

  // 2. Fresh leads
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

  // 3. Contacted leads
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

// Pure check used by routes that already parsed the body (e.g. PUT).
export function checkActionPassword(supplied) {
  const expected = process.env.DELETE_PASSWORD;
  if (!expected) {
    return {
      error: NextResponse.json(
        { error: "DELETE_PASSWORD is not configured on the server." },
        { status: 503 }
      ),
    };
  }
  if (!supplied || supplied !== expected) {
    return {
      error: NextResponse.json(
        { error: "Wrong password.", code: "WRONG_PASSWORD" },
        { status: 401 }
      ),
    };
  }
  return { ok: true };
}

// DELETE wrapper: reads body / X-Delete-Password header itself.
export async function requireDeletePassword(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const supplied =
    body?.password || req.headers.get("x-delete-password") || "";
  return checkActionPassword(supplied);
}
