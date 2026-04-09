import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Bidan | ChatBidan – Pilih Bidan Terpercaya untuk Konsultasi",
  description:
    "Temukan bidan terbaik di ChatBidan. Konsultasi masalah kehamilan, menyusui, program hamil, dan kesehatan ibu bersama bidan berpengalaman. Book sekarang!",
  keywords: [
    "daftar bidan online",
    "bidan terpercaya",
    "konsultasi bidan",
    "chat bidan",
    "bidan kehamilan",
    "bidan menyusui",
    "bidan program hamil",
    "tanya bidan online",
    "bidan teman bunda",
  ],
  openGraph: {
    title: "Daftar Bidan Terpercaya | ChatBidan",
    description:
      "Pilih bidan terbaik dari daftar bidan tersertifikasi kami. Konsultasi online kapan saja, di mana saja.",
    url: "https://chatbidan.com/bidans",
    siteName: "ChatBidan by TemanBunda",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://chatbidan.com/bidans",
  },
};

export default function BidansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
