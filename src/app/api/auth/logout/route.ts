// POST /api/auth/logout — clears the httpOnly auth cookie so subsequent
// server-rendered pages see the user as logged out.
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/serverAuth";

export const preferredRegion = "icn1";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
