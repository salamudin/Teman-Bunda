"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Send, Clock } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import Avatar from "@/components/Avatar";
import ToastContainer from "@/components/ToastContainer";

interface Message {
  id: string;
  content: string;
  senderType: "USER" | "BIDAN";
  senderId: string;
  createdAt: string;
}

interface Booking {
  id: string;
  status: string;
  bidan: { id: string; name: string; avatar: string | null };
  user: { id: string; name: string; avatar: string | null };
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
  const bottomRef = useRef<HTMLDivElement>(null);

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: input.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setInput("");
      } else {
        addToast(data.error || "Gagal mengirim pesan", "error");
      }
    } catch {
      addToast("Terjadi kesalahan", "error");
    } finally {
      setSending(false);
    }
  }

  const isActive = booking?.status === "CONFIRMED";
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
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{partnerName}</div>
                <div style={{ fontSize: "0.7rem", color: isActive ? "#34D399" : "var(--text-muted)" }}>
                  {isActive ? "● Online" : "Offline"}
                </div>
              </div>
            </div>
          )}
          <div style={{ width: 40 }} />
        </div>

        {/* Session info */}
        {booking && (
          <div style={{
            padding: "8px 20px", background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border)", flexShrink: 0,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <Clock size={14} color="var(--text-muted)" />
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Sesi: {new Date(booking.availability.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
              {" "}• {booking.availability.startTime}–{booking.availability.endTime} WIB
            </span>
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
          ) : messages.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 40 }}>
              <div className="empty-icon">💬</div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Mulai percakapan</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textAlign: "center" }}>
                {isActive ? "Sampaikan pertanyaan atau keluhan Anda kepada bidan." : "Sesi belum aktif atau sudah selesai."}
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
                    <div className={`chat-bubble ${isMine ? "chat-bubble-user" : "chat-bubble-bidan"}`}>
                      {msg.content}
                    </div>
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

        {/* Input */}
        {isActive ? (
          <form onSubmit={sendMessage} style={{
            padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
            background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(16px)",
            borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center", flexShrink: 0
          }}>
            <Avatar name={user?.name} size={36} />
            <input
              type="text"
              className="form-input"
              placeholder="Tulis pesan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, borderRadius: "var(--radius-full)", padding: "10px 18px" }}
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
            padding: "14px 20px", background: "var(--bg-elevated)",
            borderTop: "1px solid var(--border)", textAlign: "center", flexShrink: 0
          }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {booking?.status === "COMPLETED" ? "Sesi konsultasi telah selesai" : "Sesi belum dikonfirmasi"}
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
