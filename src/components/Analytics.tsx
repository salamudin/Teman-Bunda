"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, Suspense } from "react";
import { GA_MEASUREMENT_ID, pageview } from "@/lib/gtag";

// ─────────────────────────────────────────────
// Inner component (needs useSearchParams inside Suspense)
// ─────────────────────────────────────────────
function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    pageview(url);
  }, [pathname, searchParams]);

  // Auto-track all button and link clicks globally
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest("button, a, [role='button']");

      if (interactiveEl && window.gtag) {
        const text = interactiveEl.textContent?.trim().replace(/\s+/g, " ").slice(0, 100) || "Unknown";
        const tag = interactiveEl.tagName.toLowerCase();
        const id = interactiveEl.id || undefined;
        const href = (interactiveEl as HTMLAnchorElement).href || undefined;

        // Categorize the click type
        let category = "Button Click";
        if (tag === "a") category = "Link Click";
        if (interactiveEl.getAttribute("role") === "button") category = "Button Click";

        window.gtag("event", tag === "a" ? "link_click" : "button_click", {
          event_category: category,
          event_label: text,
          element_id: id,
          destination_url: href,
          page_path: pathname,
        });
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [pathname]);

  return null;
}

// ─────────────────────────────────────────────
// Main exported component – add to root layout
// ─────────────────────────────────────────────
export default function Analytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* Load GA script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      {/* Initialize GA */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `,
        }}
      />

      {/* Route-change tracker wrapped in Suspense (required by Next.js for useSearchParams) */}
      <Suspense fallback={null}>
        <AnalyticsInner />
      </Suspense>
    </>
  );
}
