import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, Clock, ShieldCheck, CheckCircle2, Star, HelpCircle } from "lucide-react";

// --- SEO Data configuration ---
type SeoData = {
  title: string;
  headline: string;
  description: string;
  problem: { title: string; desc: string };
  faq: { q: string; a: string }[];
};

const seoDataMap: Record<string, SeoData> = {
  "tanya-bidan": {
    title: "Tanya Bidan Online, Cepat & Terpercaya - ChatBidan",
    headline: "Tanya Bidan Online, Cepat & Terpercaya",
    description: "Bingung dengan keluhan kehamilan? Tanya bidan online sekarang di ChatBidan dan dapatkan solusi cepat, akurat, dan privasi terjamin.",
    problem: {
      title: "Butuh jawaban cepat dari bidan profesional?",
      desc: "Menunggu antrean di klinik atau mencari informasi di forum internet seringkali memakan waktu dan kurang terpercaya. Di ChatBidan, tanya bidan bisa langsung dilakukan melalui ponsel Anda dalam hitungan menit."
    },
    faq: [
      { q: "Apa itu tanya bidan online?", a: "Tanya bidan online adalah layanan konsultasi berbasis chat yang memungkinkan Bunda bertanya langsung dengan bidan berlisensi tanpa harus pergi ke klinik." },
      { q: "Kapan sebaiknya tanya ke bidan?", a: "Kapan pun Bunda mengalami keluhan kehamilan, ingin merencanakan kehamilan, atau ada pertanyaan seputar kesehatan ibu dan anal. Kami selalu siap sedia 24/7." },
      { q: "Apakah tanya bidan online di ChatBidan aman?", a: "Sangat aman. Semua percakapan dilindungi dengan enkripsi tingkat tinggi dan data medis Bunda dijamin kerahasiaannya." }
    ]
  },
  "konsultasi-bidan": {
    title: "Konsultasi Bidan Profesional 24 Jam - ChatBidan",
    headline: "Konsultasi Bidan 24 Jam Dari Rumah",
    description: "Nikmati kemudahan konsultasi bidan online kapan saja. Dapatkan saran medis terpercaya untuk masa kehamilan hingga menyusui tanpa harus antre.",
    problem: {
      title: "Cemas dengan kondisi saat ini, tapi sulit ke luar rumah?",
      desc: "Tidak semua kekhawatiran mengharuskan Bunda repot keluar rumah. Melalui layanan konsultasi bidan kami, Bunda mendapatkan pendampingan ahli secara real-time yang bisa diandalkan kapanpun dibutuhkan."
    },
    faq: [
      { q: "Berapa biaya konsultasi bidan di sini?", a: "Bunda dapat mulai konsultasi secara gratis untuk sesi awal, dan kami menyediakan paket berlangganan terjangkau untuk pemantauan berkelanjutan." },
      { q: "Siapa bidan yang akan menangani saya?", a: "Kami hanya bekerja sama dengan bidan bersertifikat resmi (STR) dan berpengalaman minimal 5 tahun dalam pelayanan kebidanan." },
      { q: "Apakah bisa booking konsultasi bidan terjadwal?", a: "Tentu bisa! Bunda dapat memilih jadwal bidan favorit Bunda untuk konsultasi lebih mendalam dan terfokus." }
    ]
  },
  "konsultasi-kehamilan": {
    title: "Konsultasi Kehamilan Online Terpercaya - ChatBidan",
    headline: "Konsultasi Kehamilan Aman, Tenang & Percaya Diri",
    description: "Pantau perkembangan janin dan diskusikan segala gejala kandungan dengan bidan berpengalaman. Konsultasi kehamilan online nomor 1 di Indonesia.",
    problem: {
      title: "Banyak kekhawatiran selama trimester awal hingga akhir?",
      desc: "Mulai dari morning sickness, pola makan yang tepat, hingga kekhawatiran jelang persalinan. Dapatkan jawaban pasti untuk konsultasi kehamilan dari ahli, bukan sekedar menebak dari internet."
    },
    faq: [
      { q: "Apa saja keluhan kehamilan yang bisa dikonsultasikan?", a: "Mual muntah, nyeri panggul, nutrisi janin, hingga persiapan persalinan. Bidan kami ahli menangani seluruh fase kehamilan." },
      { q: "Bagaimana cara membaca perkembangan janin?", a: "Selain lewat konsultasi kehamilan, platform kami memiliki fitur tracker janin agar Bunda lebih mudah memantau tumbuh kembang si kecil minggu demi minggu." },
      { q: "Apa konsultasi ini menggantikan kunjungan ke dokter kandungan?", a: "Konsultasi ChatBidan berfungsi sebagai pendamping harian dan pertolongan pertama, namun tetap disarankan melakukan USG dan kontrol rutin secara offline sesuai arahan bidan kami." }
    ]
  },
  "konsultasi-nifas": {
    title: "Konsultasi Masa Nifas & Pemulihan Pasca Persalinan - ChatBidan",
    headline: "Pendampingan Masa Nifas yang Menenangkan",
    description: "Dapatkan bimbingan pemulihan luka jahitan, baby blues, dan perawatan pasca melahirkan lewat konsultasi nifas yang privat dan empatik.",
    problem: {
      title: "Merasakan lelah, bingung, atau perubahan emosi pasca melahirkan?",
      desc: "Masa nifas adalah waktu yang rentan bagi seorang ibu. Perawatan luka persalinan yang salah gizi atau emosi yang tidak stabil membutuhkan dukungan tenaga medis empatik yang siap mendengarkan."
    },
    faq: [
      { q: "Berapa lama masa nifas berlangsung?", a: "Secara umum masa nifas (puerperium) berlangsung sekitar 40 hari (6 minggu), proses fisiologis tubuh kembali ke keadaan sebelum hamil." },
      { q: "Apa saja yang dibahas dalam konsultasi nifas?", a: "Bunda bisa bertanya seputar pemulihan luka jahitan, pola makan, baby blues, higienitas kewanitaan, hingga adaptasi mengasuh bayi baru lahir." },
      { q: "Apakah saya bisa mendapatkan pendampingan psikologis?", a: "Bidan kami dilatih untuk membantu memberikan dukungan emosional ibu. Jika menemukan indikasi Postpartum Depression (PPD) berlanjut, bidan akan segera merekomendasikan layanan psikologi lanjutan." }
    ]
  },
  "konsultasi-menyusui": {
    title: "Konsultasi Menyusui & Laktasi Bersama Ahli - ChatBidan",
    headline: "Atasi Tantangan Menyusui Lebih Mudah",
    description: "Konsultasi menyusui mulai dari pelekatan yang benar, ASI seret, hingga mastitis bersama bidan laktasi terbaik dari kenyamanan rumah Anda.",
    problem: {
      title: "Puting lecet, ASI kurang, atau bayi bingung puting?",
      desc: "Menyusui adalah proses alami, namun bukan berarti tanpa kendala. 80% ibu mengalami kesulitan di awal masa menyusui. Bidan laktasi ChatBidan siap memastikan perjalanan mengASIhi Bunda lancar."
    },
    faq: [
      { q: "Bagaimana cara melakukan konsultasi menyusui secara online?", a: "Bunda dapat mendeskripsikan kendala yang dialami, serta mengirimkan foto atau mendiskusikan siklus jam menyusui secara privat dengan bidan laktasi kami." },
      { q: "Apakah bidan bisa membantu ASI seret?", a: "Tentu. Bidan akan mengevaluasi frekuensi menyusui, kecukupan nutrisi, pompa ASI yang digunakan, hingga menyarankan metode power pumping atau booster yang tepat." },
      { q: "Apa yang harus saya siapkan sebelum konsultasi?", a: "Catat frekuensi menyusui, jumlah buang air kecil/buang air besar bayi, dan perubahan berat badan. Data ini sangat membantu bidan laktasi saat sesi konsultasi menyusui." }
    ]
  },
  "kesehatan-reproduksi": {
    title: "Konsultasi Kesehatan Reproduksi & Promil - ChatBidan",
    headline: "Edukasi & Konsultasi Kesehatan Reproduksi",
    description: "Edukasi kesuburan, program hamil (promil), kontrasepsi, dan siklus haid dengan layanan konsultasi kesehatan reproduksi privat.",
    problem: {
      title: "Malu bertanya tentang masalah kesehatan reproduksi dan kesuburan?",
      desc: "Masalah haid yang tidak teratur, keputihan, atau sedang program hamil butuh pendekatan yang medis tapi privasinya tetap terjamin 100%. Tidak perlu sungkan cerita di sini."
    },
    faq: [
      { q: "Apakah bidan bisa membantu program hamil (Promil)?", a: "Sangat bisa. Bidan akan memandu menghitung masa subur, memberikan panduan nutrisi, posisi, dan pola hidup sehat untuk mempercepat proses kehamilan." },
      { q: "Saya ingin menunda kehamilan, bisakah konsultasi KB di sini?", a: "Bisa. Bidan kami siap menjelaskan perbandingan dan efektivitas macam-macam alat kontrasepsi (pil KB, IUD, implan, dll) agar Bunda bisa memilih yang paling cocok." },
      { q: "Apakah konsultasi kesehatan reproduksi ini rahasia?", a: "Mutlak. Seluruh pertukaran pesan dengan sistem keamanan enkripsi end-to-end tidak akan bocor ke pihak manapun tanpa seijin Bunda." }
    ]
  }
};

