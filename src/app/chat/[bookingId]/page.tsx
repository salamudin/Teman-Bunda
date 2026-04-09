"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Send, Clock, Image as ImageIcon, Paperclip, X, ExternalLink, ArrowRight } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import Avatar from "@/components/Avatar";
import ToastContainer from "@/components/ToastContainer";
import BottomSheet from "@/components/BottomSheet";

interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  type: "TEXT" | "IMAGE";
  senderType: "USER" | "BIDAN";
  senderId: string;
  createdAt: string;
}

interface Booking {
  id: string;
  status: string;
  bidan: { id: string; name: string; avatar: string | null; experience: string };
  user: { id: string; name: string; avatar: string | null; role: string };
  availability: { date: string; startTime: string; endTime: string };
}

export default function ChatPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [chatState, setChatState] = useState<"WAITING" | "ACTIVE" | "ENDED">("WAITING");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [bookRes, msgRes] = await Promise.all([
        fetch(`/api/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/messages/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const bookData = await bookRes.json();
      const msgData = await msgRes.json();
      setBooking(bookData.booking);
      setMessages(msgData.messages || []);
    } catch {
      addToast("Gagal memuat chat", "error");
    } finally {
      setLoading(false);
    }
  }, [bookingId, token, addToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh messages every 8 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data.messages || []);
      } catch { /* ignore */ }
    }, 8000);
    return () => clearInterval(interval);
  }, [bookingId, token]);

  useEffect(() => {
    if (!booking) return;

    const checkState = () => {
      const now = new Date();
      const dateStr = new Date(booking.availability.date).toISOString().split("T")[0];
      const start = new Date(`${dateStr}T${booking.availability.startTime}:00`);
      const end = new Date(`${dateStr}T${booking.availability.endTime}:00`);

      if (now < start) {
        setChatState("WAITING");
      } else if (now >= start && now <= end) {
        setChatState("ACTIVE");
        const diff = end.getTime() - now.getTime();
        const mins = Math.floor(diff / 1000 / 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeRemaining(`${mins}:${secs.toString().padStart(2, "0")}`);
      } else {
        if (chatState === "ACTIVE") {
          setIsBottomSheetOpen(true);
        }
        setChatState("ENDED");
        setTimeRemaining("Selesai");
      }
    };

    checkState();
    const timer = setInterval(checkState, 1000);
    return () => clearInterval(timer);
  }, [booking, chatState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, previewImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("Ukuran gambar maksimal 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  async function sendMessage(e?: React.FormEvent, type: "TEXT" | "IMAGE" = "TEXT", imgUrl?: string) {
    if (e) e.preventDefault();
    if (chatState !== "ACTIVE") return;

    const payload = type === "TEXT" 
      ? { content: input.trim(), type: "TEXT" }
      : { imageUrl: imgUrl, type: "IMAGE" };

    if (type === "TEXT" && !input.trim()) return;
    
    setSending(true);
    if (type === "IMAGE") setUploading(true);

    try {
      const res = await fetch(`/api/messages/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        if (type === "TEXT") setInput("");
        if (type === "IMAGE") setPreviewImage(null);
      } else {
        addToast(data.error || "Gagal mengirim pesan", "error");
      }
    } catch {
      addToast("Terjadi kesalahan", "error");
    } finally {
      setSending(false);
      setUploading(false);
    }
  }

  const handleSendImage = () => {
    if (!previewImage) return;
    sendMessage(undefined, "IMAGE", previewImage);
  };

  const isActive = booking?.status === "CONFIRMED" && chatState === "ACTIVE";
  const isBidanRole = user?.role === "BIDAN";
  const partnerName = isBidanRole ? booking?.user.name : booking?.bidan.name;
  const partnerAvatar = isBidanRole ? booking?.user.avatar : booking?.bidan.avatar;

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <AuthGuard>
      <ToastContainer />
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="nav-bar" style={{ flexShrink: 0 }}>
          <button onClick={() => router.back()} className="nav-icon-btn">
            <ChevronLeft size={20} />
          </button>
          {booking && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "center" }}>
              <div style={{ position: "relative" }}>
                <Avatar name={partnerName} src={partnerAvatar} size={36} />
                {isActive && (
                  <div style={{
                    position: "absolute", bottom: -1, right: -1,
                    width: 12, height: 12, background: "var(--success)",
                    borderRadius: "50%", border: "2px solid var(--bg)"
                  }} />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {partnerName}
                </div>
                <div style={{ fontSize: "0.7rem", color: chatState === "ACTIVE" ? "#10B981" : "var(--text-muted)", fontWeight: 600 }}>
                  {chatState === "ACTIVE" ? "● Sedang berlangsung" : chatState === "ENDED" ? "Selesai" : "Mendatang"}
                </div>
              </div>
            </div>
          )}
          {chatState === "ACTIVE" && (
            <div style={{ 
              background: "rgba(16,185,129,0.1)", color: "#10B981", 
              padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5, marginRight: 10
            }}>
              <Clock size={12} />
              {timeRemaining}
            </div>
          )}
          <div style={{ width: 40 }} />
        </div>

        {/* Session info */}
        {booking && (
          <div style={{
            padding: "8px 20px", background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={14} color="var(--text-muted)" />
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                {new Date(booking.availability.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                {" "}• {booking.availability.startTime}–{booking.availability.endTime} WIB
              </span>
            </div>
            {chatState === "WAITING" && (
              <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 600 }}>Belum Dimulai</span>
            )}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 48, borderRadius: 18, width: "60%", alignSelf: i % 2 === 0 ? "flex-end" : "flex-start" }} />
              ))}
            </div>
          ) : chatState === "WAITING" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
              <div style={{ width: 80, height: 80, background: "rgba(166,193,204,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Clock size={40} color="var(--primary)" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: 8 }}>Konsultasi belum dimulai</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Kamu bisa mulai chat pada jadwal yang telah dipilih.<br/>
                <strong>{booking?.availability.startTime} WIB</strong>
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 40 }}>
              <div className="empty-icon">💬</div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Mulai percakapan</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textAlign: "center" }}>
                Sampaikan pertanyaan atau keluhan Anda kepada bidan.
              </p>
            </div>
          ) : (
            <>
              {/* Date separator */}
              <div style={{ textAlign: "center", margin: "8px 0" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-elevated)",
                  padding: "4px 12px", borderRadius: "var(--radius-full)" }}>
                  Konsultasi Dimulai
                </span>
              </div>
              {messages.map((msg) => {
                const isMine = msg.senderType === (isBidanRole ? "BIDAN" : "USER");
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                    {!isMine && (
                      <div style={{ marginBottom: 4, paddingLeft: 4 }}>
                        <Avatar name={partnerName} src={partnerAvatar} size={24} />
                      </div>
                    )}
                    
                    {msg.type === "IMAGE" ? (
                      <div 
                        onClick={() => setFullScreenImage(msg.imageUrl)}
                        style={{ 
                          maxWidth: "70%", borderRadius: 18, overflow: "hidden", 
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)", cursor: "pointer",
                          border: isMine ? "2px solid var(--primary)" : "2px solid white"
                        }}
                      >
                        <img src={msg.imageUrl || ""} alt="Sent image" style={{ width: "100%", display: "block" }} />
                      </div>
                    ) : (
                      <div className={`chat-bubble ${isMine ? "chat-bubble-user" : "chat-bubble-bidan"}`}>
                        {msg.content}
                      </div>
                    )}

                    <div className="chat-time" style={{ textAlign: isMine ? "right" : "left" }}>
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: "none" }} 
          accept="image/*"
        />

        {/* Image Preview Overlay */}
        {previewImage && (
          <div style={{ 
            padding: "16px 20px", background: "white", borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 15
          }}>
            <div style={{ position: "relative", width: 80, height: 80, borderRadius: 12, overflow: "hidden" }}>
              <img src={previewImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button 
                onClick={() => setPreviewImage(null)}
                style={{ 
                  position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.5)", 
                  borderRadius: "50%", border: "none", color: "white", padding: 4
                }}
              >
                <X size={12} />
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>Pratinjau Gambar</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Siap kirim ke bidan</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleSendImage}
              disabled={uploading}
              style={{ padding: "8px 20px" }}
            >
              {uploading ? "..." : "Kirim"}
            </button>
          </div>
        )}

        {/* Full Screen Image Overlay */}
        {fullScreenImage && (
          <div 
            onClick={() => setFullScreenImage(null)}
            style={{ 
              position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 20
            }}
          >
            <button style={{ position: "absolute", top: 40, right: 20, background: "none", border: "none", color: "white" }}>
              <X size={32} />
            </button>
            <img src={fullScreenImage} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        )}

        {/* Footer Bottom Sheet */}
        <BottomSheet 
          isOpen={isBottomSheetOpen} 
          onClose={() => setIsBottomSheetOpen(false)}
          title="Waktu konsultasi kamu sudah habis"
        >
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 24 }}>
              Kalau kamu mau lanjutkan konsultasimu, silakan jadwalkan ulang di waktu yang tersedia.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                className="btn btn-primary btn-full" 
                style={{ height: 50, gap: 8 }}
                onClick={() => router.push(`/bidans/${booking?.bidan.id}/booking`)}
              >
                Lanjut Jadwalkan <ArrowRight size={18} />
              </button>
              <button 
                className="btn btn-secondary btn-full" 
                style={{ height: 50 }}
                onClick={() => setIsBottomSheetOpen(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </BottomSheet>

        {/* Input */}
        {chatState === "ACTIVE" ? (
          <form onSubmit={(e) => sendMessage(e)} style={{
            padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
            background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(16px)",
            borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center", flexShrink: 0
          }}>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: 8, color: "var(--text-muted)", background: "none", border: "none" }}
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              className="form-input"
              placeholder="Tulis pesan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, borderRadius: "var(--radius-full)", padding: "10px 18px", fontSize: "0.95rem" }}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: input.trim() ? "var(--gradient-primary)" : "var(--bg-elevated)",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0,
                opacity: input.trim() ? 1 : 0.5
              }}
              id="send-msg-btn"
              aria-label="Kirim pesan"
            >
              <Send size={18} color="white" />
            </button>
          </form>
        ) : (
          <div style={{
            padding: "16px 20px calc(16px + env(safe-area-inset-bottom))", 
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--border)", textAlign: "center", flexShrink: 0
          }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {chatState === "ENDED" 
                ? "Sesi konsultasi telah berakhir" 
                : "Kamu bisa mulai chat saat sesi dimulai"}
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
