"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import ToastContainer from "@/components/ToastContainer";

import { GoogleLogin } from "@react-oauth/google";

const STATUS_OPTIONS = [
  { value: "PROGRAM_HAMIL", label: "🌱 Program Hamil", desc: "Sedang merencanakan kehamilan" },
  { value: "HAMIL", label: "🤰 Sedang Hamil", desc: "Saat ini sedang hamil" },
  { value: "MENYUSUI", label: "🤱 Menyusui", desc: "Memiliki bayi & sedang menyusui" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated, hasHydrated } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    age: "", status: "PROGRAM_HAMIL", gestationalAge: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/home");
    }
  }, [hasHydrated, isAuthenticated, router]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registrasi gagal");
      } else {
        login(data.user, data.token);
        addToast("Akun berhasil dibuat! Selamat bergabung 🎉", "success");
        router.push("/home");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pendaftaran Google gagal");
      } else {
        login(data.user, data.token);
        addToast(`Akun berhasil dibuat! Selamat datang, ${data.user.name}! 🎉`, "success");
        router.push("/home");
      }
    } catch {
      setError("Terjadi kesalahan saat pendaftaran Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div style={{ minHeight: "100vh" }}>
        {/* Nav */}
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} className="btn-icon btn"
            style={{ background: "var(--bg-glass)", border: "1px solid var(--border)" }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#000000" }}>Buat Akun</h1>
            <p style={{ fontSize: "0.85rem", color: "#3D444F", fontWeight: 500 }}>
              Sudah punya akun? <Link href="/login" style={{ color: "#C0E0EC", fontWeight: 700 }}>Masuk</Link>
            </p>
          </div>
        </div>

        <div style={{ padding: "0 24px 40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nama Lengkap *</label>
              <input id="name" type="text" className="form-input" placeholder="Siti Rahayu"
                value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email *</label>
              <input id="reg-email" type="email" className="form-input" placeholder="nama@email.com"
                autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password *</label>
              <div style={{ position: "relative" }}>
                <input id="reg-password" type={showPw ? "text" : "password"} className="form-input"
                  placeholder="Minimal 6 karakter" autoComplete="new-password"
                  value={form.password} onChange={(e) => set("password", e.target.value)}
                  style={{ paddingRight: 48 }} required />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle password"
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">No. HP</label>
                <input id="phone" type="tel" className="form-input" placeholder="08xx"
                  value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="age">Usia</label>
                <input id="age" type="number" className="form-input" placeholder="25"
                  min="15" max="60" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
            </div>

            {/* Status selection */}
            <div className="form-group">
              <label className="form-label">Status *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STATUS_OPTIONS.map((opt) => (
                  <label key={opt.value} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    background: form.status === opt.value ? "rgba(166,193,204,0.2)" : "var(--bg-elevated)",
                    border: `1.5px solid ${form.status === opt.value ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.2s"
                  }}>
                    <input type="radio" name="status" value={opt.value} checked={form.status === opt.value}
                      onChange={(e) => set("status", e.target.value)} style={{ display: "none" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#000000" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.8rem", color: "#3D444F", marginTop: 2, fontWeight: 500 }}>{opt.desc}</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${form.status === opt.value ? "var(--primary)" : "var(--border-strong)"}`,
                      background: form.status === opt.value ? "var(--primary)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {form.status === opt.value && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {form.status === "HAMIL" && (
              <div className="form-group">
                <label className="form-label" htmlFor="gestAge">Usia Kehamilan (minggu)</label>
                <input id="gestAge" type="number" className="form-input" placeholder="mis. 20"
                  min="1" max="42" value={form.gestationalAge} onChange={(e) => set("gestationalAge", e.target.value)} />
                <p className="form-hint">Isi jika sudah mengetahui usia kehamilan</p>
              </div>
            )}

            {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

            <button type="submit" id="register-btn" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Membuat akun..." : "Buat Akun Sekarang →"}
            </button>

            <div style={{ display: "flex", alignItems: "center", margin: "24px 0", color: "#8E98A8" }}>
              <div style={{ flex: 1, height: 1, background: "#EAEAEA" }} />
              <span style={{ margin: "0 16px", fontSize: "0.85rem", fontWeight: 500 }}>atau daftar dengan</span>
              <div style={{ flex: 1, height: 1, background: "#EAEAEA" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Pendaftaran Google gagal. Coba lagi.")}
                useOneTap={false}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
