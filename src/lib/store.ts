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
}

export const useBidanStore = create<BidanState>()(
  persist(
    (set) => ({
      bidans: [],
      setBidans: (bidans) => set({ bidans, lastFetched: Date.now() }),
      lastFetched: null,
    }),
    { name: "temanbunda-bidans" }
  )
);

interface BookingState {
  bookings: any[];
  setBookings: (bookings: any[]) => void;
  lastFetched: number | null;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      setBookings: (bookings) => set({ bookings, lastFetched: Date.now() }),
      lastFetched: null,
    }),
    { name: "temanbunda-bookings" }
  )
);

