"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle, XCircle, EyeOff, MessageSquare, Star } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import PageShell from "@/components/PageShell";

interface Testimonial {
  id: string;
  name: string;
  text: string;
  category: string;
  rating: number;
  status: string;
  isAnonymous: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.push("/home"); return; }
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token, router]);

  useEffect(() => {
    if (user?.role !== "ADMIN") { router.push("/home"); return; }
    fetchTestimonials();
  }, [user, fetchTestimonials, router]);

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        addToast(`Testimonial diperbarui menjadi ${newStatus}`, "success");
        fetchTestimonials();
      } else {
        addToast("Gagal memperbarui", "error");
      }
    } catch {
      addToast("Terjadi kesalahan", "error");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AuthGuard>
      <PageShell>
        <ToastContainer />
        <div style={{ minHeight: "100vh" }}>
          <div className="nav-bar">
            <button onClick={() => router.back()} className="nav-icon-btn"><ChevronLeft size={20} /></button>
            <span style={{ fontWeight: 700 }}>Kelola Testimoni</span>
            <span className="chip chip-primary" style={{ fontSize: "0.65rem" }}>Admin</span>
          </div>

          <div style={{ padding: "16px 20px 48px" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)" }} />)}
              </div>
            ) : testimonials.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p style={{ color: "var(--text-secondary)" }}>Belum ada testimoni.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {testimonials.map((testi) => (
                  <div key={testi.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-primary)",
                          display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                        }}>
                          <MessageSquare size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{testi.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {new Date(testi.createdAt).toLocaleDateString("id-ID")} • {testi.category}
                          </div>
                          <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12} color="#FBBF24" fill={s <= (testi.rating || 5) ? "#FBBF24" : "none"} strokeWidth={1.5} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        padding: "4px 10px", borderRadius: "var(--radius-full)",
                        fontSize: "0.65rem", fontWeight: 700,
                        background: testi.status === "PENDING" ? "rgba(245,158,11,0.15)" :
                                   testi.status === "ACCEPTED" ? "rgba(52,211,153,0.15)" :
                                   "rgba(239,68,68,0.15)",
                        color: testi.status === "PENDING" ? "#FBBF24" :
                               testi.status === "ACCEPTED" ? "#34D399" :
                               "#EF4444",
                      }}>
                        {testi.status}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: 16, background: "var(--bg-elevated)", padding: 12, borderRadius: 8 }}>
                      "{testi.text}"
                    </p>

                    <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                      {testi.status === "PENDING" && (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{ flex: 1, padding: "8px", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                            onClick={() => updateStatus(testi.id, "ACCEPTED")}
                            disabled={updating === testi.id}
                          >
                            <CheckCircle size={16} /> Terima
                          </button>
                          <button
                            className="btn"
                            style={{ flex: 1, background: "#FEE2E2", color: "#EF4444", border: "1px solid #FECACA", padding: "8px", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                            onClick={() => updateStatus(testi.id, "REJECTED")}
                            disabled={updating === testi.id}
                          >
                            <XCircle size={16} /> Tolak
                          </button>
                        </>
                      )}

                      {testi.status === "ACCEPTED" && (
                        <button
                          className="btn"
                          style={{ width: "100%", background: "#FFF3CD", color: "#856404", border: "1px solid #FFEEBA", padding: "8px", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          onClick={() => updateStatus(testi.id, "HIDDEN")}
                          disabled={updating === testi.id}
                        >
                          <EyeOff size={16} /> Sembunyikan (Unpublish)
                        </button>
                      )}

                      {(testi.status === "REJECTED" || testi.status === "HIDDEN") && (
                        <button
                          className="btn btn-primary"
                          style={{ width: "100%", padding: "8px", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          onClick={() => updateStatus(testi.id, "ACCEPTED")}
                          disabled={updating === testi.id}
                        >
                          <CheckCircle size={16} /> Publish Kembali
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
