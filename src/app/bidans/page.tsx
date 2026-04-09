"use client";
import { useEffect, useState, useCallback } from "react";
import { ChevronRight, Star, ShieldCheck, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore, useBidanStore } from "@/lib/store";
import BottomBar from "@/components/BottomBar";
import AuthGuard from "@/components/AuthGuard";
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
}

const SPEC_COLORS: Record<string, string> = {
  "Program Hamil": "chip-primary",
  "Kehamilan": "chip-warning",
  "Menyusui / ASI": "chip-pink",
};

export default function BidansPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { bidans, setBidans, lastFetched } = useBidanStore();
  const [loading, setLoading] = useState(!bidans.length);
  const [query, setQuery] = useState("");

  const fetchBidans = useCallback(async () => {
    try {
      // If we have data and it's fresh (< 5 mins), don't fetch blocking
      const isFresh = lastFetched && Date.now() - lastFetched < 300000;
      if (isFresh && bidans.length > 0) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/bidans", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.bidans) {
        setBidans(data.bidans);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token, bidans.length, lastFetched, setBidans]);

  useEffect(() => { 
    fetchBidans(); 
  }, [fetchBidans]);


  const filtered = bidans.filter(
    (b: Bidan) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.specializations.some((s: string) => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <PageShell>
      <div className="page-no-pad">
        {/* Nav */}
        <div className="nav-bar">
          <div className="nav-logo">Pilih Bidan</div>
        </div>

        {/* Hero */}
        <div className="hero" style={{ paddingBottom: 24 }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "0.85rem", color: "#3D444F", marginBottom: 6, fontWeight: 600 }}>
              Bidan Terpercaya
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8, color: "#000000" }}>
              Ahlinya ada di sini 🩺
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#3D444F", maxWidth: 340, fontWeight: 500 }}>
              Semua bidan kami diseleksi ketat — quality over quantity untuk kesehatan Anda.
            </p>
          </div>
        </div>

        <div className="page" style={{ paddingTop: 20 }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Search size={18} style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }} />
            <input
              type="search"
              className="form-input"
              placeholder="Cari bidan atau spesialisasi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: 180, borderRadius: "var(--radius-lg)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p style={{ color: "var(--text-secondary)" }}>Bidan tidak ditemukan</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map((bidan: Bidan, index: number) => (
                <div
                  key={bidan.id}
                  style={{ textDecoration: "none", cursor: 'pointer' }}
                  onClick={() => router.push(`/bidans/${bidan.id}`)}
                >
                  <div
                    className="card animate-fade-up"
                    style={{ animationDelay: `${index * 0.08}s`, padding: 20 }}
                  >
                    {/* Phase 1 badge for first/primary bidan */}
                    {index === 0 && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "rgba(163,191,202,0.2)",
                        border: "1px solid rgba(167,139,250,0.3)",
                        borderRadius: "var(--radius-full)", padding: "4px 12px",
                        fontSize: "0.7rem", fontWeight: 600, color: "var(--primary-light)",
                        marginBottom: 14
                      }}>
                        ⭐ Bidan Unggulan
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ position: "relative" }}>
                        <Avatar name={bidan.name} src={bidan.avatar} size={60} priority={index < 2} />
                        <div style={{

                          position: "absolute", bottom: -2, right: -2,
                          width: 18, height: 18, background: "var(--success)", borderRadius: "50%",
                          border: "2px solid var(--bg-card)",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          <ShieldCheck size={10} color="white" />
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{ 
                              fontSize: "0.95rem", 
                              fontWeight: 700, 
                              marginBottom: 2,
                              color: "var(--primary-dark)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {bidan.name}
                            </h3>
                            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                              {bidan.experience} pengalaman
                            </p>
                          </div>
                          <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "8px 0" }}>
                          <Star size={13} color="#FBBF24" fill="#FBBF24" />
                          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{bidan.rating.toFixed(1)}</span>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            ({bidan.totalReviews} ulasan)
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {bidan.specializations.map((s: string) => (
                            <span key={s} className={`chip ${SPEC_COLORS[s] || "chip-primary"}`}
                              style={{ fontSize: "0.65rem" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p style={{
                      fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6,
                      marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)"
                    }}>
                      {bidan.bio?.slice(0, 140)}...
                    </p>

                    <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                      <button 
                        className="btn btn-primary btn-sm" 
                        id={`book-bidan-${bidan.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            router.push("/login");
                          } else {
                            router.push(`/bidans/${bidan.id}/booking`);
                          }
                        }}
                      >
                        Book Konsultasi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Phase 2 teaser */}
          <div style={{
            marginTop: 24, padding: "16px 20px",
            background: "var(--bg-glass)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", textAlign: "center"
          }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              🌱 Segera hadir: lebih banyak bidan terkurasi
            </p>
          </div>
        </div>

        <BottomBar />
      </div>
    </PageShell>
  );
}

