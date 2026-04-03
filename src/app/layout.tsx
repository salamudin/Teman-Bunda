import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TemanBunda – Konsultasi Bidan Online",
  description: "Platform konsultasi bidan profesional untuk program hamil, kehamilan, dan menyusui. Booking sesi konsultasi kapan saja, di mana saja.",
  keywords: "konsultasi bidan, program hamil, bidan online, konsultasi menyusui, ASI, kehamilan",
  openGraph: {
    title: "TemanBunda – Konsultasi Bidan Online",
    description: "Platform konsultasi bidan profesional untuk program hamil, kehamilan, dan menyusui.",
    type: "website",
    locale: "id_ID",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#A6C1CC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
