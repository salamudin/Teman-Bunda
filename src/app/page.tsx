"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function SplashPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      if (token && user) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [token, user, router]);

  if (!mounted) return null;

  return (
    <div className="splash-screen">
      {/* Ratio 35 of screen device for the content box */}
      <div className="splash-logo" style={{ width: '35vw', height: '35vw' }}>
        <img 
          src="/favicon.ico" 
          alt="TemanBunda Logo" 
          style={{ width: '60%', height: '60%', objectFit: 'contain' }} 
        />
      </div>
      <h1 className="splash-text">TemanBunda</h1>
      <p style={{ 
        color: "#02394E", 
        marginTop: 12, 
        fontSize: "0.85rem", 
        fontWeight: 600, 
        letterSpacing: "0.05em",
        opacity: 0.8
      }}>
        Konsultasi Bidan Profesional
      </p>

      <div style={{ 
        position: "absolute", bottom: 40, width: "100%", 
        display: "flex", justifyContent: "center" 
      }}>
        <div className="loading-spinner" style={{ borderTopColor: "#02394E" }} />
      </div>
    </div>
  );
}
