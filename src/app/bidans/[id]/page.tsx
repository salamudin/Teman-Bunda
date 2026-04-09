"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Star, ShieldCheck, Calendar, MessageCircle, Clock, Edit2 } from "lucide-react";
import { useAuthStore, useUIStore, useBidanStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import Avatar from "@/components/Avatar";
import ToastContainer from "@/components/ToastContainer";

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Bidan {
  id: string;
  name: string;
  avatar: string | null;
  experience: string;
  bio: string;
  specializations: string[];
  rating: number;
  totalReviews: number;
  harga: number;
  availabilities: Availability[];
}

export default function BidanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { bidans } = useBidanStore();
  const addToast = useUIStore((s) => s.addToast);
  
  // Try to find in cache first for instant load
  const cachedBidan = bidans.find(b => b.id === id);
  const [bidan, setBidan] = useState<Bidan | null>(cachedBidan || null);
  const [loading, setLoading] = useState(!cachedBidan);


  const isMe = user?.role === "BIDAN" && user?.id === id;

  async function updateProfile(dataObj: any) {
    try {
      const res = await fetch(`/api/bidans/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataObj)
      });
      if (res.ok) {
        addToast("Profil berhasil diperbarui", "success");
        fetch_();
      } else {
        addToast("Gagal memperbarui profil", "error");
      }
    } catch {
      addToast("Terjadi kesalahan", "error");
    }
  }

  function handleEditBio() {
    const newBio = window.prompt("Ubah biografi (Tentang):", bidan?.bio);
    if (newBio !== null && newBio !== bidan?.bio) {
      updateProfile({ bio: newBio });
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`/api/bidans/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.bidan) {
        setBidan(data.bidan);
      }
    } catch {
      if (!bidan) addToast("Gagal memuat profil bidan", "error");
    } finally {
      setLoading(false);
    }
  }, [id, token, addToast, bidan]);

  useEffect(() => { fetch_(); }, [fetch_]);

  // Group by date
  const groupedSlots: Record<string, Availability[]> = {};
  bidan?.availabilities?.forEach((a) => {
    const dateKey = new Date(a.date).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long",
    });
    if (!groupedSlots[dateKey]) groupedSlots[dateKey] = [];
    groupedSlots[dateKey].push(a);
  });
  const firstThreeDays = Object.entries(groupedSlots).slice(0, 3);

  return (
    <AuthGuard>
      <ToastContainer />
      <div style={{ minHeight: "100vh" }}>
        {/* Nav */}
        <div className="nav-bar">
          <button onClick={() => router.back()} className="nav-icon-btn">
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontWeight: 700 }}>Profil Bidan</span>
          <div style={{ width: 40 }} />
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
          </div>
        ) : !bidan ? (
          <div className="empty-state">
            <div className="empty-icon">😔</div>
            <p>Bidan tidak ditemukan</p>
          </div>
        ) : (
          <>
            {/* Profile hero */}
            <div className="hero" style={{ paddingBottom: 32 }}>
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <Avatar name={bidan.name} src={bidan.avatar} size={96} priority />

                  <div style={{
                    position: "absolute", bottom: 2, right: 2,
                    background: "var(--success)", borderRadius: "50%",
                    width: 26, height: 26, border: "2px solid var(--bg)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <ShieldCheck size={14} color="white" />
                  </div>
                  {isMe && (
                    <label style={{
                      position: "absolute", bottom: 2, left: 2,
                      background: "var(--primary)", borderRadius: "50%",
                      width: 28, height: 28, border: "2px solid var(--bg)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", zIndex: 10
                    }}>
                      <Edit2 size={14} color="white" />
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                    </label>
                  )}
                </div>
                <div style={{ textAlign: "center", maxWidth: "280px" }}>
                  <h1 style={{ 
                    fontSize: "1.3rem", 
                    fontWeight: 800, 
                    marginBottom: 4, 
                    color: "#000000",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {bidan.name}
                  </h1>
                  <p style={{ color: "#3D444F", fontSize: "0.875rem", fontWeight: 600 }}>
                    {bidan.experience} pengalaman
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                  {bidan.specializations.map((s) => (
                    <span key={s} className="chip chip-primary" style={{ fontSize: "0.7rem" }}>{s}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Star size={16} color="#FBBF24" fill="#FBBF24" />
                  <span style={{ fontWeight: 800, fontSize: "1rem", color: "#000000" }}>{bidan.rating.toFixed(1)}</span>
                  <span style={{ color: "#3D444F", fontSize: "0.85rem", fontWeight: 600 }}>
                    dari {bidan.totalReviews} ulasan
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: "20px 20px 120px" }}>
              {/* Bio */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <MessageCircle size={18} color="var(--primary-light)" />
                    <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Tentang</h2>
                  </div>
                  {isMe && (
                    <button onClick={handleEditBio} className="btn btn-sm" style={{ padding: "4px 8px", background: "rgba(255,255,255,0.1)" }}>
                      <Edit2 size={12} style={{ marginRight: 4 }} /> Edit
                    </button>
                  )}
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {bidan.bio}
                </p>
              </div>

              {/* Jadwal preview */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Clock size={18} color="var(--primary-light)" />
                    <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Jadwal Tersedia</h2>
                  </div>
                  {isMe && (
                    <button 
                      onClick={() => router.push("/profile/availability")} 
                      className="btn btn-sm" 
                      style={{ padding: "4px 8px", background: "rgba(16,185,129,0.1)", color: "#10B981" }}
                    >
                      Kelola Jadwal
                    </button>
                  )}
                </div>
                {firstThreeDays.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Tidak ada slot tersedia saat ini.</p>
                ) : (
                  firstThreeDays.map(([date, slots]) => (
                    <div key={date} style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>{date}</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {slots.slice(0, 4).map((s) => (
                          <span key={s.id} style={{
                            padding: "6px 12px", background: "var(--bg-elevated)",
                            border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                            fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)"
                          }}>
                            {s.startTime}
                          </span>
                        ))}
                        {slots.length > 4 && (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "6px 0" }}>
                            +{slots.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Rating", value: bidan.rating.toFixed(1), emoji: "⭐" },
                  { label: "Ulasan", value: bidan.totalReviews, emoji: "💬" },
                  { label: "Pengalaman", value: bidan.experience, emoji: "🏆" },
                ].map((item) => (
                  <div key={item.label} className="glass-card" style={{ textAlign: "center", padding: 14 }}>
                    <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>{item.emoji}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700 }}>{item.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky CTA */}
            <div style={{
              position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: "var(--max-width)",
              padding: "16px 20px calc(16px + env(safe-area-inset-bottom))",
              background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(16px)",
              borderTop: "1px solid var(--border)", zIndex: 50
            }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Harga konsultasi</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                    Rp {bidan.harga?.toLocaleString("id-ID") || "150.000"} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>/sesi</span>
                  </div>
                </div>
                {isMe ? (
                  <button
                    className="btn btn-primary"
                    id={`book-detail-${bidan.id}`}
                    onClick={() => router.push(`/bookings`)}
                    style={{ flex: 1 }}
                  >
                    <Calendar size={16} /> Lihat Jadwal Saya
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    id={`book-detail-${bidan.id}`}
                    onClick={() => router.push(`/bidans/${bidan.id}/booking`)}
                    style={{ flex: 1 }}
                  >
                    <Calendar size={16} /> Book Sekarang
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
