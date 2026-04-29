import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { withAuthCookie } from "@/lib/serverAuth";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";

export const preferredRegion = "icn1";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Use either the public or private client ID key
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  try {
    if (!GOOGLE_CLIENT_ID) {
      console.error("Google login error: GOOGLE_CLIENT_ID is not set in environment variables");
      return NextResponse.json(
        { error: "Konfigurasi Google Login (Client ID) belum lengkap di server" },
        { status: 500 }
      );
    }

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const { credential } = await request.json();

    if (!credential || typeof credential !== "string") {
      return NextResponse.json(
        { error: "Token Google tidak ditemukan atau format salah" },
        { status: 400 }
      );
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError);
      return NextResponse.json(
        { 
          error: "Token Google tidak valid atau sudah kadaluwarsa",
          detail: verifyError instanceof Error ? verifyError.message : String(verifyError)
        },
        { status: 401 }
      );
    }

    if (!payload?.email) {
      return NextResponse.json(
        { error: "Tidak bisa mendapatkan email dari Google" },
        { status: 400 }
      );
    }

    const email = payload.email;
    const name = payload.name || email.split("@")[0] || "Pengguna";
    const picture = payload.picture ?? null;

    // 1. Check if user exists in User table
    let user = await prisma.user.findUnique({ where: { email } });

    // 2. If not in User table, check Bidan table
    if (!user) {
      const bidan = await prisma.bidan.findUnique({ where: { email } });
      if (bidan) {
        const token = signToken({ userId: bidan.id, role: "BIDAN" });
        return withAuthCookie(
          NextResponse.json({
            token,
            user: {
              id: bidan.id,
              name: bidan.name,
              email: bidan.email,
              status: "BIDAN",
              role: "BIDAN",
              avatar: bidan.avatar,
              phone: bidan.phone,
              experience: bidan.experience,
              bio: bidan.bio,
              specializations: bidan.specializations,
              harga: bidan.harga,
            },
          }),
          token
        );
      }

      // 3. If neither, create a new User (Social Login signup)
      const hashedPassword = await bcrypt.hash(randomUUID(), 10);

      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          avatar: picture,
          role: "USER",
          status: "PROGRAM_HAMIL",
        },
      });
    }

    // Generate session token
    const token = signToken({ userId: user.id, role: user.role });

    return withAuthCookie(
      NextResponse.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          role: user.role,
          gestationalAge: user.gestationalAge,
          avatar: user.avatar,
          phone: user.phone,
          age: user.age,
        },
      }),
      token
    );
  } catch (error) {
    console.error("Google login internal error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal login dengan Google";
    return NextResponse.json(
      {
        error: "Gagal login dengan Google (Internal Server Error)",
        detail: process.env.NODE_ENV === "production" ? undefined : message,
      },
      { status: 500 }
    );
  }
}
