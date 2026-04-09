"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Exclude landing page (often '/' or '/landingpage')
  const isLanding = pathname === "/" || pathname?.startsWith("/landingpage");

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell" style={{
      maxWidth: "480px",
      margin: "0 auto",
      minHeight: "100vh",
      background: "#FFFFFF",
      boxShadow: "0 0 40px rgba(0,0,0,0.05)",
      position: "relative"
    }}>
      {children}
    </div>
  );
}
