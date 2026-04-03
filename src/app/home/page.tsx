"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, ChevronRight, Calendar, Heart, Star,
  Baby, MessageCircle, ShieldCheck, Sparkles,
} from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import BottomBar from "@/components/BottomBar";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import Avatar from "@/components/Avatar";

interface Bidan {
  id: string;
  name: string;
  avatar: string | null;
  experience: string;
  bio: string;
  specializations: string[];
  rating: number;
  totalReviews: number;
}

const FETAL_MILESTONES: Record<number, { emoji: string; size: string; milestone: string }> = {
  4:  { emoji: "🫘", size: "ukuran biji poppy",   milestone: "Jantung mulai berdetak" },
  8:  { emoji: "🫐", size: "ukuran blueberry",    milestone: "Tangan & kaki mulai terbentuk" },
  12: { emoji: "🍋", size: "ukuran plum",          milestone: "Semua organ vital terbentuk" },
  16: { emoji: "🍐", size: "ukuran alpukat",       milestone: "Bisa mendengar suara ibu" },
  20: { emoji: "🍌", size: "ukuran pisang",        milestone: "Bisa merasakan gerakan bayi" },
  24: { emoji: "🌽", size: "ukuran jagung",        milestone: "Paru-paru berkembang pesat" },
  28: { emoji: "🥬", size: "ukuran kol",           milestone: "Mata mulai bisa membuka" },
  32: { emoji: "🥥", size: "ukuran kelapa",        milestone: "Bisa bermimpi!" },
  36: { emoji: "🍈", size: "ukuran melon",         milestone: "Siap dilahirkan" },
  40: { emoji: "🎃", size: "ukuran labu kecil",    milestone: "Waktu yang ditunggu!" },
};

function getFetalInfo(week: number) {
  const keys = Object.keys(FETAL_MILESTONES)
    .map(Number)
    .sort((a, b) => a - b);
  let matched = keys[0];
  for (const k of keys) {
    if (week >= k) matched = k;
  }
  return FETAL_MILESTONES[matched];
}

