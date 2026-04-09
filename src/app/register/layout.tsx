import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar & Mulai Konsultasi | ChatBidan – Teman Bunda Terpercaya",
  description:
    "Bergabung dengan ChatBidan sekarang. Daftarkan diri dan mulai konsultasi dengan bidan terpercaya untuk kehamilan, menyusui, dan kesehatan ibu & bayi.",
  keywords: [
    "daftar chatbidan",
    "konsultasi bidan gratis",
    "teman bunda",
    "bidan online daftar",
    "chat bidan daftar",
  ],
  openGraph: {
    title: "Daftar Sekarang | ChatBidan",
    description:
      "Bergabung gratis dan mulai konsultasi dengan bidan terpercaya kapan saja, di mana saja.",
    url: "https://chatbidan.com/register",
    siteName: "ChatBidan by TemanBunda",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://chatbidan.com/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
