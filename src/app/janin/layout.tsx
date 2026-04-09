import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perkembangan Janin | ChatBidan – Tracker Kehamilan Minggu per Minggu",
  description:
    "Pantau perkembangan janin bayi Anda minggu per minggu. Ukuran, berat, perkembangan organ, dan tips kehamilan dari bidan berpengalaman. Gratis di ChatBidan.",
  keywords: [
    "perkembangan janin",
    "tracker kehamilan",
    "usia kehamilan",
    "janin minggu ke",
    "pertumbuhan bayi dalam kandungan",
    "teman bunda kehamilan",
    "konsultasi kehamilan",
    "chat bidan kehamilan",
  ],
  openGraph: {
    title: "Tracker Perkembangan Janin | ChatBidan",
    description:
      "Pantau tumbuh kembang janin Anda dari minggu ke minggu. Lengkap dengan tips dari bidan berpengalaman.",
    url: "https://chatbidan.com/janin",
    siteName: "ChatBidan by TemanBunda",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://chatbidan.com/janin",
  },
};

export default function JaninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
