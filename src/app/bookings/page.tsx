"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MessageCircle, ChevronRight, CreditCard } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import BottomBar from "@/components/BottomBar";
import AuthGuard from "@/components/AuthGuard";
import Avatar from "@/components/Avatar";

interface Booking {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  bidan: { id: string; name: string; avatar: string | null; specializations: string[] };
  user: { id: string; name: string; avatar: string | null };
  availability: { date: string; startTime: string; endTime: string };
}

const STATUS_LABEL: Record<string, { label: string; class: string; emoji: string }> = {
  WAITING_PAYMENT: { label: "Menunggu Bayar", class: "chip-warning", emoji: "⏳" },
  PAID:            { label: "Menunggu Konfirmasi", class: "chip-primary", emoji: "🔍" },
  CONFIRMED:       { label: "Terkonfirmasi", class: "chip-success", emoji: "✅" },
  COMPLETED:       { label: "Selesai", class: "chip-primary", emoji: "🏁" },
  CANCELLED:       { label: "Dibatalkan", class: "chip-danger", emoji: "❌" },
};

export default function BookingsPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DONE">("ACTIVE");

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filtered = bookings.filter((b) => {
    if (filter === "ACTIVE") return ["WAITING_PAYMENT", "PAID", "CONFIRMED"].includes(b.status);
    if (filter === "DONE") return ["COMPLETED", "CANCELLED"].includes(b.status);
    return true;
  });

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  }

  return (
    <AuthGuard>
      <div className="page-no-pad">
        <div className="nav-bar">
          <div className="nav-logo">Jadwal Saya</div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex", gap: 8, padding: "16px 20px 0",
          overflowX: "auto", scrollbarWidth: "none"
        }}>
          {(["ACTIVE", "ALL", "DONE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn btn-sm"
              id={`filter-${f.toLowerCase()}`}
              style={{
                background: filter === f ? "var(--gradient-primary)" : "var(--bg-elevated)",
                color: filter === f ? "white" : "var(--text-secondary)",
                border: filter === f ? "none" : "1px solid var(--border)",
                flexShrink: 0
              }}
            >
              {f === "ACTIVE" ? "Aktif" : f === "ALL" ? "Semua" : "Riwayat"}
            </button>
          ))}
        </div>

        <div className="page" style={{ paddingTop: 16 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius-lg)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3 style={{ fontWeight: 700 }}>Belum ada booking</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textAlign: "center" }}>
                Mulai konsultasi dengan bidan profesional kami
              </p>
              <button className="btn btn-primary" onClick={() => router.push("/bidans")} id="go-book-btn">
                Book Konsultasi
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map((booking) => {
                const statusInfo = STATUS_LABEL[booking.status] || STATUS_LABEL.WAITING_PAYMENT;
                const bookingDate = new Date(booking.availability.date);
                const isBidan = user?.role === "BIDAN";
                const displayName = isBidan ? booking.user.name : booking.bidan.name;
                const displayAvatar = isBidan ? booking.user.avatar : booking.bidan.avatar;

                return (
                  <div
                    key={booking.id}
                    className="card animate-fade-up"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (booking.status === "WAITING_PAYMENT" || booking.status === "PAID") {
                        router.push(`/payment/${booking.id}`);
                      } else if (booking.status === "CONFIRMED") {
                        router.push(`/chat/${booking.id}`);
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <Avatar name={displayName} src={displayAvatar} size={40} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{displayName}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {new Date(booking.createdAt).toLocaleDateString("id-ID")}
                          </div>
                        </div>
                      </div>
                      <span className={`chip ${statusInfo.class}`} style={{ fontSize: "0.7rem" }}>
                        {statusInfo.emoji} {statusInfo.label}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                          {bookingDate.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} color="var(--text-muted)" />
                        <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                          {booking.availability.startTime} WIB
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      paddingTop: 12, borderTop: "1px solid var(--border)"
                    }}>
                      <span style={{ fontWeight: 700, color: "var(--primary-light)" }}>
                        {formatCurrency(booking.amount)}
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        {booking.status === "WAITING_PAYMENT" && (
                          <button
                            className="btn btn-primary btn-sm"
                            id={`pay-btn-${booking.id}`}
                            onClick={(e) => { e.stopPropagation(); router.push(`/payment/${booking.id}`); }}
                          >
                            <CreditCard size={14} /> Bayar
                          </button>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <button
                            className="btn btn-primary btn-sm"
                            id={`chat-btn-${booking.id}`}
                            onClick={(e) => { e.stopPropagation(); router.push(`/chat/${booking.id}`); }}
                          >
                            <MessageCircle size={14} /> Chat
                          </button>
                        )}
                        {(booking.status === "PAID" || booking.status === "COMPLETED") && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            Detail <ChevronRight size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <BottomBar />
      </div>
    </AuthGuard>
  );
}
