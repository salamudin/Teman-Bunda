"use client";

// Prewarms /api/bookings so the Jadwal Saya tab doesn't have to wait for React
// hydration → Zustand rehydrate → useEffect → fetch. Trigger points:
//   - BottomBar hover/touchstart on the Jadwal tab (earliest signal the user is
//     about to navigate; mobile touchstart fires ~50–100ms before the click)
//   - Home page mount (users commonly navigate from there)
// Consumer: src/app/bookings/page.tsx awaits the in-flight promise instead of
// firing its own fetch, collapsing the client-side waterfall to a single round trip.

type PrefetchEntry = {
  promise: Promise<any>;
  startedAt: number;
  filter: string;
};

const AUTH_STORAGE_KEY = "temanbunda-auth";
const MAX_AGE_MS = 30_000;

const cache = new Map<string, PrefetchEntry>();

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export function prefetchBookings(filter: string = "ALL"): Promise<any> | null {
  const token = readToken();
  if (!token) return null;

  const existing = cache.get(filter);
  if (existing && Date.now() - existing.startedAt < MAX_AGE_MS) {
    return existing.promise;
  }

  const promise = fetch(`/api/bookings?status=${filter}&page=1&limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  cache.set(filter, { promise, startedAt: Date.now(), filter });
  return promise;
}

export function consumeBookingsPrefetch(filter: string = "ALL"): Promise<any> | null {
  const entry = cache.get(filter);
  if (!entry) return null;
  if (Date.now() - entry.startedAt > MAX_AGE_MS) {
    cache.delete(filter);
    return null;
  }
  cache.delete(filter);
  return entry.promise;
}

export function invalidateBookingsPrefetch() {
  cache.clear();
}
