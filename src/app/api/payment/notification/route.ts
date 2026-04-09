import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, transaction_status, fraud_status, status_code, signature_key, gross_amount } = body;

    // 1. Verify Signature for Security
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-YOUR-SANDBOX-KEY";
    const dataString = order_id + status_code + gross_amount + serverKey;
    const computedSignature = crypto.createHash("sha512").update(dataString).digest("hex");

    if (signature_key !== computedSignature) {
      console.warn("Invalid Signature Hook Attempted");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 2. Extract Booking ID from order_id (TB-bookingId-timestamp)
    const bookingId = order_id.split("-")[1];
    if (!bookingId) return NextResponse.json({ error: "Malformed Order ID" }, { status: 400 });

    // 3. Update Booking Status Based on Midtrans status
    let updateStatus = "";
    if (transaction_status === "capture") {
      if (fraud_status === "challenge") updateStatus = "CHALLENGE";
      else if (fraud_status === "accept") updateStatus = "PAID";
    } else if (transaction_status === "settlement") {
      updateStatus = "PAID"; // Important status!
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      updateStatus = "CANCELLED";
    } else if (transaction_status === "pending") {
      updateStatus = "PENDING";
    }

    if (updateStatus) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: updateStatus === "PAID" ? "PAID" : updateStatus 
        }
      });
      console.log(`Payment Updated for Booking ${bookingId}: ${updateStatus}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
