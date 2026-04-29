import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

function isAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    if (!["PENDING", "ACCEPTED", "REJECTED", "HIDDEN"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { id } = await params;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("Failed to update testimonial status:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
