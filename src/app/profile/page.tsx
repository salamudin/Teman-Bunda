"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronRight, User, Bell, Shield, HelpCircle, ExternalLink } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import BottomBar from "@/components/BottomBar";
import AuthGuard from "@/components/AuthGuard";
import Avatar from "@/components/Avatar";
import ToastContainer from "@/components/ToastContainer";
import BottomSheet from "@/components/BottomSheet";

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

  function handleLogout() {
    logout();
    addToast("Sampai jumpa! 👋", "info");
    router.push("/login");
  }

  const MENU_ITEMS = [
    { icon: User, label: "Edit Profil", sublabel: "Perbarui data diri", href: "/profile/edit" },
    { icon: Bell, label: "Notifikasi", sublabel: "Kelola notifikasi", href: "/notifications" },
    { icon: Shield, label: "Privasi & Keamanan", sublabel: "Ubah password", href: "#" },
    { icon: HelpCircle, label: "Bantuan", sublabel: "FAQ & hubungi kami", href: "#" },
  ];

  return (
    <AuthGuard>
      <ToastContainer />
      <div className="page-no-pad">
        <div className="nav-bar">
          <div className="nav-logo">Profil</div>
        </div>

        <div style={{ padding: "24px 20px 100px" }}>
          {/* Profile card */}
          <div style={{
            background: "#A6C1CC",
            borderRadius: "var(--radius-xl)", padding: 24,
            border: "1px solid rgba(0,0,0,0.05)", marginBottom: 24,
            boxShadow: "var(--shadow-md)"
          }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Avatar name={user?.name} src={user?.avatar} size={72} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4, color: "#000000" }}>{user?.name}</h2>
                <p style={{ fontSize: "0.85rem", color: "#3D444F", fontWeight: 500, marginBottom: 10 }}>{user?.email}</p>
                <span style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)",
                  borderRadius: "var(--radius-full)", padding: "4px 12px",
                  fontSize: "0.75rem", fontWeight: 700, color: "#3D444F"
                }}>
                  {STATUS_LABELS[user?.status || "PROGRAM_HAMIL"] || user?.status}
                </span>
              </div>
            </div>

            {user?.gestationalAge && (
              <div style={{
                marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex", gap: 20
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#000000" }}>
                    {user.gestationalAge}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#3D444F", fontWeight: 600 }}>Minggu</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)" }}>
                    {40 - user.gestationalAge}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#3D444F", fontWeight: 600 }}>Sisa Minggu</div>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <div style={{ width: "100%", height: 8, background: "rgba(0,0,0,0.1)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", background: "var(--primary)",
                      width: `${(user.gestationalAge / 40) * 100}%`, borderRadius: 4
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menu items */}
          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
            {MENU_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => item.href !== "#" ? router.push(item.href) : addToast("Segera hadir!", "info")}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px", background: "none", border: "none",
                    borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid var(--border)" : "none",
                    cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                    color: "var(--text-primary)"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-glass)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
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

          {/* Admin link if admin */}
          {user?.role === "ADMIN" && (
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

          <BottomSheet 
            isOpen={showLogout} 
            onClose={() => setShowLogout(false)}
            title="Keluar dari TemanBunda?"
          >
            <div style={{ textAlign: "center", paddingBottom: 20 }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: "50%", background: "#FEE2E2", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                margin: "0 auto 16px" 
              }}>
                <LogOut size={32} color="#EF4444" />
              </div>
              <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: "0.95rem" }}>
                Anda perlu login kembali untuk mengakses jadwal dan chat dengan bidan.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: "var(--secondary-light)", color: "var(--text-primary)", fontWeight: 600 }} 
                  onClick={() => setShowLogout(false)}
                >
                  Batal
                </button>
                <button
                  className="btn"
                  style={{ 
                    flex: 1, 
                    background: "#EF4444", 
                    color: "white", 
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
                  }}
                  onClick={handleLogout}
                  id="confirm-logout-btn"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </BottomSheet>

          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 24 }}>
            TemanBunda v1.0 • © 2026 All rights reserved
          </p>
        </div>

        <BottomBar />
      </div>
    </AuthGuard>
  );
}
