"use client";
import { useUIStore } from "@/lib/store";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" && <CheckCircle size={18} />}
          {t.type === "error" && <XCircle size={18} />}
          {t.type === "info" && <Info size={18} />}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
