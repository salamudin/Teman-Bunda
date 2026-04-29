import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, text, category, isAnonymous, rating } = body;

    if (!text || text.length > 100) {
      return NextResponse.json({ error: "Text must be 1-100 characters" }, { status: 400 });
    }

    const clampedRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const testimonial = await prisma.testimonial.create({
      data: {
        userId,
        name,
        text,
        category,
        rating: clampedRating,
        isAnonymous: !!isAnonymous,
        status: "PENDING", // Ensure all new testimonials need review
      },
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error("Testimonial creation error:", error);
    return NextResponse.json({ error: "Failed to submit testimonial" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit");

    const testimonials = await prisma.testimonial.findMany({
      where: { status: "ACCEPTED" },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit, 10) : 10,
      select: {
        id: true,
        name: true,
        text: true,
        category: true,
        rating: true,
        isAnonymous: true,
      }
    });

    // no-store ensures the response is never served from cache —
    // so newly-published testimonials appear immediately for all clients.
    return NextResponse.json(
      { testimonials },
      { headers: { "Cache-Control": "no-store, must-revalidate" } }
    );
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
