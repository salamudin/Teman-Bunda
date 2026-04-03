"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Save, User, Phone, Calendar, Baby } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import Avatar from "@/components/Avatar";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, token, updateUser } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    status: "",
    gestationalAge: "",
    age: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        status: user.status || "PROGRAM_HAMIL",
        gestationalAge: user.gestationalAge?.toString() || "",
        age: user.age?.toString() || "",
      });
      setAvatar(user.avatar || null);
    }
  }, [user]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      addToast("Ukuran foto maksimal 2MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          avatar
        }),
      });

      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        addToast("Profil berhasil diperbarui! ✨", "success");
        setTimeout(() => router.back(), 1500);
      } else {
        addToast(data.error || "Gagal memperbarui profil", "error");
      }
    } catch {
      addToast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <ToastContainer />
      <div className="page-no-pad">
        <div className="nav-bar">
          <button onClick={() => router.back()} className="nav-icon-btn"><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 700 }}>Edit Profil</span>
          <div style={{ width: 40 }} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 20px 100px" }}>
          {/* Avatar Section */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            <div style={{ position: "relative" }}>
              <Avatar name={formData.name} src={avatar} size={100} />
              <label 
                htmlFor="avatar-upload" 
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--primary)", border: "3px solid white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "var(--shadow-sm)"
                }}
              >
                <Camera size={16} color="white" />
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 12 }}>Ketuk ikon kamera untuk ubah foto</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Name */}
            <div className="input-group">
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>
                <User size={14} /> Nama Lengkap
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama Anda"
                required
              />
            </div>

            {/* Phone */}
            <div className="input-group">
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>
                <Phone size={14} /> Nomor WhatsApp
              </label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 08123456789"
              />
            </div>

            {/* Age */}
            <div className="input-group">
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>
                <Calendar size={14} /> Usia (Tahun)
              </label>
              <input
                type="number"
                className="input-field"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Masukkan usia Anda"
              />
            </div>

            {/* Status */}
            <div className="input-group">
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>
                <Baby size={14} /> Status Bunda
              </label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ appearance: "none", background: "var(--bg-elevated) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") no-repeat right 12px center", backgroundSize: "16px" }}
              >
                <option value="PROGRAM_HAMIL">Program Hamil</option>
                <option value="HAMIL">Sedang Hamil</option>
                <option value="MENYUSUI">Menyusui</option>
              </select>
            </div>

            {/* Gestational Age */}
            {formData.status === "HAMIL" && (
              <div className="input-group animate-fade-in">
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>
                  <Baby size={14} /> Usia Kehamilan (Minggu)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.gestationalAge}
                  onChange={(e) => setFormData({ ...formData, gestationalAge: e.target.value })}
                  placeholder="Contoh: 24"
                  min="1"
                  max="42"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full shadow-primary"
            disabled={loading}
            style={{ marginTop: 40, height: 54, fontSize: "1rem" }}
          >
            <Save size={18} style={{ marginRight: 8 }} />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
