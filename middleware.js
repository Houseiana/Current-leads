import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "app_session";
const LOGIN_PATHS = [
  "/login",
  "/login/admin",
  "/login/sales",
  "/login/dataentry",
];

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

function homeForRole(role) {
  if (role === "admin") return "/";
  if (role === "sales") return "/sales";
  if (role === "dataentry") return "/dataentry";
  return "/login";
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);

  if (LOGIN_PATHS.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(
        new URL(homeForRole(session.role), req.url)
      );
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/" && session.role !== "admin") {
    return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
  }
  if (pathname.startsWith("/sales") && session.role !== "sales") {
    return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
  }
  if (pathname.startsWith("/dataentry") && session.role !== "dataentry") {
    return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/sales/:path*",
    "/dataentry/:path*",
    "/login",
    "/login/:path*",
  ],
};
