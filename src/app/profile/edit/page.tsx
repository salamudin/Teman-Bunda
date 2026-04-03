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
          <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Edit Profil</span>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ padding: "24px 20px 100px" }}>
          <form onSubmit={handleSubmit} className="card shadow-md" style={{ border: "none" }}>
            {/* Avatar Section */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
              <div style={{ position: "relative" }}>
                <div style={{ padding: 4, background: "white", borderRadius: "50%", boxShadow: "var(--shadow-sm)" }}>
                  <Avatar name={formData.name} src={avatar} size={100} />
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  style={{
                    position: "absolute", bottom: 4, right: 4,
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--primary)", border: "2px solid white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "var(--shadow-md)"
                  }}
                >
                  <Camera size={16} color="white" />
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </label>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 12, fontWeight: 500 }}>
                Ketuk ikon kamera untuk ubah foto
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">
                  <User size={14} style={{ marginRight: 6, display: "inline" }} /> Nama Lengkap
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} style={{ marginRight: 6, display: "inline" }} /> Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                {/* Age */}
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">
                    <Calendar size={14} style={{ marginRight: 6, display: "inline" }} /> Usia
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Tahun"
                  />
                </div>

                {/* Gestational Age */}
                {formData.status === "HAMIL" && (
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">
                      <Baby size={14} style={{ marginRight: 6, display: "inline" }} /> Minggu
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.gestationalAge}
                      onChange={(e) => setFormData({ ...formData, gestationalAge: e.target.value })}
                      placeholder="Contoh: 24"
                      min="1"
                      max="42"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">
                  <Baby size={14} style={{ marginRight: 6, display: "inline" }} /> Status Bunda
                </label>
                <select
                  className="form-input form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PROGRAM_HAMIL">Program Hamil</option>
                  <option value="HAMIL">Sedang Hamil</option>
                  <option value="MENYUSUI">Menyusui</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full shadow-primary"
              disabled={loading}
              style={{ marginTop: 24, padding: "16px" }}
            >
              <Save size={18} />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 32 }}>
            Data Anda tersimpan aman dan terenkripsi.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
