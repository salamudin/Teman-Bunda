"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Baby, 
  Calendar, 
  Settings, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Apple, 
  AlertCircle 
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import BottomBar from "@/components/BottomBar";
import PageShell from "@/components/PageShell";

import { getWeekInfo, JaninWeekInfo } from "@/lib/janinData";

export default function JaninPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [weekInfo, setWeekInfo] = useState<JaninWeekInfo | null>(null);
  const [gestationalAge, setGestationalAge] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user?.hpht || user?.gestationalAge) {
      // Logic recalculation
      let age = user.gestationalAge || 0;
      
      if (user.hpht) {
        const hphtDate = new Date(user.hpht);
        const today = new Date();
        const diffTime = today.getTime() - hphtDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Minggu ke-N: 0-6 hari adalah Minggu ke-1, 7-13 hari adalah Minggu ke-2, dst.
        age = Math.floor(diffDays / 7) + 1;
      }
      
      const cappedAge = Math.min(Math.max(age, 1), 40);
      setGestationalAge(cappedAge);
      setWeekInfo(getWeekInfo(cappedAge));
      
      // Hitung progress (0-100) berbasis 40 minggu
      setProgress(Math.min((cappedAge / 40) * 100, 100));
    }
  }, [user]);


  // Onboarding / Empty State
  if (!user?.hpht && !user?.gestationalAge) {
    return (
      <AuthGuard>
        <div style={{ minHeight: "100vh", backgroundColor: "#FEF1F9", display: "flex", flexDirection: "column" }}>
            <div className="nav-bar" style={{ backgroundColor: "transparent", border: "none", justifyContent: "space-between", padding: "0 24px" }}>
                <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#333" }}>Perkembangan Janin</span>
                <div style={{ width: 24 }} />
            </div>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
                <div style={{ 
                    width: 140, height: 140, backgroundColor: "#FFF", borderRadius: "50%", 
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32,
                    boxShadow: "0 10px 30px rgba(237, 84, 181, 0.15)"
                }}>
                    <Baby size={70} color="#ED54B5" />
                </div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#4A4A4A", marginBottom: 16 }}>
                    Pantau Si Kecil Bersama Kami
                </h2>
                <p style={{ color: "#7D7D7D", lineHeight: 1.6, marginBottom: 40 }}>
                    Masukkan usia kehamilan Bunda untuk mendapatkan update perkembangan janin & tips kesehatan yang dipersonalisasi tiap minggunya.
                </p>
                
                <button 
                    onClick={() => router.push("/janin/setup")}
                    className="btn btn-primary"
                    style={{ padding: "16px 32px", fontSize: "1.1rem", borderRadius: 20, fontWeight: 700, width: "100%", background: "#ED54B5" }}
                >
                    Mulai Isi Data Kehamilan
                </button>
            </div>
            <BottomBar />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageShell>
        <div style={{ minHeight: "100vh", backgroundColor: "#FEF1F9" }}>
          <ToastContainer />
          
          {/* Header Section */}
          <div style={{ 
            background: "#ED54B5", 
            padding: "20px 24px 40px",
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            color: "white",
            position: "relative"
          }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <span style={{ fontWeight: 800, fontSize: "1.2rem" }}>Perkembangan Janin</span>
                  <button 
                      onClick={() => router.push("/janin/setup")} 
                      style={{ background: "rgba(255,255,255,0.2)", padding: 8, borderRadius: "50%", color: "white", border: "none" }}
                  >
                      <Settings size={20} />
                  </button>
              </div>


              <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <h1 style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: 4 }}>Minggu ke-{gestationalAge}</h1>
                  <p style={{ opacity: 0.9, fontSize: "0.9rem", fontWeight: 500 }}>
                      HPL: {user.dueDate ? new Date(user.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Belum dihitung"}
                  </p>
              </div>

              {/* Progress Bar Container */}
              <div style={{ padding: "0 10px" }}>
                  <div style={{ width: "100%", height: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                      <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "white", borderRadius: 4 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 700, opacity: 0.8 }}>
                      <span>AWAL</span>
                      <span>TRIMESTER {gestationalAge <= 13 ? "1" : gestationalAge <= 26 ? "2" : "3"}</span>
                      <span>H-DAY</span>
                  </div>
              </div>
          </div>

          {/* Content Section */}
          <div style={{ padding: "0 20px 100px", marginTop: -24 }}>
              {/* Week Comparison Card */}
              <div style={{ 
                  backgroundColor: "white", borderRadius: 24, padding: 24, display: "flex", gap: 20, 
                  alignItems: "center", boxShadow: "0 10px 25px rgba(255, 176, 176, 0.15)", marginBottom: 24 
              }}>
                  <div style={{ 
                      width: 80, height: 80, borderRadius: 20, backgroundColor: "#FFF8F0", 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "3rem", border: "1px solid #FFEEDF"
                  }}>
                      <span style={{ fontSize: "3rem" }}>{weekInfo?.emoji || "👶"}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#B0B0B0", marginBottom: 4 }}>UKURAN JANIN</p>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#4A4A4A" }}>
                          Sama dengan <span style={{ color: "#ED54B5" }}>{weekInfo?.fruitAnalogy}</span>
                      </h3>
                      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>

                          <div>
                              <p style={{ fontSize: "0.65rem", color: "#999" }}>PANJANG</p>
                              <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>{weekInfo?.size}</p>
                          </div>
                          <div style={{ width: 1, backgroundColor: "#EEE" }} />
                          <div>
                              <p style={{ fontSize: "0.65rem", color: "#999" }}>BERAT</p>
                              <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>{weekInfo?.weight}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Development Detail */}
              <div className="card-janin" style={{ backgroundColor: "white", padding: 24, borderRadius: 28, marginBottom: 20, border: "none" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                      <Sparkles size={20} color="#ED54B5" />
                      <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#333" }}>Si Kecil Pekan Ini</h2>
                  </div>

                  <p style={{ lineHeight: 1.8, color: "#555", fontSize: "0.9rem" }}>
                      {weekInfo?.description}
                  </p>
              </div>

              {/* Mother Condition */}
              <div className="card-janin" style={{ backgroundColor: "#FBD5ED", padding: 24, borderRadius: 28, marginBottom: 20, border: "none" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                      <Heart size={20} color="#ED54B5" fill="#ED54B5" />
                      <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#333" }}>Kondisi Bunda</h2>
                  </div>

                  <p style={{ lineHeight: 1.8, color: "#555", fontSize: "0.9rem" }}>
                      {weekInfo?.motherSensation}
                  </p>
              </div>

              {/* Tips & Recommendations */}
              <div className="card-janin" style={{ backgroundColor: "white", padding: 24, borderRadius: 28, marginBottom: 20, border: "none" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
                      <CheckCircle2 size={20} color="#10B981" />
                      <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#333" }}>Saran & Tips</h2>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {weekInfo?.tips.map((tip, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{ padding: 4, borderRadius: 6, backgroundColor: "#EEF2FF" }}>
                                  <div style={{ width: 6, height: 6, backgroundColor: "#4F46E5", borderRadius: "50%" }} />
                              </div>
                              <span style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.5 }}>
                                  {tip}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Safety Alert (Optional replacement for what to avoid) */}
              <div style={{ 
                  backgroundColor: "#FFF7ED", padding: 16, borderRadius: 20, display: "flex", gap: 12, 
                  border: "1px dashed #FFEDD5"
              }}>
                  <AlertCircle size={20} color="#EA580C" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: "0.75rem", color: "#C2410C", lineHeight: 1.6 }}>
                      Ingat, informasi di atas hanyalah gambaran umum perkembangan janin Bunda. Tetap konsultasikan kehamilan Bunda dengan bidan atau dokter kami secara rutin ya!
                  </p>
              </div>
          </div>
          <BottomBar />
        </div>
      </PageShell>
    </AuthGuard>
  );

}

