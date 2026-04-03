"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Check, ChevronRight } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
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
  specializations: string[];
  rating: number;
  availabilities: Availability[];
}

const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    dayName: DAYS_ID[d.getDay()],
    dayNum: d.getDate(),
    month: MONTHS_ID[d.getMonth()],
  };
}

export default function BookingPage() {
  const { id: bidanId } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  const [bidan, setBidan] = useState<Bidan | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1=select date, 2=select time, 3=confirm
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBidan = useCallback(async () => {
    try {
      const res = await fetch(`/api/bidans/${bidanId}`);
      const data = await res.json();
      setBidan(data.bidan);
    } catch {
      addToast("Gagal memuat data bidan", "error");
    } finally {
      setLoading(false);
    }
  }, [bidanId, addToast]);

  useEffect(() => { fetchBidan(); }, [fetchBidan]);

  // Group availabilities by date
  const groupedByDate: Record<string, Availability[]> = {};
  bidan?.availabilities?.forEach((a) => {
    const d = new Date(a.date);
    const key = d.toDateString();
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(a);
  });
  const dateKeys = Object.keys(groupedByDate);
  const timeSlotsForDate = selectedDateKey ? groupedByDate[selectedDateKey] || [] : [];

  async function handleBook() {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bidanId,
          availabilityId: selectedSlot.id,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Booking gagal", "error");
      } else {
        addToast("Booking berhasil! Lanjut ke pembayaran 🎉", "success");
        router.push(`/payment/${data.booking.id}`);
      }
    } catch {
      addToast("Terjadi kesalahan", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const STEPS = ["Tanggal", "Jam", "Konfirmasi"];

  if (loading) {
    return (
      <AuthGuard>
        <div style={{ padding: 24 }}>
          <div className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)" }} />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <ToastContainer />
      <div style={{ minHeight: "100vh", paddingBottom: 120 }}>
        {/* Nav */}
        <div className="nav-bar">
          <button onClick={() => { if (step > 1) setStep(step - 1); else router.back(); }} className="nav-icon-btn">
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontWeight: 700 }}>Book Konsultasi</span>
          <div style={{ width: 40 }} />
        </div>

        {/* Bidan mini card */}
        {bidan && (
          <div style={{ padding: "16px 20px 0" }}>
            <div className="glass-card" style={{ display: "flex", gap: 12, alignItems: "center", padding: 14 }}>
              <Avatar name={bidan.name} src={bidan.avatar} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{bidan.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  ⭐ {bidan.rating.toFixed(1)} • {bidan.experience}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>per sesi</div>
                <div style={{ fontWeight: 700, color: "var(--primary-light)" }}>Rp 150.000</div>
              </div>
            </div>
          </div>
        )}

        {/* Steps indicator */}
        <div style={{ padding: "20px 20px 0" }}>
          <div className="steps">
            {STEPS.map((s, i) => {
              const num = i + 1;
              const isDone = step > num;
              const isActive = step === num;
              return (
                <div key={s} className={`step${isDone ? " done" : isActive ? " active" : ""}`}>
                  <div className="step-dot">
                    {isDone ? <Check size={14} /> : num}
                  </div>
                  <span className="step-label">{s}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Step 1: Date */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 className="section-title" style={{ marginBottom: 4 }}>Pilih Tanggal</h2>
              <p className="section-subtitle">Pilih tanggal yang sesuai untuk konsultasi Anda</p>
              {dateKeys.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p style={{ color: "var(--text-secondary)" }}>Tidak ada slot tersedia saat ini</p>
                </div>
              ) : (
                <div className="date-grid">
                  {dateKeys.slice(0, 14).map((dk) => {
                    const { dayName, dayNum, month } = formatDate(groupedByDate[dk][0].date);
                    const isSelected = selectedDateKey === dk;
                    return (
                      <div
                        key={dk}
                        className={`date-chip${isSelected ? " selected" : ""}`}
                        onClick={() => setSelectedDateKey(dk)}
                      >
                        <div className="day-name">{dayName}</div>
                        <div className="day-num">{dayNum}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>{month}</div>
                        <div style={{ fontSize: "0.65rem", color: isSelected ? "var(--primary-light)" : "var(--text-muted)", marginTop: 2 }}>
                          {groupedByDate[dk].length} slot
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Time */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h2 className="section-title" style={{ marginBottom: 4 }}>Pilih Jam</h2>
              <p className="section-subtitle">
                {selectedDateKey ? `${DAYS_ID[new Date(groupedByDate[selectedDateKey][0].date).getDay()]}, 
                  ${new Date(groupedByDate[selectedDateKey][0].date).getDate()} ${MONTHS_ID[new Date(groupedByDate[selectedDateKey][0].date).getMonth()]}` : ""}
              </p>
              <div className="time-grid">
                {timeSlotsForDate.map((slot) => (
                  <div
                    key={slot.id}
                    className={`time-chip${selectedSlot?.id === slot.id ? " selected" : ""}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div>{slot.startTime}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>1 jam</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedSlot && bidan && (
            <div className="animate-fade-up">
              <h2 className="section-title" style={{ marginBottom: 4 }}>Konfirmasi Booking</h2>
              <p className="section-subtitle">Periksa detail konsultasi Anda</p>

              <div className="card" style={{ marginBottom: 16 }}>
                {[
                  { label: "Bidan", value: bidan.name },
                  {
                    label: "Tanggal",
                    value: new Date(selectedSlot.date).toLocaleDateString("id-ID", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric"
                    })
                  },
                  { label: "Jam", value: `${selectedSlot.startTime} – ${selectedSlot.endTime} WIB` },
                  { label: "Tipe", value: "Chat Konsultasi" },
                  { label: "Harga", value: "Rp 150.000" },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "12px 0", borderBottom: "1px solid var(--border)"
                  }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{row.label}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", textAlign: "right", maxWidth: "60%" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">Catatan untuk Bidan (opsional)</label>
                <textarea
                  id="notes"
                  className="form-input"
                  placeholder="Ceritakan keluhan atau pertanyaan Anda secara singkat..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>

              <div className="glass-card" style={{ marginBottom: 16, padding: 14 }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  📋 Setelah konfirmasi, Anda akan diarahkan ke halaman pembayaran via transfer BCA.
                  Sesi akan aktif setelah pembayaran dikonfirmasi oleh admin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: "var(--max-width)",
          padding: "16px 20px",
          background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(16px)",
          borderTop: "1px solid var(--border)", zIndex: 50
        }}>
          {step < 3 ? (
            <button
              className="btn btn-primary btn-full"
              id={`booking-next-step-${step}`}
              disabled={step === 1 ? !selectedDateKey : !selectedSlot}
              onClick={() => setStep(step + 1)}
            >
              Lanjut <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary btn-full"
              id="booking-confirm-btn"
              disabled={submitting}
              onClick={handleBook}
            >
              {submitting ? "Memproses..." : "Konfirmasi Booking →"}
            </button>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
