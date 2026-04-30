import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "houseiana_session";

async function readSession(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);

  if (pathname === "/login") {
    if (session) {
      const dest = session.role === "admin" ? "/" : "/sales";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && session.role !== "admin") {
    return NextResponse.redirect(new URL("/sales", req.url));
  }
  if (pathname.startsWith("/sales") && session.role !== "sales") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sales/:path*", "/login"],
};