const slugs = Object.keys(seoDataMap);

// Create static routes
export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

// Dynamic metadata Generation
export function generateMetadata({ params: rawParams }: { params: Promise<{ slug: string }> | { slug: string } }): Metadata {
  // Extract params safely whether it's a promise (Next.js 16) or sync object
  const slug = (rawParams as any).slug || (rawParams as any).then?.((p: any) => p.slug) || "";
  const data = seoDataMap[slug];
  
  if (!data) return { title: "Halaman Tidak Ditemukan - ChatBidan" };

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: "website",
      url: `https://chatbidan.com/${slug}`,
    },
    alternates: {
      canonical: `https://chatbidan.com/${slug}`,
    }
  };
}

export default async function SeoLandingPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Sync unwrap params (we use await if it's a promise, but for static generation it gets resolved)
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const data = seoDataMap[slug];

  if (!data) {
    notFound();
  }

  return (
    <div className="landing-wrapper">
      <style>{`
        .landing-wrapper {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1A1A1A;
          background: #FFFFFF;
          line-height: 1.6;
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Nav */
        nav {
          height: 70px;
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-content {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-weight: 800;
          display: flex;
          align-items: center;
        }

        .btn-lp {
          height: 48px;
          padding: 0 32px;
          border-radius: 100px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .btn-lp-primary {
          background: #ED54B5;
          color: white;
          box-shadow: 0 10px 20px rgba(237, 84, 181, 0.2);
        }

        .btn-lp-primary:hover {
          background: #C93493;
          transform: translateY(-2px);
        }

        /* Hero */
        .seo-hero {
          padding: 80px 0 60px;
          background: linear-gradient(135deg, #FFF0F5 0%, #F8FAFC 100%);
          text-align: center;
        }

        .seo-hero h1 {
          font-size: 3rem;
          font-weight: 850;
          color: #0F172A;
          margin-bottom: 24px;
          line-height: 1.2;
          max-width: 800px;
          margin: 0 auto 24px;
        }

        .seo-hero p {
          font-size: 1.25rem;
          color: #475569;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        /* Problem */
        .seo-problem {
          padding: 80px 0;
          background: #FFFFFF;
        }

        .problem-card {
          background: #FEF2F2;
          border-radius: 24px;
          padding: 48px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .problem-card h2 {
          font-size: 2rem;
          color: #991B1B;
          margin-bottom: 16px;
        }

        /* Features */
        .seo-features {
          padding: 80px 0;
          background: #F8FAFC;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 48px;
        }

        .feat-card {
          background: white;
          padding: 32px;
          border-radius: 24px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          border: 1px solid rgba(0,0,0,0.03);
          text-align: center;
        }

        /* Trust */
        .seo-trust {
          padding: 80px 0;
          background: #111;
          color: white;
          text-align: center;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 40px;
        }

        /* Testimonial */
        .seo-testi {
          padding: 80px 0;
          background: #FFF0F5;
          text-align: center;
        }

        /* FAQ */
        .seo-faq {
          padding: 80px 0;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .faq-item {
          border-bottom: 1px solid #E2E8F0;
          padding: 24px 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .seo-hero { padding: 60px 0 40px; }
          .seo-hero h1 { font-size: 2.2rem; }
          .features-grid, .trust-grid { grid-template-columns: 1fr; }
          .problem-card { padding: 32px 24px; }
        }
      `}</style>

      {/* Nav */}
      <nav>
        <div className="container nav-content">
          <Link href="/landingpage" className="logo">
            <Image src="/logo-horizontal.png" alt="ChatBidan" width={140} height={35} style={{ objectFit: 'contain' }} />
          </Link>
          <Link href="/register" className="btn-lp btn-lp-primary" style={{ height: 40, padding: '0 20px', fontSize: '0.9rem' }}>
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="seo-hero">
        <div className="container">
          <h1>{data.headline}</h1>
          <p>{data.description}</p>
          <Link href="/register" className="btn-lp btn-lp-primary" style={{ fontSize: '1.1rem', height: 56, padding: '0 40px' }}>
            Mulai Konsultasi <ArrowRight size={20} style={{ marginLeft: 8 }} />
          </Link>
        </div>
      </section>

      {/* Problem Section */}
      <section className="seo-problem">
        <div className="container">
          <div className="problem-card">
            <h2>{data.problem.title}</h2>
            <p style={{ fontSize: '1.1rem', color: '#7F1D1D' }}>{data.problem.desc}</p>
          </div>
        </div>
      </section>

      {/* Solution & Features Section */}
      <section className="seo-features">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Masa Depan <span style={{ color: '#ED54B5' }}>Pendampingan Bunda</span></h2>
            <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Kenapa menggunakan ChatBidan untuk kebutuhan {slug.split('-').join(' ')}?</p>
          </div>
          <div className="features-grid">
            <div className="feat-card">
              <div style={{ width: 64, height: 64, background: '#FDF4F7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ED54B5' }}>
                <MessageCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>Chat Langsung Berpengalaman</h3>
              <p style={{ color: '#64748B' }}>Dapatkan tanggapan real-time tanpa berurusan dengan chatbot robot. Interaksi penuh kehangatan medis.</p>
            </div>
            <div className="feat-card">
              <div style={{ width: 64, height: 64, background: '#F0F9FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#0EA5E9' }}>
                <Clock size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>Jadwal Fleksibel 24/7</h3>
              <p style={{ color: '#64748B' }}>Tidak perlu cemas di malam hari. Atur booking konsultasi jam berapapun dari kasur Anda tercinta.</p>
            </div>
            <div className="feat-card">
              <div style={{ width: 64, height: 64, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#10B981' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>Keamanan & Privasi 100%</h3>
              <p style={{ color: '#64748B' }}>Seluruh jejak rekam medis dan data konsultasi dienkripsi dengan standar platform kesehatan terbaik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="seo-trust">
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: 40 }}>Kepercayaan Sepenuh Hati</h2>
          <div className="trust-grid">
             <div>
               <h3 style={{ fontSize: '3rem', color: '#ED54B5', marginBottom: 8, fontWeight: 800 }}>100+</h3>
               <p style={{ fontSize: '1rem', opacity: 0.8 }}>Bidan Berlisensi</p>
             </div>
             <div>
               <h3 style={{ fontSize: '3rem', color: '#ED54B5', marginBottom: 8, fontWeight: 800 }}>&lt; 2 Menit</h3>
               <p style={{ fontSize: '1rem', opacity: 0.8 }}>Waktu Respons</p>
             </div>
             <div>
               <h3 style={{ fontSize: '3rem', color: '#ED54B5', marginBottom: 8, fontWeight: 800 }}>10k+</h3>
               <p style={{ fontSize: '1rem', opacity: 0.8 }}>Konsultasi Selesai</p>
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="seo-testi">
         <div className="container">
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 40 }}>Testimoni Bunda ChatBidan</h2>
            <div style={{ background: '#FFFFFF', padding: 40, borderRadius: 24, boxShadow: '0 10px 40px rgba(237,84,181,0.05)', maxWidth: 800, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
                 {[1,2,3,4,5].map(i => <Star key={i} size={24} fill="#FBBF24" color="#FBBF24" />)}
              </div>
              <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: 24, color: '#1E293B' }}>
                "Sangat terbantu sejak awal kehamilan sampai saya menyusui. Bidan sangat informatif, sabar menjawab kebingungan New Mom seperti saya. Benar-benar teman terbaik."
              </p>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Bunda Rini</h4>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Ibu dengan 1 anak</p>
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section className="seo-faq">
         <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <HelpCircle size={48} color="#ED54B5" />
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Pertanyaan yang Sering Diajukan</h2>
            </div>
            
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
               {data.faq.map((item, i) => (
                 <div key={i} className="faq-item">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                      {item.q}
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6 }}>
                      {item.a}
                    </p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
           <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>Jangan Tunda Konsultasi Pertama Bunda</h2>
           <Link href="/register" className="btn-lp btn-lp-primary" style={{ fontSize: '1.2rem', height: 60, padding: '0 48px' }}>
              Mulai Konsultasi Sekarang
           </Link>
        </div>
      </section>

    </div>
  );
}
