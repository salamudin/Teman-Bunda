// GET /api/admin/bookings - All bookings for admin
// PATCH via /api/bookings/[id]
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { loadAdminStats } from "@/lib/adminStatsCache";

export const preferredRegion = "icn1";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;
    const wantStats = searchParams.get("stats") !== "0";

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    // take: limit + 1 avoids a second COUNT(*) scan just to compute hasMore.
    // Stats come from a cached groupBy so paging/filter clicks don't re-run it.
    const [rows, stats] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          amount: true,
          createdAt: true,
          paymentProof: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
          bidan: { select: { id: true, name: true } },
          availability: { select: { date: true, startTime: true, endTime: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit + 1,
      }),
      wantStats ? loadAdminStats() : Promise.resolve(null),
    ]);

    const hasMore = rows.length > limit;
    const bookings = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      bookings,
      pagination: { page, limit, hasMore, totalPages: hasMore ? page + 1 : page },
      stats,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
