import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { invalidateAdminStatsCache } from "@/lib/adminStatsCache";

export const dynamic = "force-dynamic";
// Run the function in Seoul, colocated with Supabase (ap-northeast-2). Cuts
// per-request DB RTT from ~200ms (Virginia → Seoul) to single-digit ms, and
// shrinks cold-start Prisma connection setup by roughly the same factor.
export const preferredRegion = "icn1";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    const whereClause: any = payload.role === "BIDAN"
      ? { bidanId: payload.userId as string }
      : { userId: payload.userId as string };

    if (status && status !== "ALL") {
      if (status === "ACTIVE") {
        whereClause.status = { in: ["PAID", "CONFIRMED"] };
      } else if (status === "DONE") {
        whereClause.status = { in: ["COMPLETED", "CANCELLED"] };
      } else {
        whereClause.status = status;
      }
    }

    // take: limit + 1 lets us know there's a next page without a separate COUNT(*)
    // scan, which on an unindexed table dominates the request time.
    const rows = await prisma.booking.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        amount: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatar: true } },
        bidan: { select: { id: true, name: true, avatar: true, specializations: true } },
        availability: { select: { date: true, startTime: true, endTime: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const bookings = pageRows.map((b) => ({
      ...b,
      bidan: {
        ...b.bidan,
        specializations: b.bidan.specializations ? JSON.parse(b.bidan.specializations) : [],
      },
    }));

    return NextResponse.json(
      {
        bookings,
        pagination: { page, limit, hasMore, totalPages: hasMore ? page + 1 : page },
      },
      {
        headers: {
          // Browser-private cache: revisiting the tab within 10s reuses the
          // response with no network; within 60s serves stale instantly while
          // a background revalidation refreshes it.
          "Cache-Control": "private, max-age=10, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bidanId, availabilityId, notes } = await request.json();

    // Check availability
    const avail = await prisma.availability.findUnique({
      where: { id: availabilityId },
    });
    if (!avail || avail.isBooked) {
      return NextResponse.json({ error: "Slot tidak tersedia" }, { status: 400 });
    }

    // Get bidan for price
    const bidanAccount = await prisma.bidan.findUnique({
      where: { id: bidanId },
      select: { harga: true, name: true }
    });
    if (!bidanAccount) return NextResponse.json({ error: "Bidan tidak ditemukan" }, { status: 404 });

    // Create booking + mark slot as booked
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          userId: payload.userId as string,
          bidanId,
          availabilityId,
          notes: notes || null,
          status: "WAITING_PAYMENT",
          amount: bidanAccount.harga,
        },
        include: {
          bidan: { select: { name: true } },
          availability: true,
        },
      }),
      prisma.availability.update({
        where: { id: availabilityId },
        data: { isBooked: true },
      }),
    ]);

    invalidateAdminStatsCache();

    // Create notification
    await prisma.notification.create({
      data: {
        userId: payload.userId as string,
        bookingId: booking.id,
        title: "Booking Berhasil",
        body: `Booking dengan ${bidanAccount.name} berhasil dibuat. Silakan lakukan pembayaran.`,
      },
    });
    
    // Purge cache for bidan pages to see the slot is now booked
    revalidatePath("/home");
    revalidatePath("/");
    revalidatePath("/bidans");
    revalidatePath(`/bidans/${bidanId}`);
    revalidatePath(`/bidans/${bidanId}/booking`);
    revalidatePath("/api/bidans");
    revalidatePath(`/api/bidans/${bidanId}`);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
