import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId } = await request.json();
    if (!bookingId) return NextResponse.json({ error: "Booking ID required" }, { status: 400 });

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        bidan: true,
        user: true,
      },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.userId !== payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // 1. Create Midtrans Parameter
    const parameter = {
      transaction_details: {
        order_id: `TB-${booking.id}-${Date.now()}`, // Unique ID
        gross_amount: booking.amount || booking.bidan.harga || 150000,
      },
      customer_details: {
        first_name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || "",
      },
      item_details: [
        {
          id: booking.bidan.id,
          price: booking.amount || booking.bidan.harga || 150000,
          quantity: 1,
          name: `Konsultasi ${booking.bidan.name}`,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://chatbidan.com'}/bookings`,
      }
    };

    // 2. Get Snap Token
    const transaction = await snap.createTransaction(parameter);
    
    // Save token to booking record
    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        paymentToken: transaction.token,
        grossAmount: parameter.transaction_details.gross_amount 
      }
    });

    return NextResponse.json({ token: transaction.token, redirectUrl: transaction.redirect_url });

  } catch (error) {
    console.error("Midtrans Error:", error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
