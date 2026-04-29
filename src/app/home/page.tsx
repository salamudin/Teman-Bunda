"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Bell, ChevronRight, Calendar, Heart, Star,
  Baby, MessageCircle, ShieldCheck, Sparkles, Quote
} from "lucide-react";
import { useAuthStore, useUIStore, useBidanStore, useBookingStore } from "@/lib/store";
import { prefetchBookings } from "@/lib/bookingsPrefetch";
import BottomBar from "@/components/BottomBar";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import Avatar from "@/components/Avatar";
import PageShell from "@/components/PageShell";


interface Bidan {
  id: string;
  name: string;
  avatar: string | null;
  experience: string;
  bio: string;
  specializations: string[];
  rating: number;
  totalReviews: number;
  harga?: number;
  availabilities?: { id: string; date: string; startTime: string }[];
}

import { getWeekInfo } from "@/lib/janinData";

export default function HomePage() {
  const { user, token } = useAuthStore();
  const { bidans, setBidans, lastFetched: bidansLastFetched, hasHydrated: bidansHydrated } = useBidanStore();
  const { bookings, setBookings, lastFetched: bookingsLastFetched, hasHydrated: bookingsHydrated } = useBookingStore();
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();
  const [primaryBidan, setPrimaryBidan] = useState<Bidan | null>(bidans[0] || null);
  const [notifCount, setNotifCount] = useState(0);
  const [fetalAge, setFetalAge] = useState<number | null>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Loading state for background syncing
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Show skeleton ONLY if not hydrated OR hydrated but truly empty
  const loading = !bidansHydrated || (bidans.length === 0 && !bidansLastFetched);

  // Derive upcoming booking from store
  const upcoming = bookings.find(
    (b: any) => b.status === "CONFIRMED" || b.status === "PAID"
  );
  
  const upcomingBooking = upcoming ? {
    bidanName: upcoming.bidan.name,
    date: new Date(upcoming.availability.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }),
    time: upcoming.availability.startTime,
  } : null;

  useEffect(() => {
    if (user?.hpht) {
      const hphtDate = new Date(user.hpht);
      const today = new Date();
      const diffTime = today.getTime() - hphtDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setFetalAge(Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), 40));
    } else if (user?.gestationalAge) {
      setFetalAge(user.gestationalAge);
    }
  }, [user]);

  // Users typically land on /home before tapping Jadwal Saya. Kick off the
  // bookings fetch now so the list is already cached by the time they navigate.
  useEffect(() => {
    prefetchBookings("ALL");
  }, []);

  const fetalInfo = fetalAge !== null ? getWeekInfo(fetalAge) : null;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 11 ? "Selamat pagi" :
    greetingHour < 15 ? "Selamat siang" :
    greetingHour < 18 ? "Selamat sore" : "Selamat malam";


  // Set primary bidan from store if available
  useEffect(() => {
    if (bidans.length > 0 && !primaryBidan) {
      setPrimaryBidan(bidans[0]);
    }
  }, [bidans, primaryBidan]);

  const fetchData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const isFresh = bidansLastFetched && Date.now() - bidansLastFetched < 300000;

      // 1. Fetch bidans independently
      if (!isFresh || bidans.length === 0) {
        fetch("/api/bidans")
          .then(res => res.json())
          .then(data => {
            if (data.bidans?.length) {
              setBidans(data.bidans);
              // Immediately show from list data
              const first = data.bidans[0];
              if (!primaryBidan) setPrimaryBidan(first);
              
              // Then refresh details in background
              fetch(`/api/bidans/${first.id}`)
                .then(res => res.json())
                .then(detailData => {
                  if (detailData.bidan) setPrimaryBidan(detailData.bidan);
                }).catch(() => {});
            }
          }).catch(() => {});
      } else if (bidans.length > 0) {
        // List is fresh, just refresh detail for the first one for live availability
        fetch(`/api/bidans/${bidans[0].id}`)
          .then(res => res.json())
          .then(detailData => {
            if (detailData.bidan) setPrimaryBidan(detailData.bidan);
          }).catch(() => {});
      }

      // 2. Fetch Personal Data (Only if logged in)
      if (token) {
        fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
            const unread = (data.notifications || []).filter((n: { isRead: boolean }) => !n.isRead);
            setNotifCount(unread.length);
          }).catch(() => {});

        fetch("/api/bookings", { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
            if (data.bookings) setBookings(data.bookings);
          }).catch(() => {});
      }
    } catch {
      if (token) addToast("Gagal menyinkronkan data", "error");
    } finally {
      setIsSyncing(false);
    }


  }, [token, addToast, bidans, bidansLastFetched, setBidans, primaryBidan, setBookings]);

  useEffect(() => {
    fetch("/api/testimonials?limit=3", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.testimonials) setTestimonials(data.testimonials);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { 
    if (bidansHydrated && bookingsHydrated) {
      fetchData(); 
    }
  }, [token, bidansHydrated, bookingsHydrated]); // Only re-fetch if token changes or component hydrates


  return (
    <PageShell>
      <div className="page-no-pad">
        <ToastContainer />
        {/* Nav */}
        <div className="nav-bar">
          <div className="nav-logo" style={{ height: 35, width: 132, position: 'relative' }}>
            <Image 
              src="/logo-horizontal.png" 
              alt="ChatBidan" 
              fill 
              style={{ objectFit: 'contain', objectPosition: 'left' }}
            />
          </div>
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
            <p style={{ fontSize: "0.9rem", color: "#3D444F", marginBottom: 4 }}>{greeting}, {user ? user.name?.split(" ")[0] : "Bunda"} 👋</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: "#000000" }}>
              Layanan Chat Bidan & Konsultasi Bidan Online
            </h1>

            {/* ... (upcomingBooking logic stays same, it will show "Belum ada jadwal" if user is null) */}
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
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: "0.95rem", 
                      color: "#000000",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "180px"
                    }}>{upcomingBooking.bidanName}</div>
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
                  {user ? "Belum ada jadwal konsultasi" : "Dukungan bidan terpercaya ada di sini"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="page" style={{ paddingTop: 24 }}>
          {/* Primary Bidan Card */}
          {loading && !primaryBidan ? (
            <section style={{ marginBottom: 24 }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="skeleton" style={{ width: 140, height: 24, borderRadius: 4 }} />
              </div>
              <div className="skeleton" style={{ height: 240, borderRadius: "var(--radius-lg)" }} />
            </section>
          ) : primaryBidan ? (
            <section style={{ marginBottom: 24 }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 className="section-title">Bidan Rekomendasi</h2>
                <Link href="/bidans" style={{ fontSize: "0.8rem", color: "var(--primary-light)", fontWeight: 600 }}>
                  Lihat semua
                </Link>
              </div>
              <div 
                style={{ textDecoration: "none", cursor: 'pointer' }}
                onClick={() => router.push(`/bidans/${primaryBidan.id}`)}
              >
                <div style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", padding: 20,
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ position: "relative" }}>
                      <Avatar name={primaryBidan.name} src={primaryBidan.avatar} size={72} priority />

                      <div style={{
                        position: "absolute", bottom: -2, right: -2, width: 20, height: 20,
                        background: "var(--success)", borderRadius: "50%",
                        border: "2px solid var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <ShieldCheck size={11} color="white" />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4, minWidth: 0 }}>
                        <h3 style={{ 
                          fontSize: "1rem", 
                          fontWeight: 700, 
                          color: "#000000",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "180px"
                        }}>
                          {primaryBidan.name}
                        </h3>
                        <span className="chip chip-success" style={{ fontSize: "0.65rem", background: "rgba(16,185,129,0.1)", color: "#10B981", flexShrink: 0 }}>✓ Terverifikasi</span>
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
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Star size={16} color="#FBBF24" fill="#FBBF24" />
                        <span style={{ fontWeight: 700 }}>{primaryBidan.rating.toFixed(1)}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          ({primaryBidan.totalReviews} ulasan)
                        </span>
                      </div>
                      {/* Live schedule info */}
                      {primaryBidan.availabilities && primaryBidan.availabilities.length > 0 ? (
                        <div style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>
                          ✅ {primaryBidan.availabilities.length} slot tersedia
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          📅 Belum ada jadwal tersedia
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation();
                        if (!user) {
                          router.push("/login");
                        } else {
                          router.push(`/bidans/${primaryBidan.id}/booking`);
                        }
                      }}
                      className="btn btn-primary btn-sm"
                      id="home-book-btn"
                      disabled={!primaryBidan.availabilities || primaryBidan.availabilities.length === 0}
                    >
                      <Calendar size={14} /> Book Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}


          {/* Fetal tracker teaser */}
          {user && (
            <section style={{ marginBottom: 24 }}>
              <Link href="/janin" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#FBD5ED",
                  borderRadius: "var(--radius-lg)", padding: 20,
                  border: "none",
                  display: "flex", alignItems: "center", gap: 16,
                  boxShadow: "0 10px 25px rgba(237, 84, 181, 0.08)",
                  color: "#4A4A4A"
                }}>
                  <div style={{ fontSize: "3rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.05))" }}>
                    {fetalInfo?.emoji || "👶"}
                  </div>
                  <div style={{ flex: 1 }}>
                    {!user.hpht ? (
                      <>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ED54B5", marginBottom: 4 }}>
                          PANTAU JANIN BUNDA
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>
                          Klik di sini untuk mulai memantau perkembangan si Kecil.
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: "0.75rem", color: "#ED54B5", fontWeight: 700, marginBottom: 4 }}>
                          MINGGU {fetalAge} — {fetalInfo?.fruitAnalogy.toUpperCase()}
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#333", marginBottom: 2 }}>
                          {fetalInfo?.description.slice(0, 45)}...
                        </div>
                        {user.dueDate && (
                           <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: 500 }}>
                              H-{Math.ceil((new Date(user.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} hari menuju persalinan
                           </div>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{ 
                    width: 32, height: 32, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "50%", 
                    display: "flex", alignItems: "center", justifyContent: "center", border: "none"
                  }}>
                    <ChevronRight size={16} color="#ED54B5" />
                  </div>
                </div>
              </Link>
            </section>
          )}




          {/* Quick actions */}
          <section style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 14 }}>Layanan</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { href: "/bidans", icon: Heart, label: "Konsultasi Bidan", desc: "Chat & sesi konsultasi", color: "#C0E0EC", bg: "rgba(166,193,204,0.15)" },
                { href: "/janin", icon: Baby, label: "Perkembangan Janin", desc: "Visualisasi per minggu", color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
                { href: "/bookings", icon: Calendar, label: "Jadwal Saya", desc: "Lihat booking aktif", color: "#06B6D4", bg: "rgba(6,182,212,0.15)" },
                { href: "/bookings", icon: MessageCircle, label: "Riwayat Chat", desc: "Histori konsultasi", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.href + item.label} 
                    style={{ textDecoration: "none", cursor: 'pointer' }}
                    onClick={() => {
                      if (!user && item.href !== "/bidans" && item.href !== "/janin") {
                        // Only let them see bidans/janin tracker visually (will be gated inside if needed)
                        router.push("/login");
                      } else {
                        router.push(item.href);
                      }
                    }}
                  >
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
                  </div>
                );
              })}
            </div>
          </section>

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Testimoni Pengguna</h2>
              </div>
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none", margin: "0 -20px", padding: "0 20px" }}>
                              {testimonials.map((testi: any) => (
                  <div key={testi.id} style={{
                    minWidth: 260, maxWidth: 280,
                    background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(4px)",
                    borderRadius: "var(--radius-xl)", padding: 16,
                    border: "1px solid rgba(237, 84, 181, 0.15)",
                    boxShadow: "0 4px 12px rgba(237, 84, 181, 0.05)",
                    display: "flex", flexDirection: "column", gap: 12
                  }}>
                    <Quote size={20} color="#ED54B5" style={{ opacity: 0.3 }} />
                    {/* Star rating */}
                    {testi.rating > 0 && (
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1,2,3,4,5].map(s => (
                          <Star
                            key={s}
                            size={14}
                            color="#FBBF24"
                            fill={s <= testi.rating ? "#FBBF24" : "none"}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: "0.85rem", color: "#3D444F", fontStyle: "italic", flex: 1, lineHeight: 1.5 }}>
                      "{testi.text}"
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.8rem" }}>
                        {testi.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#000" }}>{testi.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{testi.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SEO Content Section - Branded Style */}
          <section style={{ marginBottom: 48, marginTop: 12 }}>
            <div style={{
              background: "linear-gradient(135deg, #FDF2F8 0%, #FFFFFF 100%)",
              borderRadius: "24px",
              padding: "24px",
              border: "1px solid rgba(236, 72, 153, 0.1)",
              boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.05)"
            }}>
              <h2 style={{ 
                fontSize: "1.25rem", 
                fontWeight: 850, 
                color: "#1F2937", 
                marginBottom: 16,
                letterSpacing: "-0.02em"
              }}>
                Kenapa Memilih <span style={{ color: "var(--primary)" }}>ChatBidan</span>?
              </h2>
              
              <p style={{ 
                fontSize: "0.875rem", 
                color: "#4B5563", 
                lineHeight: 1.7, 
                marginBottom: 24 
              }}>
                <strong>ChatBidan</strong> adalah solusi praktis untuk akses <strong>konsultasi bidan online</strong> secara instan. Kami hadir untuk memastikan kesehatan Bunda dan janin tetap terjaga melalui fitur <strong>tanya bidan</strong> profesional.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { 
                    title: "Chat Bidan Langsung", 
                    desc: "Jawaban cepat dan akurat dari bidan berlisensi resmi.",
                    icon: MessageCircle,
                    color: "#EC4899",
                    bg: "rgba(236, 72, 153, 0.1)"
                  },
                  { 
                    title: "Bidan Profesional", 
                    desc: "Konsultasimu akan didampingi langsung oleh bidan berpengalaman.",
                    icon: ShieldCheck,
                    color: "#06B6D4",
                    bg: "rgba(6, 182, 212, 0.1)"
                  },
                  { 
                    title: "Pantau Janin", 
                    desc: "Visualisasi perkembangan janin sesuai usia kehamilan Bunda.",
                    icon: Baby,
                    color: "#8B5CF6",
                    bg: "rgba(139, 92, 246, 0.1)"
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    display: "flex", 
                    gap: 16, 
                    alignItems: "center",
                    padding: "12px",
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.03)"
                  }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: "12px", 
                      background: item.bg, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <item.icon size={22} color={item.color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", marginBottom: 2 }}>{item.title}</h3>
                      <p style={{ fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.4 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ 
                fontSize: "0.75rem", 
                color: "#9CA3AF", 
                marginTop: 24, 
                textAlign: "center",
                lineHeight: 1.6,
                fontStyle: "italic"
              }}>
                Dukungan <strong>Chat Bidan</strong> terpercaya menemani perjalanan Bunda dari awal kehamilan hingga masa menyusui.
              </p>
            </div>
          </section>
        </div>

        <BottomBar />
      </div>
    </PageShell>
  );

}
