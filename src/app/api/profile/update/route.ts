import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const payload = token ? verifyToken(token) : null;

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, avatar, status, gestationalAge, age, phone, hpht, dueDate, experience, bio, specializations, harga } = await request.json();

    let updatedUser: any;

    if (payload.role === "BIDAN") {
      updatedUser = await prisma.bidan.update({
        where: { id: payload.userId as string },
        data: {
          ...(name && { name }),
          ...(avatar !== undefined && { avatar }),
          ...(phone !== undefined && { phone }),
          ...(experience !== undefined && { experience }),
          ...(bio !== undefined && { bio }),
          ...(specializations !== undefined && { specializations }), // raw string for now
          ...(harga !== undefined && { harga: parseInt(harga) || 150000 }),
        },
      });
      updatedUser.role = "BIDAN";
    } else {
      updatedUser = await prisma.user.update({
        where: { id: payload.userId as string },
        data: {
          ...(name && { name }),
          ...(avatar !== undefined && { avatar }),
          ...(status && { status }),
          ...(gestationalAge !== undefined && { gestationalAge: parseInt(gestationalAge) || null }),
          ...(hpht !== undefined && { hpht: hpht ? new Date(hpht) : null }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(age !== undefined && { age: parseInt(age) || null }),
          ...(phone !== undefined && { phone }),
        },
      });
    }


    return NextResponse.json({ 
      message: "Profil diperbarui ✅",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
