"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import lottie from "lottie-web";

export default function SplashPage() {
  const router = useRouter();
  const { token, user, hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const lottieRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Initialize Lottie animation
    if (lottieRef.current) {
      const anim = lottie.loadAnimation({
        container: lottieRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/splash-animation.json",
      });

      return () => anim.destroy();
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !hasHydrated) return;

        const timer = setTimeout(() => {
      router.push("/home");
    }, 1800); // 1.8 seconds splash

    return () => clearTimeout(timer);
  }, [token, user, router, mounted, hasHydrated]);

  if (!mounted) return null;

  return (
    <div className="splash-screen">
      {/* SEO text (Visually hidden for splash) */}
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        <h1>ChatBidan by TemanBunda - Konsultasi Bidan Online No. 1</h1>
        <h2>Bidan, Chat Bidan, Konsultasi Bidan, Tanya Bidan, Teman Bunda</h2>
        <p>Platform konsultasi bidan profesional online untuk program hamil, kehamilan, dan menyusui. Booking sesi konsultasi kapan saja, di mana saja.</p>
      </div>
      <div className="splash-lottie" ref={lottieRef} />
    </div>
  );
}
