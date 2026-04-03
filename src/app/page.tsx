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
      <h1 className="splash-text" style={{ fontSize: "2.5rem", marginBottom: 8 }}>Teman Bunda</h1>
      <p style={{ 
        color: "#02394E", 
        fontSize: "1rem", 
        fontWeight: 600, 
        letterSpacing: "0.1em",
        opacity: 0.9,
        textTransform: "uppercase"
      }}>
        Konsultasi Bidan Profesional
      </p>

      <div style={{ 
        position: "absolute", bottom: 60, width: "100%", 
        display: "flex", justifyContent: "center" 
      }}>
        <div className="loading-spinner" style={{ borderTopColor: "#02394E", width: 24, height: 24 }} />
      </div>
    </div>
  );
}
