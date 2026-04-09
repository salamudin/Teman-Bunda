import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/bidans/availability - Fetch logged-in bidan's availability
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== "BIDAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const availabilities = await prisma.availability.findMany({
      where: { bidanId: payload.userId as string },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ],
    });

    return NextResponse.json({ availabilities });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/bidans/availability - Add or delete availability
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== "BIDAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, id, date, startTime, endTime } = await request.json();

    if (action === "ADD") {
      if (!date || !startTime || !endTime) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }

      const availability = await prisma.availability.create({
        data: {
          bidanId: payload.userId as string,
          date: new Date(date),
          startTime,
          endTime,
        },
      });

      // Purge cache for other pages to see the new schedule
      revalidatePath("/home");
      revalidatePath("/");
      revalidatePath("/bidans");
      revalidatePath(`/bidans/${payload.userId}`);
      revalidatePath(`/bidans/${payload.userId}/booking`);
      revalidatePath("/api/bidans");
      revalidatePath(`/api/bidans/${payload.userId}`);

      return NextResponse.json({ availability }, { status: 201 });
    }

    if (action === "DELETE") {
      if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

      // Check if it's already booked
      const existing = await prisma.availability.findUnique({
        where: { id },
        include: { booking: true }
      });

      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (existing.booking) {
        return NextResponse.json({ error: "Jadwal ini sudah dipesan, tidak bisa dihapus" }, { status: 400 });
      }

      await prisma.availability.delete({ where: { id } });
      
      // Purge cache for other pages to see the change
      revalidatePath("/home");
      revalidatePath("/");
      revalidatePath("/bidans");
      revalidatePath(`/bidans/${payload.userId}`);
      revalidatePath(`/bidans/${payload.userId}/booking`);
      revalidatePath("/api/bidans");
      revalidatePath(`/api/bidans/${payload.userId}`);

      return NextResponse.json({ message: "Deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
