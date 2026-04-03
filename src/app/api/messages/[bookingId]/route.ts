// GET /api/messages/[bookingId] - Chat history
// POST /api/messages/[bookingId] - Send message
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const messages = await prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const senderType = payload.role === "BIDAN" ? "BIDAN" : "USER";
    let senderName = "Unknown";
    
    if (senderType === "BIDAN") {
      const bidan = await prisma.bidan.findUnique({ where: { id: payload.userId as string } });
      if (bidan) senderName = bidan.name;
    } else {
      const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
      if (user) senderName = user.name;
    }

    const message = await prisma.message.create({
      data: {
        bookingId,
        senderId: payload.userId as string,
        senderType,
        senderName,
        content: content.trim(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
