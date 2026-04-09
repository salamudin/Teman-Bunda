import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk | ChatBidan – Login Konsultasi Bidan Online",
  description:
    "Masuk ke akun ChatBidan Anda dan mulai konsultasi dengan bidan terpercaya sekarang. Platform konsultasi kehamilan & menyusui No. 1 Indonesia.",
  keywords: [
    "login chatbidan",
    "masuk chat bidan",
    "konsultasi bidan login",
    "teman bunda masuk",
  ],
  openGraph: {
    title: "Masuk ke ChatBidan | Konsultasi Bidan Online",
    description:
      "Login dan mulai konsultasi dengan bidan berpengalaman. Kehamilan, menyusui, program hamil — semua ada di ChatBidan.",
    url: "https://chatbidan.com/login",
    siteName: "ChatBidan by TemanBunda",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://chatbidan.com/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
