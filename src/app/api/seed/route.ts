// POST /api/seed - Seed Novianti as primary bidan (Phase 1 ready, multi-bidan scalable)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { addDays, setHours, setMinutes, startOfDay } from "date-fns";

const BIDANS = [
  {
    name: "Novianti Tri Hastuti",
    email: "novianti@temanbunda.id",
    password: "bidan123",
    experience: "10 tahun",
    bio: "Bidan profesional bersertifikat dengan pengalaman 10 tahun di bidang kebidanan. Spesialis program hamil, pendampingan kehamilan trimester 1–3, serta konsultasi ASI dan menyusui. Lulusan Poltekkes Kemenkes dengan berbagai sertifikasi laktasi internasional.",
    specializations: ["Program Hamil", "Kehamilan", "Menyusui / ASI"],
    phone: "08123456789",
    rating: 5.0,
    totalReviews: 312,
    isPrimary: true,
  },
];

// Future Phase 2 bidans (commented out, ready to enable)
// const PHASE2_BIDANS = [
//   { name: "Ratna Kusuma, Amd.Keb", specializations: ["Kehamilan", "Program Hamil"] },
//   { name: "Maya Puspita, S.Tr.Keb", specializations: ["Menyusui / ASI"] },
// ];

const TIME_SLOTS = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "19:00", end: "20:00" },
  { start: "20:00", end: "21:00" },
];

export async function POST() {
  try {
    const existing = await prisma.bidan.count();
    if (existing > 0) {
      return NextResponse.json({
        message: "Database sudah di-seed sebelumnya",
        bidanCount: existing,
      });
    }

    for (const data of BIDANS) {
      const hashed = await hashPassword(data.password);
      const bidan = await prisma.bidan.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashed,
          experience: data.experience,
          bio: data.bio,
          specializations: JSON.stringify(data.specializations),
          phone: data.phone,
          rating: data.rating,
          totalReviews: data.totalReviews,
        },
      });

      // Create availability for next 14 days (Mon–Sat)
      const availabilities: {
        bidanId: string;
        date: Date;
        startTime: string;
        endTime: string;
        isBooked: boolean;
      }[] = [];

      for (let day = 1; day <= 21; day++) {
        const date = addDays(new Date(), day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0) continue; // Skip Sunday

        for (const slot of TIME_SLOTS) {
          const hour = parseInt(slot.start.split(":")[0]);
          availabilities.push({
            bidanId: bidan.id,
            date: setHours(setMinutes(startOfDay(date), 0), hour),
            startTime: slot.start,
            endTime: slot.end,
            isBooked: false,
          });
        }
      }

      await prisma.availability.createMany({ data: availabilities });
    }

    // Create admin
    const adminPw = await hashPassword("admin123");
    await prisma.user.upsert({
      where: { email: "admin@temanbunda.id" },
      update: {},
      create: {
        name: "Admin TemanBunda",
        email: "admin@temanbunda.id",
        password: adminPw,
        role: "ADMIN",
        status: "PROGRAM_HAMIL",
      },
    });

    // Create demo user
    const userPw = await hashPassword("user123");
    await prisma.user.upsert({
      where: { email: "demo@temanbunda.id" },
      update: {},
      create: {
        name: "Siti Rahayu",
        email: "demo@temanbunda.id",
        password: userPw,
        role: "USER",
        status: "HAMIL",
        gestationalAge: 24,
        age: 28,
        phone: "08567890123",
      },
    });

    return NextResponse.json({
      message: "✅ Seed berhasil! Novianti Tri Hastuti siap sebagai bidan utama.",
      data: {
        bidans: 1,
        slotCount: "~144 slot (21 hari, Senin–Sabtu)",
        adminEmail: "admin@temanbunda.id / admin123",
        demoEmail: "demo@temanbunda.id / user123",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Seed gagal", details: String(error) },
      { status: 500 }
    );
  }
}
