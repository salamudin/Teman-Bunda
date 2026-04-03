"use client";
import BottomBar from "@/components/BottomBar";
import AuthGuard from "@/components/AuthGuard";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

// Full fetal development data per week
const FETAL_DATA: Record<number, {
  emoji: string;
  size: string;
  weight: string;
  length: string;
  milestone: string;
  tips: string[];
  organDev: string;
}> = {
  4:  { emoji: "🫘", size: "Biji Sesawi", weight: "< 1 gram", length: "0.4 cm",
        milestone: "Jantung mulai berdetak!", organDev: "Otak, sumsum tulang belakang, dan jantung mulai terbentuk.",
        tips: ["Mulai konsumsi asam folat", "Hindari alkohol & rokok", "Segera periksa ke dokter/bidan"] },
  5:  { emoji: "🌱", size: "Biji Apel", weight: "< 1 gram", length: "0.5 cm",
        milestone: "Tunas tangan & kaki muncul", organDev: "Wajah, mata, telinga, dan hidung mulai terbentuk.",
        tips: ["Minum vitamin prenatal", "Istirahat cukup", "Hindari kafein berlebih"] },
  6:  { emoji: "🫐", size: "Blueberry", weight: "< 1 gram", length: "1.3 cm",
        milestone: "Sistem saraf berkembang pesat", organDev: "Otak berkembang, jantung punya 4 ruang.",
        tips: ["Konsumsi DHA untuk otak bayi", "Jalan santai pagi hari", "Banyak minum air"] },
  7:  { emoji: "🍓", size: "Stroberi", weight: "1 gram", length: "1.6 cm",
        milestone: "Wajah semakin jelas", organDev: "Mata, hidung, mulut terbentuk. Ginjal mulai bekerja.",
        tips: ["Hindari daging mentah", "Tidur miring ke kiri", "Ceritakan suasana hati Anda"] },
  8:  { emoji: "🫒", size: "Zaitun", weight: "1 gram", length: "2 cm",
        milestone: "Gerakan pertama dimulai", organDev: "Sendi mulai bekerja, jari-jari tangan terbentuk.",
        tips: ["Olahraga ringan yoga", "Konsultasi diet", "Dengarkan musik"] },
  9:  { emoji: "🍇", size: "Anggur", weight: "2 gram", length: "2.3 cm",
        milestone: "Semua organ dasar terbentuk", organDev: "Gigi susu mulai tumbuh di bawah gusi.",
        tips: ["Siapkan fisik & mental", "Baca buku parenting", "Jaga hidrasi"] },
  10: { emoji: "🍑", size: "Leci", weight: "4 gram", length: "3.1 cm",
        milestone: "Bayi mulai bergerak aktif", organDev: "Tulang mulai mengeras, refleks mulai berkembang.",
        tips: ["USG pertama jika belum", "Cek berat badan", "Yoga prenatal"] },
  11: { emoji: "🫑", size: "Paprika Mini", weight: "7 gram", length: "4 cm",
        milestone: "Jari kaki & tangan sempurna", organDev: "Kulit bayi sangat transparan, pembuluh darah terlihat.",
        tips: ["Mulai persiapkan baju bayi", "Test darah rutin", "Tidur yang cukup"] },
  12: { emoji: "🍋", size: "Plum", weight: "14 gram", length: "5.4 cm",
        milestone: "Akhir trimester 1!", organDev: "Semua organ vital terbentuk sempurna. Risiko keguguran turun.",
        tips: ["Rayakan milestone ini!", "Beritahu keluarga", "Jadwalkan kunjungan bidan"] },
  16: { emoji: "🍐", size: "Alpukat", weight: "100 gram", length: "11.6 cm",
        milestone: "Bisa mendengar suara ibu", organDev: "Telinga sempurna. Mata mulai bergerak.",
        tips: ["Ajak bicara bayi Anda", "Putar musik lembut", "Perhatikan asupan zat besi"] },
  20: { emoji: "🍌", size: "Pisang", weight: "300 gram", length: "25.6 cm",
        milestone: "Bisa merasakan sentuhan!", organDev: "Otak berkembang pesat. Rambut mulai tumbuh.",
        tips: ["USG anatomi lengkap", "Mulai kelas prenatal", "Jaga postur tidur"] },
  24: { emoji: "🌽", size: "Jagung", weight: "600 gram", length: "30 cm",
        milestone: "Paru-paru berkembang", organDev: "Paru-paru menghasilkan surfaktan. Otak sangat aktif.",
        tips: ["Latihan pernapasan", "Hindari stres berlebih", "Cek tekanan darah"] },
  28: { emoji: "🥬", size: "Sawi", weight: "1 kg", length: "37.6 cm",
        milestone: "Mata mulai bisa membuka!", organDev: "Otak sangat aktif, bayi bisa bermimpi.",
        tips: ["Hitung gerakan bayi", "Persiapkan tas persalinan", "Konsultasi rencana lahir"] },
  32: { emoji: "🥥", size: "Kelapa", weight: "1.7 kg", length: "42.4 cm",
        milestone: "Fase tidur REM aktif", organDev: "Tulang semakin kuat. Bayi berlatih bernapas.",
        tips: ["Tidur miring kiri", "Jaga intake kalsium", "Daftarkan RS bersalin"] },
  36: { emoji: "🍈", size: "Melon Kecil", weight: "2.6 kg", length: "47.4 cm",
        milestone: "Siap dilahirkan!", organDev: "Paru-paru matang. Bayi turun ke posisi lahir.",
        tips: ["Persiapkan mental lahir", "Latihan nafas Lamaze", "Jaga pola makan"] },
  40: { emoji: "🎃", size: "Labu Kecil", weight: "3.4 kg", length: "51 cm",
        milestone: "Waktu yang ditunggu! 🌟", organDev: "Bayi siap lahir. Semua sistem berfungsi penuh.",
        tips: ["Kenali tanda persalinan", "Hubungi bidan jika kontraksi", "Tetap tenang & semangat!"] },
};

