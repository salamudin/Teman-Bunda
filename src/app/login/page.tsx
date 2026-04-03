"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Heart, Baby } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import ToastContainer from "@/components/ToastContainer";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const addToast = useUIStore((s) => s.addToast);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal");
      } else {
        login(data.user, data.token);
        addToast(`Selamat datang, ${data.user.name}! 👋`, "success");
        router.push("/home");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastContainer />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Hero */}
        <div className="hero" style={{ paddingTop: 60 }}>
          <div className="animate-float" style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 80, height: 80, background: "white",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Heart size={36} color="#A6C1CC" fill="#A6C1CC" />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", fontWeight: 800, marginBottom: 8, color: "#000000" }}>
              TemanBunda
            </h1>
            <p style={{ color: "#3D444F", fontSize: "0.95rem", fontWeight: 500 }}>
              Konsultasi bidan profesional di genggamanmu
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: "32px 24px 40px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6, color: "#000000" }}>Masuk</h2>
          <p style={{ color: "#3D444F", fontSize: "0.9rem", marginBottom: 28, fontWeight: 500 }}>
            Belum punya akun?{" "}
            <Link href="/register" style={{ color: "#A6C1CC", fontWeight: 700 }}>Daftar sekarang</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  className="form-input"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 48 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                    display: "flex"
                  }}
                  aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              id="login-btn"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="glass-card" style={{ marginTop: 24, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Baby size={18} color="var(--primary-light)" />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary-light)" }}>Demo Akun</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
              <div>📧 admin@temanbunda.id</div>
              <div>🔒 admin123</div>
              <div style={{ marginTop: 6, color: "var(--text-muted)", fontSize: "0.75rem" }}>
                Jalankan seed dulu di: <code style={{ color: "var(--primary-light)" }}>POST /api/seed</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
