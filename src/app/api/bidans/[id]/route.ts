// GET /api/bidans/[id] - Single bidan detail with availabilities
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bidan = await prisma.bidan.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        experience: true,
        bio: true,
        specializations: true,
        rating: true,
        totalReviews: true,
        availabilities: {
          where: {
            isBooked: false,
            date: { gte: new Date() },
          },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!bidan) {
      return NextResponse.json({ error: "Bidan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      bidan: {
        ...bidan,
        specializations: JSON.parse(bidan.specializations),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload || payload.userId !== id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bio, avatar } = await request.json();
    
    const updated = await prisma.bidan.update({
      where: { id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      }
    });

    return NextResponse.json({ bidan: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
