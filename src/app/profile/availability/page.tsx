"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export default function AvailabilityPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newSlot, setNewSlot] = useState({ start: "09:00", end: "10:00" });
  const [adding, setAdding] = useState(false);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchAvailabilities();
  }, [token]);

  async function fetchAvailabilities() {
    try {
      const res = await fetch("/api/bidans/availability", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setAvailabilities(data.availabilities || []);
      }
    } catch {
      addToast("Gagal memuat jadwal", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSlot() {
    if (adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/bidans/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "ADD",
          date: selectedDate,
          startTime: newSlot.start,
          endTime: newSlot.end,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAvailabilities((prev) => [...prev, data.availability].sort((a, b) => a.startTime.localeCompare(b.startTime)));
        addToast("Jadwal berhasil ditambahkan", "success");
        router.refresh();
      } else {
        addToast(data.error || "Gagal menambahkan jadwal", "error");
      }
    } catch {
      addToast("Terjadi kesalahan", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteSlot(id: string) {
    if (confirm("Hapus jadwal ini?")) {
      try {
        const res = await fetch("/api/bidans/availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "DELETE", id }),
        });
        if (res.ok) {
          setAvailabilities((prev) => prev.filter((a) => a.id !== id));
          addToast("Jadwal dihapus", "success");
          router.refresh();
        } else {
          const data = await res.json();
          addToast(data.error || "Gagal menghapus", "error");
        }
      } catch {
        addToast("Terjadi kesalahan", "error");
      }
    }
  }

  const filteredSlots = availabilities.filter(
    (a) => new Date(a.date).toISOString().split("T")[0] === selectedDate
  );

  return (
    <AuthGuard>
      <ToastContainer />
      <div className="page-no-pad">
        <div className="nav-bar">
          <button onClick={() => router.back()} className="nav-icon-btn"><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Kelola Jadwal</span>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ padding: "24px 20px" }}>
          <div className="card" style={{ marginBottom: 24, border: "none", background: "var(--bg-elevated)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarIcon size={18} color="var(--primary)" /> Pilih Tanggal
            </h3>
            <div className="date-grid">
              {dates.map((date) => {
                const d = new Date(date);
                const isSelected = selectedDate === date;
                return (
                  <div
                    key={date}
                    className={`date-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="day-name">{d.toLocaleDateString("id-ID", { weekday: "short" })}</div>
                    <div className="day-num">{d.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 20 }}>Tambah Jam Praktek</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Mulai</label>
                <input
                  type="time"
                  className="form-input"
                  value={newSlot.start}
                  onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Selesai</label>
                <input
                  type="time"
                  className="form-input"
                  value={newSlot.end}
                  onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ 
                  height: 48, width: 48, borderRadius: "var(--radius-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0
                }}
                onClick={handleAddSlot}
                disabled={adding}
              >
                <Plus size={24} color="#FFFFFF" strokeWidth={3} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "8px 0" }}>
              Jadwal Anda ({new Date(selectedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long" })})
            </h3>
            
            {loading ? (
              <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
            ) : filteredSlots.length === 0 ? (
              <div className="empty-state" style={{ background: "var(--bg-elevated)", borderRadius: 16, padding: 32 }}>
                <Clock size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Tidak ada jadwal di tanggal ini.</p>
              </div>
            ) : (
              filteredSlots.map((slot) => (
                <div 
                  key={slot.id} 
                  className="card" 
                  style={{ 
                    display: "flex", alignItems: "center", justifyContent: "space-between", 
                    padding: "16px 20px", background: slot.isBooked ? "rgba(16,185,129,0.05)" : "white"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 12, 
                      background: slot.isBooked ? "var(--success)" : "rgba(166,193,204,0.15)", 
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Clock size={18} color={slot.isBooked ? "white" : "var(--primary-dark)"} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {slot.startTime} – {slot.endTime}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: slot.isBooked ? "var(--success)" : "var(--text-muted)", fontWeight: 600 }}>
                        {slot.isBooked ? "● Sudah Dipesan" : "Tersedia"}
                      </div>
                    </div>
                  </div>
                  
                  {!slot.isBooked && (
                    <button 
                      onClick={() => handleDeleteSlot(slot.id)}
                      style={{ 
                        background: "none", border: "none", color: "#EF4444", 
                        padding: 8, cursor: "pointer", borderRadius: 8,
                        transition: "all 0.2s" 
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#FEE2E2")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div style={{ 
            marginTop: 40, padding: 20, background: "rgba(245,158,11,0.05)", 
            borderRadius: 16, border: "1px dashed rgba(245,158,11,0.3)",
            display: "flex", gap: 12
          }}>
            <AlertCircle size={20} color="#F59E0B" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: "0.8rem", color: "#D97706", lineHeight: 1.5 }}>
              Jadwal yang sudah dipesan oleh pasien tidak dapat dihapus atau dirubah tanpa pembatalan dari pihak admin.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
