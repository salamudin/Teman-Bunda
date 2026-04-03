// POST /api/auth/login
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    let account: any = await prisma.user.findUnique({ where: { email } });
    let isBidan = false;
    
    if (!account) {
      account = await prisma.bidan.findUnique({ where: { email } });
      isBidan = true;
    }

    if (!account) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, account.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const role = isBidan ? "BIDAN" : account.role;
    const token = signToken({ userId: account.id, role });

    return NextResponse.json({
      token,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        status: isBidan ? "BIDAN" : account.status,
        role,
        gestationalAge: isBidan ? null : account.gestationalAge,
        avatar: account.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
