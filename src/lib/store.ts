"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  gestationalAge: number | null;
  hpht?: string;
  dueDate?: string;
  avatar: string | null;
  phone: string | null;
  age: number | null;
  experience?: string;
  bio?: string;
  specializations?: string;
  harga?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),

    { 
      name: "temanbunda-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface UIState {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

interface BidanState {
  bidans: any[];
  setBidans: (bidans: any[]) => void;
  lastFetched: number | null;
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
}

export const useBidanStore = create<BidanState>()(
  persist(
    (set) => ({
      bidans: [],
      setBidans: (bidans) => set({ bidans, lastFetched: Date.now() }),
      lastFetched: null,
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    { 
      name: "temanbunda-bidans",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

interface BookingState {
  bookings: any[];
  setBookings: (bookings: any[]) => void;
  updateBooking: (id: string, updates: any) => void;
  lastFetched: number | null;
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      setBookings: (bookings) => set({ 
        bookings, 
        lastFetched: Date.now() 
      }),
      updateBooking: (id, updates) => set((state) => ({
        bookings: state.bookings.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      lastFetched: null,
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    { 
      name: "temanbunda-bookings-v3", // Version bump for schema change
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

interface AdminState {
  // Per-filter cache so switching filters reuses the prior result instead of
  // showing a skeleton. Stats live separately because they're filter-agnostic.
  bookingsMap: Record<string, any[]>;
  lastFetchedMap: Record<string, number | null>;
  stats: { totalRevenue: number, pendingCount: number, totalCount: number };
  setBookings: (filter: string, bookings: any[], stats?: any) => void;
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      bookingsMap: {},
      lastFetchedMap: {},
      stats: { totalRevenue: 0, pendingCount: 0, totalCount: 0 },
      setBookings: (filter, bookings, stats) =>
        set((state) => ({
          bookingsMap: { ...state.bookingsMap, [filter]: bookings },
          lastFetchedMap: { ...state.lastFetchedMap, [filter]: Date.now() },
          stats: stats ?? state.stats,
        })),
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    {
      name: "temanbunda-admin-cache-v2",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Call on every login and logout so persisted booking/admin caches don't bleed
// from one account to another on shared devices. Wipes both the in-memory
// Zustand state and the localStorage mirror; next navigation reads empty
// until the server or the next fetch repopulates it.
export function clearUserScopedCaches() {
  useBookingStore.setState({ bookings: [], lastFetched: null });
  useAdminStore.setState({
    bookingsMap: {},
    lastFetchedMap: {},
    stats: { totalRevenue: 0, pendingCount: 0, totalCount: 0 },
  });
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("temanbunda-bookings-v2");
      window.localStorage.removeItem("temanbunda-admin-cache-v2");
    } catch {
      /* Safari private mode etc. — in-memory clear is enough */
    }
  }
}
