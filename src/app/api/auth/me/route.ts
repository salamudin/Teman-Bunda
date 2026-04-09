// GET /api/auth/me
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Token invalid" }, { status: 401 });
    }

    let user: any = null;
    if (payload.role === "BIDAN") {
      user = await prisma.bidan.findUnique({
        where: { id: payload.userId as string },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          experience: true,
          bio: true,
          specializations: true,
          rating: true,
          totalReviews: true,
          harga: true,
          createdAt: true,
        },
      });
      if (user) {
        user.role = "BIDAN";
      }
    } else {
      user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          age: true,
          status: true,
          gestationalAge: true,
          hpht: true,
          dueDate: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      });
    }


    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
