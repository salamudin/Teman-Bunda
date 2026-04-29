import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Quiet in production — every query was being shipped to Vercel's log
    // ingestion, adding ~tens of ms per request and filling logs.
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
