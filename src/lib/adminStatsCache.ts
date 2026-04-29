import { prisma } from "@/lib/prisma";

// In-process TTL cache for the admin dashboard's global booking aggregate.
// Lives in a plain lib module (not a route file) so importing only pulls the
// few dozen LOC it needs — not the full admin route handler with its imports.

export type AdminStats = { totalRevenue: number; pendingCount: number; totalCount: number };

const STATS_TTL_MS = 30_000;
let statsCache: { value: AdminStats; expiresAt: number } | null = null;

export async function loadAdminStats(): Promise<AdminStats> {
  const now = Date.now();
  if (statsCache && statsCache.expiresAt > now) return statsCache.value;

  const grouped = await prisma.booking.groupBy({
    by: ["status"],
    _count: { _all: true },
    _sum: { amount: true },
  });

  const totalRevenue = grouped
    .filter((s) => s.status === "CONFIRMED" || s.status === "COMPLETED")
    .reduce((acc, curr) => acc + (curr._sum.amount ?? 0), 0);
  const pendingCount = grouped.find((s) => s.status === "PAID")?._count._all ?? 0;
  const totalCount = grouped.reduce((acc, curr) => acc + (curr._count._all ?? 0), 0);

  const value: AdminStats = { totalRevenue, pendingCount, totalCount };
  statsCache = { value, expiresAt: now + STATS_TTL_MS };
  return value;
}

export function invalidateAdminStatsCache() {
  statsCache = null;
}
