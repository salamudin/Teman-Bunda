"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";

export default function JaninSetupPage() {
  const router = useRouter();
  const { token, user, setUser } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);
  const [hpht, setHpht] = useState("");
  const [loading, setLoading] = useState(false);

  const calculatePregnancy = () => {
    if (!hpht) return null;
    
    const hphtDate = new Date(hpht);
    const today = new Date();
    
    // 1. Durasi dalam milidetik
    const diffTime = Math.abs(today.getTime() - hphtDate.getTime());
    // 2. Konversi ke hari
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // 3. Konversi ke minggu
    const weeks = Math.floor(diffDays / 7);
    
    // 4. Hitung HPL (Naegele's rule simplified: HPHT + 280 days)
    const hpl = new Date(hphtDate);
    hpl.setDate(hpl.getDate() + 280);
    
    return { weeks, hpl };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hpht) {
      addToast("Silakan pilih tanggal HPHT", "error");
      return;
    }

    const { weeks, hpl } = calculatePregnancy()!;
    
    setLoading(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hpht,
          status: "HAMIL",
          gestationalAge: weeks,
          dueDate: hpl
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        addToast("Data kehamilan berhasil disimpan! 🎉", "success");
        setTimeout(() => router.push("/janin"), 1500);
      } else {
        addToast("Gagal menyimpan data", "error");
      }
    } catch {
      addToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: "100vh", backgroundColor: "#FDF4F5" }}>
        <ToastContainer />
        
        {/* Nav */}
        <div className="nav-bar" style={{ backgroundColor: "transparent", border: "none" }}>
          <button onClick={() => router.back()} className="nav-icon-btn">
            <ChevronLeft size={24} />
          </button>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Setup Kehamilan</span>
          <div style={{ width: 44 }} />
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 40, marginTop: 20 }}>
            <div style={{ 
              width: 80, height: 80, backgroundColor: "#FFB0B0", borderRadius: "50%", 
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
            }}>
              <CalendarIcon size={40} color="white" />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4A4A4A", marginBottom: 12 }}>
              Halo Bunda!
            </h1>
            <p style={{ color: "#7D7D7D", lineHeight: 1.6 }}>
              Agar kami bisa memberikan informasi perkembangan janin yang tepat, bantu kami menghitung usia kehamilan Bunda ya.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ 
            backgroundColor: "white", padding: 24, borderRadius: 24, 
            boxShadow: "0 10px 25px rgba(255, 176, 176, 0.2)"
          }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: "block", marginBottom: 10, fontSize: "0.9rem", 
                fontWeight: 600, color: "#666" 
              }}>
                Hari Pertama Haid Terakhir (HPHT)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  value={hpht}
                  onChange={(e) => setHpht(e.target.value)}
                  style={{
                    width: "100%", padding: "16px", borderRadius: 16,
                    border: "2px solid #F1F1F1", fontSize: "1rem", outline: "none",
                    backgroundColor: "#FAFAFA"
                  }}
                  required
                />
              </div>
              <p style={{ fontSize: "0.75rem", color: "#999", marginTop: 10 }}>
                *Kami akan menggunakan data ini untuk memantau tumbuh kembang si Kecil tiap minggunya.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ padding: "18px", borderRadius: 16, fontSize: "1rem", fontWeight: 700 }}
            >
              {loading ? "Menyimpan..." : "Lanjutkan"}
              {!loading && <ArrowRight size={18} style={{ marginLeft: 8 }} />}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 32, fontSize: "0.85rem", color: "#B0B0B0" }}>
            Taksiran persalinan (HPL) akan dihitung secara otomatis berdasarkan HPHT Bunda.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
