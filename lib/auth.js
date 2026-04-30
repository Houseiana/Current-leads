import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { query } from "./db";

const COOKIE_NAME = "houseiana_session";
const ALG = "HS256";
const EXPIRES_HOURS = 24 * 7;

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signSession(payload) {
  const exp = Math.floor(Date.now() / 1000) + EXPIRES_HOURS * 3600;
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getSecret());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALG],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return await verifySession(token);
}

export async function setSessionCookie(payload) {
  const token = await signSession(payload);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EXPIRES_HOURS * 3600,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function authenticate(username, password) {
  if (!username || !password) return null;
  const { rows } = await query(
    "SELECT id, username, password_hash, role FROM users WHERE username = $1",
    [username]
  );
  if (rows.length === 0) return null;
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  return { id: user.id, username: user.username, role: user.role };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
