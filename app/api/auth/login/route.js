import { NextResponse } from "next/server";
import { authenticate, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const username = (body?.username || "").trim();
  const password = body?.password || "";
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }
  const user = await authenticate(username, password);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }
  await setSessionCookie({
    sub: String(user.id),
    username: user.username,
    role: user.role,
  });
  return NextResponse.json({ username: user.username, role: user.role });
}
