"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, XCircle, ChevronLeft, Users, Calendar, DollarSign } from "lucide-react";
import { useAuthStore, useUIStore, useAdminStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import Avatar from "@/components/Avatar";
import PageShell from "@/components/PageShell";

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
  const {
    bookingsMap, lastFetchedMap, stats: serverStats, setBookings, hasHydrated,
  } = useAdminStore();

  const [filter, setFilter] = useState("PAID");
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const bookings = bookingsMap[filter] || [];
  const lastFetched = lastFetchedMap[filter];

  // Only show the skeleton when we have NO cached data anywhere. Switching
  // filters keeps the prior list visible until the new one arrives.
  const anyCached = Object.values(bookingsMap).some((arr) => arr && arr.length > 0);
  const initialLoading = !hasHydrated || (!anyCached && !lastFetched);
  const isStale = bookings.length === 0 && !lastFetched && anyCached;

  // Cancel in-flight requests on filter change so a slow "ALL" can't clobber
  // a fast "PAID" result that arrives later.
  const abortRef = useRef<AbortController | null>(null);
  // Stats are filter-agnostic; only request them once per session, then rely on
  // the server's TTL cache. This drops the heavy groupBy from every filter click.
  const statsLoadedRef = useRef(false);

  const fetchBookings = useCallback(async (isLoadMore = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      if (isLoadMore) setLoadingMore(true);

      const wantStats = !statsLoadedRef.current;
      const res = await fetch(
        `/api/admin/bookings?status=${filter}&page=${currentPage}&limit=20${wantStats ? "" : "&stats=0"}`,
        { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
      );
      if (!res.ok) { if (!isLoadMore) router.push("/home"); return; }
      const data = await res.json();
      if (data.stats) statsLoadedRef.current = true;

      if (isLoadMore) {
        setBookings(filter, [...bookings, ...(data.bookings || [])], data.stats);
        setPage(currentPage);
      } else {
        setBookings(filter, data.bookings || [], data.stats);
        setPage(1);
      }

      if (data.pagination) {
        setHasMore(
          typeof data.pagination.hasMore === "boolean"
            ? data.pagination.hasMore
            : data.pagination.page < data.pagination.totalPages
        );
      }
    } catch { /* aborted or network error; ignore */ }
    finally {
      setLoadingMore(false);
    }
  }, [token, router, filter, page, bookings, setBookings]);

  useEffect(() => {
    if (hasHydrated && user?.role === "ADMIN") {
      fetchBookings();
    }
    return () => abortRef.current?.abort();
  }, [user, fetchBookings, hasHydrated]);

  const filtered = bookings;

  const totalRevenue = serverStats.totalRevenue;
  const pendingCount = serverStats.pendingCount;

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

  // async function updateStatus handled above
  // const totalRevenue = ... (replaced by serverStats)
  // const pendingCount = ... (replaced by serverStats)

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
      <PageShell>
        <ToastContainer />
        <div style={{ minHeight: "100vh" }}>
        <div className="nav-bar">
          <button onClick={() => router.back()} className="nav-icon-btn"><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 700 }}>Panel Admin</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button 
              className="btn btn-sm" 
              style={{ background: "#FDF4F7", color: "#ED54B5", border: "1px solid #FBD5ED", fontWeight: 700 }}
              onClick={() => router.push("/admin/testimonials")}
            >
              Cek Testimoni
            </button>
            <span className="chip chip-primary" style={{ fontSize: "0.65rem" }}>Admin</span>
          </div>
        </div>

        <div style={{ padding: "16px 20px 48px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { icon: Calendar, label: "Total Booking", value: serverStats.totalCount, color: "#C0E0EC" },
              { icon: Clock, label: "Perlu Konfirmasi", value: serverStats.pendingCount, color: "#FBBF24" },
              { icon: DollarSign, label: "Revenue", value: `Rp ${(serverStats.totalRevenue / 1000).toFixed(0)}K`, color: "#10B981" },
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

          {initialLoading || isStale ? (
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
                    {/* ... item content ... */}
                    {/* (I'll keep the existing content here) */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0, flex: 1 }}>
                        <Avatar name={booking.user.name} size={36} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{booking.user.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{booking.user.email}</div>
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

                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.7 }}>
                      <div>👩‍⚕️ {booking.bidan.name}</div>
                      <div>📅 {new Date(booking.availability.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</div>
                      <div>⏰ {booking.availability.startTime} – {booking.availability.endTime} WIB</div>
                      {booking.user.phone && <div>📱 {booking.user.phone}</div>}
                    </div>

                    {booking.paymentProof && (
                      <div style={{ marginBottom: 12, padding: 8, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>Bukti Transfer:</div>
                        <img src={booking.paymentProof} alt="Bukti Transfer" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 4, objectFit: "contain" }} />
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 700, color: "#34D399" }}>{formatCurrency(booking.amount)}</span>
                      {flow && (
                        <button className="btn btn-primary btn-sm" id={`admin-update-${booking.id}`} disabled={updating === booking.id} onClick={() => updateStatus(booking.id, flow.next)}>
                          {updating === booking.id ? "⏳" : flow.label}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <button 
                  className="btn btn-sm" 
                  style={{ width: "100%", marginTop: 12, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  onClick={() => fetchBookings(true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "⏳ Memuat..." : "Tampilkan Lebih Banyak"}
                </button>
              )}
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
      </PageShell>
    </AuthGuard>
  );
}
