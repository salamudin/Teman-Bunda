import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { OAuth2Client } from "google-auth-library";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// Make sure to add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local
const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Token Google tidak ditemukan" },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return NextResponse.json(
        { error: "Tidak bisa mendapatkan email dari Google" },
        { status: 400 }
      );
    }

    const { email, name, picture } = payload;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Check if it's a Bidan (if you don't allow bidans to signup via Google, maybe skip this or just find them)
      const bidan = await prisma.bidan.findUnique({ where: { email } });
      if (bidan) {
        // Return login for bidan
        const token = signToken({ userId: bidan.id, role: "BIDAN" });
        return NextResponse.json({
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
        });
      }

      // Create new user if neither exists
      // Give them a random UUID password safely hashed
      const randomPassword = uuidv4();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await prisma.user.create({
        data: {
          email,
          name: name || "Pengguna",
          password: hashedPassword,
          avatar: picture || null,
          role: "USER",
          status: "PROGRAM_HAMIL",
        },
      });
    }

    // Return normal token for User
    const token = signToken({ userId: user.id, role: user.role });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json({ error: "Gagal login dengan Google" }, { status: 500 });
  }
}
