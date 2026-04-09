"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, XCircle, ChevronLeft, Users, Calendar, DollarSign } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import Avatar from "@/components/Avatar";

interface Booking {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null };
  bidan: { id: string; name: string };
  availability: { date: string; startTime: string; endTime: string };
  paymentProof: string | null;
}

const STATUS_FLOW: Record<string, { next: string; label: string; color: string }> = {
  WAITING_PAYMENT: { next: "PAID", label: "Tandai Sudah Bayar", color: "#FBBF24" },
  PAID:            { next: "CONFIRMED", label: "Konfirmasi & Aktifkan", color: "#34D399" },
  CONFIRMED:       { next: "COMPLETED", label: "Tandai Selesai", color: "#93C5FD" },
};

export default function AdminPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PAID");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.push("/home"); return; }
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token, router]);

  useEffect(() => {
    if (user?.role !== "ADMIN") { router.push("/home"); return; }
    fetchBookings();
  }, [user, fetchBookings, router]);

  const filtered = filter === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  async function updateStatus(bookingId: string, newStatus: string) {
    setUpdating(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        addToast("Status berhasil diperbarui ✅", "success");
        fetchBookings();
      }
    } catch {
      addToast("Gagal memperbarui status", "error");
    } finally {
      setUpdating(null);
    }
  }

  const totalRevenue = bookings.filter((b) => ["CONFIRMED","COMPLETED"].includes(b.status)).reduce((s, b) => s + b.amount, 0);
  const pendingCount = bookings.filter((b) => b.status === "PAID").length;

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  }

  const FILTERS = ["WAITING_PAYMENT", "PAID", "CONFIRMED", "COMPLETED", "ALL"];
  const FILTER_LABELS: Record<string, string> = {
    WAITING_PAYMENT: "Belum Bayar",
    PAID: "Menunggu Konfirmasi",
    CONFIRMED: "Dikonfirmasi",
    COMPLETED: "Selesai",
    ALL: "Semua",
  };

  return (
    <AuthGuard>
      <ToastContainer />
      <div style={{ minHeight: "100vh" }}>
        <div className="nav-bar">
          <button onClick={() => router.back()} className="nav-icon-btn"><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 700 }}>Panel Admin</span>
          <span className="chip chip-primary" style={{ fontSize: "0.65rem" }}>Admin</span>
        </div>

        <div style={{ padding: "16px 20px 48px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { icon: Calendar, label: "Total Booking", value: bookings.length, color: "#C0E0EC" },
              { icon: Clock, label: "Perlu Konfirmasi", value: pendingCount, color: "#FBBF24" },
              { icon: DollarSign, label: "Revenue", value: `Rp ${(totalRevenue / 1000).toFixed(0)}K`, color: "#10B981" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="card" style={{ padding: 14, textAlign: "center" }}>
                  <Icon size={20} color={item.color} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 2 }}>{item.value}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{item.label}</div>
                </div>
              );
            })}
          </div>

          {/* Filter */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, scrollbarWidth: "none" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="btn btn-sm"
                id={`admin-filter-${f.toLowerCase()}`}
                style={{
                  flexShrink: 0,
                  background: filter === f ? "var(--gradient-primary)" : "var(--bg-elevated)",
                  color: filter === f ? "white" : "var(--text-secondary)",
                  border: filter === f ? "none" : "1px solid var(--border)",
                }}
              >
                {FILTER_LABELS[f]}
                {f === "PAID" && pendingCount > 0 && (
                  <span style={{
                    background: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-full)",
                    padding: "1px 6px", fontSize: "0.65rem", fontWeight: 700
                  }}>{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius-lg)" }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p style={{ color: "var(--text-secondary)" }}>Tidak ada booking dengan status ini</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((booking) => {
                const flow = STATUS_FLOW[booking.status];
                return (
                  <div key={booking.id} className="card" style={{ padding: 16 }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0, flex: 1 }}>
                        <Avatar name={booking.user.name} size={36} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ 
                            fontWeight: 700, 
                            fontSize: "0.875rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {booking.user.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {booking.user.email}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        padding: "4px 10px", borderRadius: "var(--radius-full)",
                        fontSize: "0.65rem", fontWeight: 700,
                        background: booking.status === "PAID" ? "rgba(245,158,11,0.15)" : "rgba(166,193,204,0.15)",
                        color: booking.status === "PAID" ? "#FBBF24" : "var(--primary-dark)",
                        border: `1px solid ${booking.status === "PAID" ? "rgba(245,158,11,0.3)" : "rgba(166,193,204,0.3)"}`,
                        display: "flex", alignItems: "center"
                      }}>
                        {booking.status === "PAID" ? <Clock size={10} style={{ marginRight: 4 }} /> :
                         booking.status === "CONFIRMED" ? <CheckCircle size={10} style={{ marginRight: 4 }} /> :
                         <XCircle size={10} style={{ marginRight: 4 }} />}
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.7 }}>
                      <div>👩‍⚕️ {booking.bidan.name}</div>
                      <div>📅 {new Date(booking.availability.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</div>
                      <div>⏰ {booking.availability.startTime} – {booking.availability.endTime} WIB</div>
                      {booking.user.phone && <div>📱 {booking.user.phone}</div>}
                    </div>

                    {booking.paymentProof && (
                      <div style={{ marginBottom: 12, padding: 8, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>Bukti Transfer:</div>
                        <img 
                          src={booking.paymentProof} 
                          alt="Bukti Transfer" 
                          style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 4, objectFit: "contain" }} 
                        />
                      </div>
                    )}

                    {/* Amount + Action */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 700, color: "#34D399" }}>{formatCurrency(booking.amount)}</span>
                      {flow && (
                        <button
                          className="btn btn-primary btn-sm"
                          id={`admin-update-${booking.id}`}
                          disabled={updating === booking.id}
                          onClick={() => updateStatus(booking.id, flow.next)}
                        >
                          {updating === booking.id ? "⏳" : flow.label}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick stats footer */}
          <div className="glass-card" style={{ marginTop: 24, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Users size={16} color="var(--primary-light)" />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Total pendapatan dikonfirmasi: <strong style={{ color: "var(--success)" }}>{formatCurrency(totalRevenue)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
