import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// httpOnly cookie set on login/register; read by server components so pages
// like /bookings can query the DB and render real HTML on the first response,
// with zero client-side waterfall before content appears.
export const AUTH_COOKIE = "tb-auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, matches JWT exp

export type ServerAuth = { userId: string; role: string };

export async function getServerAuth(): Promise<ServerAuth | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || typeof payload.userId !== "string") return null;
  return {
    userId: payload.userId as string,
    role: (payload.role as string) ?? "USER",
  };
}

// Attaches the SSR auth cookie to a response. Use on every route that mints a
// new token (login / register / google / sync-cookie) so first navigation to a
// server-rendered page picks it up without a client round trip.
export function withAuthCookie<T extends NextResponse>(response: T, token: string): T {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}
