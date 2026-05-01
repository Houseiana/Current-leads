import { NextResponse } from "next/server";
import { authenticate, setSessionCookie } from "@/lib/auth";
import { ensureBootstrapped } from "@/lib/bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const username = (body?.username || "").trim();
  const password = body?.password || "";
  const expectedRole = body?.expectedRole;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured on the server." },
      { status: 503 }
    );
  }
  if (!process.env.SESSION_SECRET) {
    return NextResponse.json(
      { error: "SESSION_SECRET is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    await ensureBootstrapped();
  } catch (err) {
    return NextResponse.json(
      { error: `Bootstrap failed: ${err.message}` },
      { status: 500 }
    );
  }

  const user = await authenticate(username, password);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  if (
    expectedRole &&
    expectedRole !== user.role &&
    (expectedRole === "admin" || expectedRole === "sales")
  ) {
    return NextResponse.json(
      { error: "This account is not allowed on this page." },
      { status: 403 }
    );
  }

  await setSessionCookie({
    sub: String(user.id),
    username: user.username,
    role: user.role,
  });
  return NextResponse.json({ username: user.username, role: user.role });
}