function getDataForWeek(week: number) {
  const keys = Object.keys(FETAL_DATA).map(Number).sort((a, b) => a - b);
  let matched = keys[0];
  for (const k of keys) { if (week >= k) matched = k; }
  return { ...FETAL_DATA[matched], weekKey: matched };
}

function getTrimesters(week: number) {
  if (week <= 12) return { label: "Trimester 1", color: "#A6C1CC" };
  if (week <= 27) return { label: "Trimester 2", color: "#EC4899" };
  return { label: "Trimester 3", color: "#06B6D4" };
}

export default function JaninPage() {
  const { user } = useAuthStore();
  const [week, setWeek] = useState(user?.gestationalAge || 12);

  const data = getDataForWeek(week);
  const trimester = getTrimesters(week);
  const progressPct = Math.min((week / 40) * 100, 100);

  const ALL_WEEKS_DATA = Object.keys(FETAL_DATA).map(Number).sort((a, b) => a - b);

  return (
    <AuthGuard>
      <div className="page-no-pad">
        <div className="nav-bar">
          <div className="nav-logo">Perkembangan Janin</div>
        </div>

        <div style={{ padding: "20px 20px 100px" }}>
          {/* Week selector */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 2 }}>Usia Kehamilan</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#000000" }}>
                  Minggu {week}
                </div>
              </div>
              <span className="chip" style={{ background: `${trimester.color}22`, color: trimester.color, border: `1px solid ${trimester.color}44` }}>
                {trimester.label}
              </span>
            </div>

            {/* Slider */}
            <div style={{ marginBottom: 8 }}>
              <input
                type="range"
                min={4}
                max={40}
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value))}
                style={{
                  width: "100%", accentColor: "var(--primary)",
                  height: 6, borderRadius: 3, cursor: "pointer"
                }}
                id="week-slider"
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>
                <span>4 mgg</span>
                <span>40 mgg</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progressPct}%`,
                background: "var(--gradient-primary)", borderRadius: 3,
                transition: "width 0.4s ease"
              }} />
            </div>
            <div style={{ fontSize: "0.75rem", color: "#3D444F", marginTop: 6, fontWeight: 500 }}>
              {Math.round(progressPct)}% perjalanan kehamilan
            </div>
          </div>

          {/* Main fetal card */}
          <div className="fetal-outer" style={{ marginBottom: 20 }}>
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{
                fontSize: "6rem", animation: "float 3s ease-in-out infinite",
                marginBottom: 16, display: "block"
              }}>
                {data.emoji}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#3D444F", fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>
                UKURAN JANIN
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>{data.size}</div>
              <div style={{
                background: "rgba(166,193,204,0.2)", border: "1px solid rgba(166,193,204,0.3)",
                borderRadius: "var(--radius-full)", padding: "8px 20px", display: "inline-block"
              }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary-dark)" }}>
                  🏆 {data.milestone}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Berat Estimasi", value: data.weight, emoji: "⚖️" },
              { label: "Panjang", value: data.length, emoji: "📏" },
            ].map((item) => (
              <div key={item.label} className="glass-card" style={{ textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{item.emoji}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#000000" }}>{item.value}</div>
                <div style={{ fontSize: "0.75rem", color: "#3D444F", fontWeight: 600 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Organ development */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: "1.25rem" }}>🧬</span>
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Perkembangan Organ</h2>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {data.organDev}
            </p>
          </div>

          {/* Tips */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: "1.25rem" }}>💡</span>
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Tips untuk Ibu</h2>
            </div>
            {data.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: "rgba(166,193,204,0.2)", border: "1px solid rgba(166,193,204,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, color: "var(--primary-light)", flexShrink: 0
                }}>{i + 1}</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>

          {/* Weekly timeline */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>🗓️ Momen Penting</h2>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
              {ALL_WEEKS_DATA.map((w) => (
                <button
                  key={w}
                  onClick={() => setWeek(w)}
                  style={{
                    flexShrink: 0, padding: "8px 14px",
                    background: week === w ? "var(--gradient-primary)" : "var(--bg-elevated)",
                    border: week === w ? "none" : "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", cursor: "pointer",
                    color: week === w ? "white" : "var(--text-secondary)",
                    fontFamily: "inherit", fontWeight: 600, fontSize: "0.8rem",
                    transition: "all 0.2s"
                  }}
                >
                  {FETAL_DATA[w].emoji} Mgg {w}
                </button>
              ))}
            </div>
          </div>

          {/* CTA to consult */}
          <div style={{
            background: "rgba(163,191,202,0.2)",
            border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: "var(--radius-lg)", padding: 20
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Ada pertanyaan tentang perkembangan janin?</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
              Konsultasikan langsung dengan bidan berpengalaman kami untuk mendapatkan panduan personal.
            </p>
            <a href="/bidans" style={{ textDecoration: "none" }}>
              <button className="btn btn-primary" style={{ width: "100%" }} id="janin-consult-cta">
                Konsultasi Sekarang <ChevronRight size={16} />
              </button>
            </a>
          </div>
        </div>

        <BottomBar />
      </div>
    </AuthGuard>
  );
}
