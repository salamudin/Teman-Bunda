// PATCH /api/bookings/[id] - Update booking status (e.g., confirm payment)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        bidan: { select: { id: true, name: true, avatar: true, specializations: true } },
        user: { select: { id: true, name: true, avatar: true } },
        availability: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (booking.userId !== payload.userId && booking.bidanId !== payload.userId && payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      booking: {
        ...booking,
        bidan: { ...booking.bidan, specializations: JSON.parse(booking.bidan.specializations) },
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
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { status, paymentProof } = await request.json();

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentProof && { paymentProof }),
      },
    });

    // Send notification on status change
    if (status === "CONFIRMED") {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          bookingId: booking.id,
          title: "Konsultasi Dikonfirmasi! 🎉",
          body: "Pembayaran Anda telah dikonfirmasi. Jadwal konsultasi siap.",
        },
      });
    }

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