export default function HomePage() {
  const { user, token } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();
  const [primaryBidan, setPrimaryBidan] = useState<Bidan | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [upcomingBooking, setUpcomingBooking] = useState<{ bidanName: string; date: string; time: string } | null>(null);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 11 ? "Selamat pagi" :
    greetingHour < 15 ? "Selamat siang" :
    greetingHour < 18 ? "Selamat sore" : "Selamat malam";

  const fetalInfo = user?.gestationalAge ? getFetalInfo(user.gestationalAge) : null;

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [bidanRes, notifRes, bookRes] = await Promise.all([
        fetch("/api/bidans"),
        fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const bidanData = await bidanRes.json();
      if (bidanData.bidans?.length) setPrimaryBidan(bidanData.bidans[0]);

      const notifData = await notifRes.json();
      const unread = (notifData.notifications || []).filter((n: { isRead: boolean }) => !n.isRead);
      setNotifCount(unread.length);

      const bookData = await bookRes.json();
      const upcoming = (bookData.bookings || []).find(
        (b: { status: string }) => b.status === "CONFIRMED" || b.status === "PAID"
      );
      if (upcoming) {
        setUpcomingBooking({
          bidanName: upcoming.bidan.name,
          date: new Date(upcoming.availability.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }),
          time: upcoming.availability.startTime,
        });
      }
    } catch {
      addToast("Gagal memuat data", "error");
    }
  }, [token, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <AuthGuard>
      <ToastContainer />
      <div className="page-no-pad">
        {/* Nav */}
        <div className="nav-bar">
          <div className="nav-logo">TemanBunda</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/notifications" className="nav-icon-btn" aria-label="Notifikasi" style={{ position: "relative" }}>
              <Bell size={20} />
              {notifCount > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6, width: 8, height: 8,
                  background: "var(--secondary)", borderRadius: "50%"
                }} />
              )}
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="hero" style={{ paddingBottom: 28 }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "0.9rem", color: "#3D444F", marginBottom: 4 }}>{greeting},</p>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2, marginBottom: 16, color: "#000000" }}>
              {user?.name?.split(" ")[0]} 👋
            </h1>

            {/* Upcoming booking card */}
            {upcomingBooking ? (
              <Link href="/bookings" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,0,0,0.05)", borderRadius: "var(--radius-lg)",
                  padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{
                    width: 42, height: 42, background: "var(--primary)",
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <Calendar size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.75rem", color: "#3D444F", fontWeight: 600 }}>Jadwal Konsultasi</div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#000000" }}>{upcomingBooking.bidanName}</div>
                    <div style={{ fontSize: "0.8rem", color: "#3D444F" }}>
                      {upcomingBooking.date} • {upcomingBooking.time}
                    </div>
                  </div>
                  <ChevronRight size={18} color="#3D444F" />
                </div>
              </Link>
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.8)",
                borderRadius: "var(--radius-lg)", padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 10
              }}>
                <Sparkles size={18} color="var(--primary-dark)" />
                <span style={{ fontSize: "0.875rem", color: "#3D444F", fontWeight: 500 }}>
                  Belum ada jadwal konsultasi
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="page" style={{ paddingTop: 24 }}>

          {/* Status pill */}
          {user?.status && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)", padding: "8px 16px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%",
                  background: user.status === "HAMIL" ? "#34D399" : user.status === "MENYUSUI" ? "#F9A8D4" : "#A78BFA" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {user.status === "PROGRAM_HAMIL" ? "Program Hamil" :
                   user.status === "HAMIL" ? `Kehamilan ${user.gestationalAge || "?"} Minggu` : "Menyusui"}
                </span>
              </div>
            </div>
          )}

          {/* Primary Bidan Card – Phase 1 Hero */}
          {primaryBidan && (
            <section style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 className="section-title">Bidan Anda</h2>
                <Link href="/bidans" style={{ fontSize: "0.8rem", color: "var(--primary-light)", fontWeight: 600 }}>
                  Lihat semua
                </Link>
              </div>
              <Link href={`/bidans/${primaryBidan.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", padding: 20,
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ position: "relative" }}>
                      <Avatar name={primaryBidan.name} src={primaryBidan.avatar} size={72} />
                      <div style={{
                        position: "absolute", bottom: -2, right: -2, width: 20, height: 20,
                        background: "var(--success)", borderRadius: "50%",
                        border: "2px solid var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <ShieldCheck size={11} color="white" />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#000000" }}>{primaryBidan.name}</h3>
                        <span className="chip chip-success" style={{ fontSize: "0.65rem", background: "rgba(16,185,129,0.1)", color: "#10B981" }}>✓ Terverifikasi</span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#3D444F", fontWeight: 500, marginBottom: 8 }}>
                        {primaryBidan.experience} pengalaman
                      </p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {primaryBidan.specializations.map((s: string) => (
                          <span key={s} className="chip chip-primary" style={{ fontSize: "0.65rem" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {primaryBidan.bio?.slice(0, 120)}...
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Star size={16} color="#FBBF24" fill="#FBBF24" />
                      <span style={{ fontWeight: 700 }}>{primaryBidan.rating.toFixed(1)}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        ({primaryBidan.totalReviews} ulasan)
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); router.push(`/bidans/${primaryBidan.id}/booking`); }}
                      className="btn btn-primary btn-sm"
                      id="home-book-btn"
                    >
                      <Calendar size={14} /> Book Sekarang
                    </button>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Fetal tracker teaser – if pregnant */}
          {user?.status === "HAMIL" && fetalInfo && (
            <section style={{ marginBottom: 24 }}>
              <Link href="/janin" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--bg-glass)",
                  borderRadius: "var(--radius-lg)", padding: 20,
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 16
                }}>
                  <div style={{ fontSize: "3.5rem", animation: "float 3s ease-in-out infinite" }}>
                    {fetalInfo.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--primary-light)", fontWeight: 600, marginBottom: 4 }}>
                      MINGGU {user.gestationalAge} – PERKEMBANGAN JANIN
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>
                      {fetalInfo.size}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {fetalInfo.milestone}
                    </div>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              </Link>
            </section>
          )}

          {/* Quick actions */}
          <section style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 14 }}>Layanan</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { href: "/bidans", icon: Heart, label: "Konsultasi Bidan", desc: "Chat & sesi konsultasi", color: "#A6C1CC", bg: "rgba(166,193,204,0.15)" },
                { href: "/janin", icon: Baby, label: "Perkembangan Janin", desc: "Visualisasi per minggu", color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
                { href: "/bookings", icon: Calendar, label: "Jadwal Saya", desc: "Lihat booking aktif", color: "#06B6D4", bg: "rgba(6,182,212,0.15)" },
                { href: "/bookings", icon: MessageCircle, label: "Riwayat Chat", desc: "Histori konsultasi", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href + item.label} href={item.href} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ padding: 16, height: "100%" }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "var(--radius-md)",
                        background: item.bg, display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 12
                      }}>
                        <Icon size={22} color={item.color} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Trust indicators */}
          <section style={{ marginBottom: 8 }}>
            <div className="glass-card">
              <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { num: "312+", label: "Klien Puas" },
                  { num: "5.0", label: "Rating" },
                  { num: "10 Th", label: "Pengalaman" },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, background: "var(--gradient-primary)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{item.num}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <BottomBar />
      </div>
    </AuthGuard>
  );
}
