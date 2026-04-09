import type { Metadata } from "next";
import "./globals.css";
import GoogleProviderWrapper from "@/components/GoogleProviderWrapper";
import ClientShell from "@/components/ClientShell";

export const metadata: Metadata = {
  title: {
    default: "Chat Bidan & Konsultasi Bidan Online No. 1 | Tanya Bidan by TemanBunda",
    template: "%s | ChatBidan",
  },
  description: "Layanan Chat Bidan & Konsultasi Bidan Online terpercaya 24 jam. Tanya bidan profesional mengenai promil, kehamilan, dan menyusui melalui fitur ChatBidan by TemanBunda.",
  keywords: ["chat bidan", "bidan", "konsultasi bidan", "tanya bidan", "bidan online", "teman bunda", "konsultasi kehamilan online", "program hamil", "menyusui", "chatbidan", "temanbunda"],
  authors: [{ name: "TemanBunda Team" }],
  creator: "TemanBunda",
  publisher: "TemanBunda",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://chatbidan.com"),
  alternates: {
    canonical: "https://chatbidan.com",
    languages: {
      "id-ID": "https://chatbidan.com",
    },
  },
  verification: {
    google: "DRUW6c3zUgwDmrLvoRG_9j3T7XYiVt2f52iac89GNoU",
  },
  openGraph: {
    title: "ChatBidan by TemanBunda – Konsultasi Bidan Online No. 1",
    description: "Platform konsultasi bidan profesional untuk program hamil, kehamilan, dan menyusui. Booking sesi konsultasi kapan saja, di mana saja.",
    url: "https://chatbidan.com",
    siteName: "ChatBidan by TemanBunda",
    images: [
      {
        url: "https://chatbidan.com/logo-horizontal.png",
        width: 1200,
        height: 630,
        alt: "ChatBidan by TemanBunda – Konsultasi Bidan Online",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatBidan by TemanBunda – Konsultasi Bidan Online No. 1",
    description: "Tanya bidan profesional melalui chat. ChatBidan (TemanBunda) memberikan layanan konsultasi kehamilan & menyusui.",
    images: ["https://chatbidan.com/logo-horizontal.png"],
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#C0E0EC",
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
        <script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-YOUR-SANDBOX-KEY"}
          defer 
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>

      <body>
        <GoogleProviderWrapper>
          <ClientShell>
            {children}
          </ClientShell>
        </GoogleProviderWrapper>


        {/* SEO - JSON-LD: WebSite Schema (enables Google Sitelinks Searchbox) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ChatBidan by TemanBunda",
              "alternateName": ["ChatBidan", "TemanBunda", "Teman Bunda"],
              "url": "https://chatbidan.com",
              "description": "Platform konsultasi bidan profesional untuk kehamilan, menyusui, dan program hamil. Chat bidan terpercaya kapan saja.",
              "inLanguage": "id-ID",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://chatbidan.com/bidans?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />

        {/* SEO - JSON-LD: Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ChatBidan by TemanBunda",
              "alternateName": "TemanBunda",
              "url": "https://chatbidan.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://chatbidan.com/logo-vertical.png",
                "width": 500,
                "height": 500
              },
              "sameAs": [
                "https://chatbidan.com",
                "https://chatbidan.id"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "areaServed": "ID",
                "availableLanguage": "Indonesian"
              }
            }),
          }}
        />

        {/* SEO - JSON-LD: Medical Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "name": "ChatBidan by TemanBunda",
              "url": "https://chatbidan.com",
              "image": "https://chatbidan.com/logo-horizontal.png",
              "description": "Platform konsultasi bidan profesional online untuk program hamil, kehamilan, dan menyusui. Chat bidan terpercaya kapan saja, di mana saja.",
              "medicalSpecialty": "Midwifery",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Jakarta",
                "addressCountry": "ID"
              },
              "availableService": [
                {
                  "@type": "MedicalTherapy",
                  "name": "Konsultasi Kehamilan Online"
                },
                {
                  "@type": "MedicalTherapy",
                  "name": "Konsultasi Menyusui & ASI"
                },
                {
                  "@type": "MedicalTherapy",
                  "name": "Program Hamil"
                },
                {
                  "@type": "MedicalTherapy",
                  "name": "Chat Bidan Online"
                },
                {
                  "@type": "MedicalTherapy",
                  "name": "Tanya Bidan Online"
                }
              ]
            }),
          }}
        />

        {/* SEO - JSON-LD: FAQ Schema for Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Di mana saya bisa tanya bidan online?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Anda bisa tanya bidan online melalui platform ChatBidan (TemanBunda). Kami menyediakan akses langsung ke bidan profesional untuk konsultasi kehamilan, promil, dan menyusui."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Siapa saja yang bisa menggunakan layanan Chat Bidan?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Layanan Chat Bidan diperuntukkan bagi ibu hamil, ibu menyusui, atau pasangan yang sedang merencanakan kehamilan (program hamil)."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Bagaimana cara melakukan konsultasi bidan di ChatBidan?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Untuk melakukan konsultasi, Bunda cukup mendaftar di ChatBidan, pilih bidan spesialis yang Bunda butuhkan, dan tentukan jadwal untuk mulai sesi chat atau konsultasi."
                  }
                }
              ]
            }),
          }}
        />
      </body>
    </html>
  );
}
