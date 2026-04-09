"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import ToastContainer from "@/components/ToastContainer";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, hasHydrated } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/home");
    }
  }, [hasHydrated, isAuthenticated, router]);

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
        setError(data.error || "Login Google gagal");
      } else {
        login(data.user, data.token);
        addToast(`Selamat datang, ${data.user.name}! 👋`, "success");
        router.push("/home");
      }
    } catch {
      setError("Terjadi kesalahan saat login Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Hero with horizontal logo */}
        <div style={{ paddingTop: 60, paddingBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src="/logo-horizontal.png"
              alt="ChatBidan"
              width={300}
              height={100}
              style={{ width: "30%", height: "auto", objectFit: "contain" }}
              priority
            />
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: "20px 24px 40px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8, color: "#000000", textAlign: "center" }}>Masuk untuk Mulai Konsultasi</h2>
          <p style={{ color: "#3D444F", fontSize: "0.95rem", marginBottom: 28, fontWeight: 500, lineHeight: 1.5, textAlign: "center" }}>
            Dukungan bidan terpercaya, kapan pun kamu butuh.
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
              style={{ marginBottom: 16 }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <div style={{ display: "flex", alignItems: "center", margin: "24px 0", color: "#8E98A8" }}>
              <div style={{ flex: 1, height: 1, background: "#EAEAEA" }} />
              <span style={{ margin: "0 16px", fontSize: "0.85rem", fontWeight: 500 }}>atau masuk dengan</span>
              <div style={{ flex: 1, height: 1, background: "#EAEAEA" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login gagal. Coba lagi.")}
                useOneTap
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            </div>
            
            <p style={{ color: "#3D444F", fontSize: "0.95rem", textAlign: "center", fontWeight: 500 }}>
              Belum punya akun?{" "}
              <Link href="/register" style={{ color: "#C0E0EC", fontWeight: 700 }}>Daftar sekarang</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
