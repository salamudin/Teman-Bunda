"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender && !isOpen) return null;

  return (
    <div 
      className={`bottom-sheet-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div 
        className="bottom-sheet-container"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <button 
          onClick={onClose} 
          aria-label="Close"
          style={{ 
            position: "absolute", right: 12, top: 12,
            background: "none", border: "none", color: "var(--text-muted)", 
            padding: 8, cursor: "pointer", display: "flex", borderRadius: "50%",
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>
        
        <div style={{ paddingTop: 20 }}>
          {title && (
            <h3 style={{ 
              fontSize: "1.25rem", 
              fontWeight: 850, 
              color: "var(--text-primary)",
              textAlign: "center",
              marginBottom: 16,
              padding: "0 32px",
              lineHeight: 1.3
            }}>
              {title}
            </h3>
          )}

          <div style={{ textAlign: "center" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
