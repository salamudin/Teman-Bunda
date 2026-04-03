"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bell, BellOff } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  bookingId: string | null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: "100vh" }}>
        <div className="nav-bar">
          <button onClick={() => router.back()} className="nav-icon-btn"><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 700 }}>Notifikasi</span>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ padding: "20px 20px 40px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><BellOff size={36} color="var(--text-muted)" /></div>
              <p style={{ color: "var(--text-secondary)" }}>Belum ada notifikasi</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="notif-item"
                onClick={() => n.bookingId && router.push(`/payment/${n.bookingId}`)}
                style={{ cursor: n.bookingId ? "pointer" : "default" }}
              >
                <div className={`notif-dot${n.isRead ? " read" : ""}`} />
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(166,193,204,0.15)", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0
                }}>
                  <Bell size={18} color="var(--primary-dark)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{n.body}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
