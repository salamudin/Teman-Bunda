// GET /api/bidans - List all active bidans
// POST /api/bidans - Create bidan (admin only)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET() {
  try {
    const bidans = await prisma.bidan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        avatar: true,
        experience: true,
        bio: true,
        specializations: true,
        rating: true,
        totalReviews: true,
      },
      orderBy: { rating: "desc" },
    });

    const parsed = bidans.map((b: any) => ({
      ...b,
      specializations: JSON.parse(b.specializations),
    }));

    return NextResponse.json({ bidans: parsed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, experience, bio, specializations, phone } = body;

    const hashedPw = await hashPassword(password || "bidan123");
    const bidan = await prisma.bidan.create({
      data: {
        name,
        email,
        password: hashedPw,
        experience,
        bio: bio || "",
        specializations: JSON.stringify(specializations || []),
        phone: phone || null,
      },
    });

    return NextResponse.json({ bidan }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
