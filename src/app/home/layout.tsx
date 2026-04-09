import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda | ChatBidan – Konsultasi Bidan Online Terpercaya",
  description:
    "Selamat datang di ChatBidan. Konsultasi langsung dengan bidan berpengalaman untuk kehamilan, menyusui, dan kesehatan ibu & bayi. Tersedia 24 jam.",
  keywords: [
    "chat bidan",
    "konsultasi bidan online",
    "tanya bidan",
    "bidan online",
    "teman bunda",
    "kesehatan ibu hamil",
    "konsultasi kehamilan",
    "bidan terpercaya",
    "chatbidan",
  ],
  openGraph: {
    title: "ChatBidan – Konsultasi Bidan Online Terpercaya",
    description:
      "Chat langsung dengan bidan berpengalaman kapan pun Anda butuh. Aman, cepat, dan terpercaya.",
    url: "https://chatbidan.com/home",
    siteName: "ChatBidan by TemanBunda",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://chatbidan.com/home",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
