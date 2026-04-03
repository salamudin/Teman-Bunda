"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Copy, Check, Upload, Clock, CheckCircle } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";

interface Booking {
  id: string;
  status: string;
  amount: number;
  bidanId: string;
  userId: string;
  bidan: { name: string };
  user: { name: string; email?: string; phone?: string };
  availability: { date: string; startTime: string; endTime: string };
  paymentProof?: string;
}

const BCA_ACCOUNT = process.env.NEXT_PUBLIC_BCA_ACCOUNT || "8970060022";
const BCA_NAME = process.env.NEXT_PUBLIC_BCA_NAME || "Novianti Tri Hastuti";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBooking(data.booking);
    } catch {
      addToast("Gagal memuat booking", "error");
    } finally {
      setLoading(false);
    }
  }, [id, token, addToast]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      addToast(`${field} disalin!`, "success");
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function updateStatus(newStatus: string) {
    setUploading(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, ...(newStatus === "PAID" && { paymentProof }) }),
      });
      if (res.ok) {
        const msg = newStatus === "CONFIRMED" ? "✅ Pembayaran terkonfirmasi!" : "✅ Konfirmasi pembayaran dikirim!";
        addToast(msg, "success");
        setBooking((b) => b ? { ...b, status: newStatus } : b);
        if (newStatus === "CONFIRMED") router.push("/bookings");
      }
    } catch {
      addToast("Gagal memperbarui status", "error");
    } finally {
      setUploading(false);
    }
  }

  function markPaid() {
    if (!paymentProof) {
      addToast("Harap upload foto bukti transfer terlebih dahulu", "error");
      return;
    }
    updateStatus("PAID");
  }

  function confirmPayment() {
    updateStatus("CONFIRMED");
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  }

  const isPaid = booking?.status !== "WAITING_PAYMENT";

  return (
    <AuthGuard>
      <ToastContainer />
      <div style={{ minHeight: "100vh", paddingBottom: 48 }}>
        <div className="nav-bar">
          <button onClick={() => router.back()} className="nav-icon-btn"><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 700 }}>Pembayaran</span>
          <div style={{ width: 40 }} />
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            <div className="skeleton" style={{ height: 300, borderRadius: "var(--radius-lg)" }} />
          </div>
        ) : !booking ? (
          <div className="empty-state"><div className="empty-icon">❌</div><p>Booking tidak ditemukan</p></div>
        ) : (
          <div style={{ padding: "20px 20px 40px" }}>
            {/* Midwife view */}
            {user?.role === "BIDAN" ? (
              <>
                <div className="card" style={{ marginBottom: 20, border: "1px solid var(--primary-light)" }}>
                  <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 12, color: "var(--primary)" }}>Verifikasi Pembayaran</h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
                    Harap periksa bukti transfer dari <strong>{booking.user.name}</strong> di bawah ini sebelum melakukan konfirmasi.
                  </p>
                  
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8 }}>Bukti Transfer:</div>
                    {booking.paymentProof ? (
                      <div style={{ background: "#F1F5F9", borderRadius: 12, padding: 8 }}>
                        <img src={booking.paymentProof} alt="Bukti Transfer" style={{ width: "100%", borderRadius: 8, maxHeight: 400, objectFit: "contain" }} />
                      </div>
                    ) : (
                      <div className="empty-state" style={{ padding: 30, background: "#F1F5F9" }}>
                        <div style={{ fontSize: "2rem", marginBottom: 10 }}>⏳</div>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>User belum mengupload bukti transfer</p>
                      </div>
                    )}
                  </div>

                  {booking.status === "PAID" && (
                    <button 
                      className="btn btn-primary btn-full" 
                      onClick={confirmPayment} 
                      disabled={uploading}
                      style={{ height: 54, fontSize: "1rem" }}
                    >
                      {uploading ? "Memproses..." : "Konfirmasi Pembayaran ✅"}
                    </button>
                  )}
                  {booking.status === "CONFIRMED" && (
                    <div style={{ textAlign: "center", padding: "12px", background: "rgba(16,185,129,0.1)", color: "#10B981", borderRadius: 12, fontWeight: 700 }}>
                      ✓ Pembayaran sudah dikonfirmasi
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Status */}
                {isPaid ? (
              <div style={{
                background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 20,
                display: "flex", alignItems: "center", gap: 14, textAlign: "center",
                flexDirection: "column"
              }}>
                <CheckCircle size={48} color="#10B981" />
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#34D399", marginBottom: 6 }}>
                    {booking.status === "CONFIRMED" ? "Booking Terkonfirmasi! 🎉" : "Menunggu Verifikasi Admin"}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {booking.status === "CONFIRMED"
                      ? "Sesi konsultasi Anda sudah dikonfirmasi."
                      : "Pembayaran Anda sedang diverifikasi oleh admin. Max 1x24 jam."}
                  </p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.push("/bookings")}>
                  Lihat Jadwal Saya
                </button>
              </div>
            ) : null}

            {/* Booking summary */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: "0.95rem" }}>📋 Detail Booking</h3>
              {[
                { label: "Bidan", value: booking.bidan.name },
                {
                  label: "Tanggal", value: new Date(booking.availability.date).toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long"
                  })
                },
                { label: "Jam", value: `${booking.availability.startTime} – ${booking.availability.endTime} WIB` },
                { label: "Status", value: booking.status.replace("_", " ") },
              ].map((row) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", padding: "10px 0",
                  borderBottom: "1px solid var(--border)", fontSize: "0.875rem"
                }}>
                  <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Payment card */}
            {!isPaid && (
              <>
                <div className="bank-card" style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{
                      background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 12px",
                      fontSize: "1rem", fontWeight: 700, letterSpacing: 1, color: "white"
                    }}>BCA</div>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>Bank Central Asia</span>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Nomor Rekening</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="bank-number">{BCA_ACCOUNT}</div>
                      <button className="copy-btn" onClick={() => copyToClipboard(BCA_ACCOUNT, "Nomor rekening")}>
                        {copied === "Nomor rekening" ? <Check size={12} /> : <Copy size={12} />}
                        {copied === "Nomor rekening" ? "Disalin" : "Salin"}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Atas Nama</div>
                    <div style={{ fontWeight: 600, fontSize: "1rem", color: "white" }}>{BCA_NAME}</div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Jumlah Transfer</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
                        {formatCurrency(booking.amount)}
                      </div>
                      <button className="copy-btn" onClick={() => copyToClipboard(String(booking.amount), "Nominal")}>
                        {copied === "Nominal" ? <Check size={12} /> : <Copy size={12} />}
                        Salin
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="card" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: "0.9rem" }}>Cara Pembayaran</h3>
                  {[
                    "Transfer ke rekening BCA di atas sesuai nominal",
                    "Screenshot / foto bukti transfer",
                    'Klik tombol "Saya Sudah Transfer" di bawah',
                    "Tunggu konfirmasi dari admin (max 1×24 jam)",
                    "Sesi konsultasi aktif setelah dikonfirmasi",
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%", background: "var(--gradient-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 700, color: "white", flexShrink: 0
                      }}>{i + 1}</div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{s}</p>
                    </div>
                  ))}
                </div>

                {/* Timer hint */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "14px 16px",
                  background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: "var(--radius-md)", marginBottom: 20
                }}>
                  <Clock size={18} color="#FBBF24" />
                  <p style={{ fontSize: "0.8rem", color: "#FCD34D" }}>
                    Segera lakukan transfer untuk mengamankan slot konsultasi Anda
                  </p>
                </div>

                {/* Upload Proof */}
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="proof-upload" style={{
                    display: "block",
                    padding: "16px",
                    background: "var(--bg-elevated)",
                    border: "2px dashed rgba(167,139,250,0.4)",
                    borderRadius: "var(--radius-md)",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                    <Upload size={24} color="var(--primary-light)" style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                      {proofName ? proofName : "Upload Bukti Transfer"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Format JPG, PNG (Max 5MB)
                    </div>
                    <input
                      id="proof-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  {paymentProof && (
                    <div style={{
                      marginTop: 12, padding: "8px 12px", background: "rgba(16,185,129,0.15)",
                      borderRadius: "var(--radius-sm)", border: "1px solid rgba(16,185,129,0.3)",
                      display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#34D399"
                    }}>
                      <CheckCircle size={14} /> Bukti transfer berhasil dipilih
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-primary btn-full"
                  id="confirm-payment-btn"
                  onClick={markPaid}
                  disabled={uploading || !paymentProof}
                  style={{ gap: 10 }}
                >
                  <Upload size={18} />
                  {uploading ? "Mengirim..." : "Saya Sudah Transfer"}
                </button>
                </>
              )}
            </>
          )}

            {user?.role === "BIDAN" && (
              <button className="btn btn-secondary btn-full" onClick={() => router.push("/bookings")}>
                Kembali ke Jadwal →
              </button>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
