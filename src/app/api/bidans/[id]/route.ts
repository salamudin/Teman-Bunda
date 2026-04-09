// GET /api/bidans/[id] - Single bidan detail with availabilities
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const now = new Date();
    // Use start of today so availabilities today are still valid
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
        harga: true,
        availabilities: {
          where: {
            isBooked: false,
            date: { gte: today },
          },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!bidan) {
      return NextResponse.json({ error: "Bidan tidak ditemukan" }, { status: 404 });
    }

    const response = NextResponse.json({
      bidan: {
        ...bidan,
        specializations: JSON.parse(bidan.specializations),
      },
    });

    // Short server cache for detail view (availability)
    response.headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=120");
    return response;

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

    const { bio, avatar, name, experience, specializations, harga, phone } = await request.json();
    
    const updated = await prisma.bidan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(experience !== undefined && { experience }),
        ...(specializations !== undefined && { specializations }),
        ...(harga !== undefined && { harga: parseInt(harga) || 150000 }),
      }
    });

    return NextResponse.json({ bidan: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
