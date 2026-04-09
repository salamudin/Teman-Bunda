"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ChevronRight, User, Bell, Shield, HelpCircle, ExternalLink, Calendar } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import BottomBar from "@/components/BottomBar";
import AuthGuard from "@/components/AuthGuard";
import Avatar from "@/components/Avatar";
import ToastContainer from "@/components/ToastContainer";
import BottomSheet from "@/components/BottomSheet";
import { getWeekInfo } from "@/lib/janinData";
import PageShell from "@/components/PageShell";

const STATUS_LABELS: Record<string, string> = {
  PROGRAM_HAMIL: "🌱 Program Hamil",
  HAMIL: "🤰 Sedang Hamil",
  MENYUSUI: "🤱 Menyusui",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const [showLogout, setShowLogout] = useState(false);
  const [fetalAge, setFetalAge] = useState<number | null>(null);

  useEffect(() => {
    if (user?.hpht) {
      const hphtDate = new Date(user.hpht);
      const today = new Date();
      const diffTime = today.getTime() - hphtDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setFetalAge(Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), 40));
    } else if (user?.gestationalAge) {
      setFetalAge(user.gestationalAge);
    }
  }, [user]);

  const fetalInfo = fetalAge !== null ? getWeekInfo(fetalAge) : null;

  function handleLogout() {
    logout();
    addToast("Sampai jumpa! 👋", "info");
    router.push("/login");
  }

  const MENU_ITEMS = [
    { icon: User, label: "Edit Profil", sublabel: "Perbarui data diri", href: "/profile/edit" },
    ...(user?.role === "BIDAN" ? [
      { icon: Calendar, label: "Kelola Jadwal", sublabel: "Atur waktu konsultasi", href: "/profile/availability" }
    ] : []),
    { icon: Bell, label: "Notifikasi", sublabel: "Kelola notifikasi", href: "/notifications" },
    { icon: Shield, label: "Privasi & Keamanan", sublabel: "Ubah password", href: "#" },
    { icon: HelpCircle, label: "Bantuan", sublabel: "FAQ & hubungi kami", href: "#" },
  ];

  return (
    <PageShell>
      <div className="page-no-pad">
        <ToastContainer />
        <div className="nav-bar">
          <div className="nav-logo">Profil</div>
        </div>

        <div style={{ padding: "24px 20px 100px" }}>
          {/* Profile card (Unified) */}
          <div style={{
            background: "#C0E0EC",
            borderRadius: "var(--radius-xl)", padding: 24,
            border: "1px solid rgba(0,0,0,0.05)", marginBottom: 24,
            boxShadow: "var(--shadow-md)"
          }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Avatar name={user?.name || "Bunda"} src={user?.avatar} size={72} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4, color: "#000000" }}>
                  {user ? user.name : "Belum Login"}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#3D444F", fontWeight: 500, marginBottom: 10 }}>
                  {user ? user.email : "Masuk untuk kelola profil"}
                </p>
                {user && (
                  <span style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)",
                    borderRadius: "var(--radius-full)", padding: "4px 12px",
                    fontSize: "0.75rem", fontWeight: 700, color: "#3D444F"
                  }}>
                    {STATUS_LABELS[user.status || "PROGRAM_HAMIL"] || user.status}
                  </span>
                )}
              </div>
            </div>

            {fetalAge && (
               <Link href="/janin" style={{ textDecoration: "none" }}>
                  <div style={{
                      marginTop: 16,
                      background: "#FBD5ED",
                      borderRadius: "var(--radius-lg)", padding: "16px",
                      display: "flex", alignItems: "center", gap: 12,
                      color: "#4A4A4A",
                      border: "none",
                      boxShadow: "0 8px 20px rgba(237, 84, 181, 0.05)"
                  }}>
                      <div style={{ fontSize: "2rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.05))" }}>
                          {fetalInfo?.emoji || "👶"}
                      </div>
                      <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.7rem", color: "#ED54B5", fontWeight: 700, marginBottom: 2 }}>
                              MINGGU {fetalAge} — {fetalInfo?.fruitAnalogy.toUpperCase()}
                          </div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#333" }}>
                              {fetalInfo?.description.slice(0, 45)}...
                          </div>
                      </div>
                      <div style={{ 
                          width: 32, height: 32, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "50%", 
                          display: "flex", alignItems: "center", justifyContent: "center", border: "none"
                      }}>
                          <ChevronRight size={16} color="#ED54B5" />
                      </div>
                  </div>
               </Link>
            )}
          </div>

          {/* Menu items */}
          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16, opacity: user ? 1 : 0.6 }}>
            {MENU_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  disabled={!user}
                  onClick={() => {
                    if (!user) return;
                    item.href !== "#" ? router.push(item.href) : addToast("Segera hadir!", "info");
                  }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px", background: "none", border: "none",
                    borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid var(--border)" : "none",
                    cursor: user ? "pointer" : "not-allowed", textAlign: "left", transition: "background 0.15s",
                    color: "var(--text-primary)"
                  }}
                  onMouseOver={(e) => user && (e.currentTarget.style.background = "var(--bg-glass)")}
                  onMouseOut={(e) => user && (e.currentTarget.style.background = "none")}
                  id={`profile-menu-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: "var(--radius-md)",
                    background: "rgba(166,193,204,0.15)", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Icon size={20} color="var(--primary-dark)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.label}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{item.sublabel}</div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </button>
              );
            })}
          </div>

          {/* Action Button: Login for Guest, Logout for User */}
          {!user ? (
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 12, padding: "16px", fontWeight: 700 }}
              onClick={() => router.push("/login")}
              id="guest-login-btn"
            >
              Masuk Sekarang
            </button>
          ) : (
            <>
              {/* Admin link if admin */}
              {user.role === "ADMIN" && (
                <button
                  className="btn btn-primary btn-full"
                  style={{ marginBottom: 16 }}
                  onClick={() => router.push("/admin")}
                  id="go-admin-btn"
                >
                  <ExternalLink size={16} style={{ marginRight: 8 }} /> Panel Admin
                </button>
              )}

              {/* Logout */}
              <button
                className="btn btn-full"
                style={{ 
                  marginTop: 12,
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  background: "#FEE2E2", 
                  color: "#EF4444", 
                  border: "1px solid #FECACA",
                  fontWeight: 700
                }}
                onClick={() => setShowLogout(true)}
                id="logout-btn"
              >
                <LogOut size={18} style={{ marginRight: 8 }} /> Keluar Akun
              </button>
            </>
          )}

          <BottomSheet 
            isOpen={showLogout} 
            onClose={() => setShowLogout(false)}
            title="Keluar Akun"
          >
            <div style={{ textAlign: "center", paddingBottom: 10 }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "0.95rem", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin keluar? Anda perlu masuk kembali untuk mengakses konsultasi.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button 
                  className="btn btn-primary btn-full" 
                  style={{ fontWeight: 700 }} 
                  onClick={() => setShowLogout(false)}
                >
                  Tidak
                </button>
                <button
                  className="btn"
                  style={{ 
                    width: "100%",
                    background: "none", 
                    color: "#EF4444", 
                    fontWeight: 600,
                    border: "none",
                    padding: "12px"
                  }}
                  onClick={handleLogout}
                  id="confirm-logout-btn"
                >
                  Iya, keluar
                </button>
              </div>
            </div>
          </BottomSheet>

          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 24 }}>
            ChatBidan v1.0 • © 2026 All rights reserved
          </p>
        </div>

        {!showLogout && <BottomBar />}
      </div>
    </PageShell>
  );
}
