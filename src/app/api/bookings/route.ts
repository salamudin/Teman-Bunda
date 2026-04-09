import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const whereClause = payload.role === "BIDAN" 
      ? { bidanId: payload.userId as string } 
      : { userId: payload.userId as string };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        bidan: {
          select: { id: true, name: true, avatar: true, specializations: true },
        },
        availability: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = bookings.map((b: any) => ({
      ...b,
      bidan: {
        ...b.bidan,
        specializations: JSON.parse(b.bidan.specializations),
      },
    }));

    return NextResponse.json({ bookings: parsed });
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
