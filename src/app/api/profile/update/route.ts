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

    const { name, avatar, status, gestationalAge, age, phone } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId as string },
      data: {
        ...(name && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(status && { status }),
        ...(gestationalAge !== undefined && { gestationalAge: parseInt(gestationalAge) || null }),
        ...(age !== undefined && { age: parseInt(age) || null }),
        ...(phone !== undefined && { phone }),
      },
    });

    return NextResponse.json({ 
      message: "Profil diperbarui ✅",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        gestationalAge: updatedUser.gestationalAge,
        age: updatedUser.age,
        phone: updatedUser.phone
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
