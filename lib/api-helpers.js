import { NextResponse } from "next/server";
import { getSession } from "./auth";

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
