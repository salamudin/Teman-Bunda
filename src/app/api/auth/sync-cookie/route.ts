// POST /api/auth/sync-cookie
// One-time migration helper. Users who already had a session (token in
// localStorage) before SSR was introduced won't have the auth cookie needed
// for server-side rendering. The client calls this endpoint on first mount
// with its Bearer token, and we mirror it into an httpOnly cookie so the
// next navigation can SSR with authenticated data.
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { withAuthCookie } from "@/lib/serverAuth";

export const preferredRegion = "icn1";

export async function POST(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get("Authorization"));
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return withAuthCookie(NextResponse.json({ ok: true }), token);
}
