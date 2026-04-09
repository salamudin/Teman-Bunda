"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, MessageCircle, Calendar, Baby,
  ShieldCheck, Star, Menu, X, Play, CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-wrapper">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        :root {
          --lp-primary: #ED54B5;
          --lp-primary-dark: #C93493;
          --lp-secondary: #C0E0EC;
          --lp-text-main: #1A1A1A;
          --lp-text-muted: #666666;
          --lp-bg: #FFFFFF;
          --lp-bg-soft: #FAFAFA;
        }

        .landing-wrapper {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--lp-text-main);
          background: var(--lp-bg);
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
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 1000;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          background: #FFFFFF;
        }

        nav.scrolled {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          height: 70px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .nav-content {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--lp-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .nav-links a {
          text-decoration: none;
          color: var(--lp-text-main);
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: var(--lp-primary);
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
          gap: 8px;
          transition: all 0.3s ease;
          box-sizing: border-box;
          white-space: nowrap;
        }

        .btn-lp-primary {
          background: var(--lp-primary);
          color: white;
          box-shadow: 0 10px 20px rgba(237, 84, 181, 0.2);
        }

        .btn-lp-primary:hover {
          background: var(--lp-primary-dark);
          transform: translateY(-2px);
        }

        .btn-lp-outline {
          border: 2px solid #EEE;
          color: var(--lp-text-main);
        }

        .btn-lp-outline:hover {
          border-color: var(--lp-primary);
          color: var(--lp-primary);
        }

                /* Hero */
        .hero-section {
          padding-top: 180px;
          padding-bottom: 120px;
          background: #FEF1F9;
          overflow: visible;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(237, 84, 181, 0.08);
          color: var(--lp-primary);
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 24px;
          border: 1px solid rgba(237, 84, 181, 0.1);
        }

        h1 {
          font-size: 3rem;
          font-weight: 850;
          line-height: 1.15;
          margin-bottom: 28px;
          letter-spacing: -0.05em;
          color: #0F172A;
        }

        h1 span {
          color: #ED54B5;
        }

        .hero-desc {
          font-size: 1.25rem;
          color: #475569;
          margin-bottom: 48px;
          max-width: 520px;
          line-height: 1.7;
        }

        .hero-image-container {
          position: relative;
        }

        .hero-main-img {
          position: relative;
          width: 100%;
          aspect-ratio: 0.85/1;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 40px 80px -15px rgba(0,0,0,0.1);
          background: #F1F5F9;
        }

        .glass-badge {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,1);
          padding: 16px 20px;
          border-radius: 20px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.06);
          position: absolute;
          z-index: 10;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        /* Features */
        .features-section {
          padding: 140px 0;
          background: #F8FAFC;
          position: relative;
        }
        
        .feature-card {
          background: white;
          padding: 48px;
          border-radius: 40px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0,0,0,0.03);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }

        .feature-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 40px 80px -15px rgba(0,0,0,0.08);
          border-color: rgba(237, 84, 181, 0.1);
        }

        .section-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 80px;
        }

        .section-header h2, .showcase-content h2, .cta-card h2 {
          font-size: 3rem;
          font-weight: 850;
          line-height: 1.15;
          margin-bottom: 20px;
          color: #0F172A;
          letter-spacing: -0.03em;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: rgba(237, 84, 181, 0.05);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: var(--lp-primary);
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .feature-card p {
          color: var(--lp-text-muted);
        }

        /* Mobile Showcase */
        .showcase-section {
          padding: 120px 0;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          align-items: center;
        }

        /* Trust */
        .trust-section {
          padding: 80px 0;
          background: #111;
          color: white;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        .stat-item h4 {
          font-size: 3rem;
          font-weight: 850;
          color: var(--lp-primary);
          margin-bottom: 8px;
        }

        /* CTA */
        .cta-section {
          padding: 120px 0;
        }

        .cta-card {
          background: linear-gradient(135deg, #ED54B5 0%, #8B5CF6 100%);
          border-radius: 48px;
          padding: 100px 60px;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .cta-card h2 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .cta-card p {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 40px;
        }

        .btn-white {
          background: white;
          color: var(--lp-primary);
        }

        .btn-white:hover {
          background: #F0F0F0;
          transform: scale(1.05);
        }

        footer {
          padding: 80px 0 40px;
          border-top: 1px solid #EEE;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        @media (max-width: 991px) {
          h1 { font-size: 2.2rem !important; }
          .section-header h2, .showcase-content h2, .cta-card h2 { font-size: 2.2rem !important; }
          
          .hero-section { padding-top: 120px !important; padding-bottom: 56px !important; }
          .features-section, .showcase-section, .trust-section, .cta-section { padding: 56px 0 !important; }

          .hero-grid, .showcase-grid { 
            display: flex;
            flex-direction: column;
            gap: 32px;
            text-align: center;
          }
          .hero-desc { margin: 0 auto 32px; font-size: 1rem; }
          .hero-btns, .hero-rating { justify-content: center; }
          .features-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .stat-item h4 { font-size: 2rem !important; }
          .nav-links { display: none; }
          
          .hero-content { order: 2; }
          .hero-image-container { 
            order: 1;
            width: 100%;
            max-width: 380px; 
            margin: 0 auto 16px;
            display: block;
          }
          .glass-badge { transform: scale(0.6); white-space: nowrap; z-index: 20; }
          
          .showcase-image { width: 100%; max-width: 480px; margin: 0 auto; }
          .showcase-image > div { height: 320px !important; }
          .showcase-content h2 { margin-top: 40px !important; }
          
          footer { padding-top: 56px !important; }
          .footer-grid { text-align: center; }
          .footer-grid > div { display: flex; flex-direction: column; align-items: center; }
          .footer-grid .logo { justify-content: center; margin-bottom: 16px; }
        }

        @media (max-width: 767px) {
          .features-grid { grid-template-columns: 1fr; }
          .cta-card { padding: 40px 20px; border-radius: 24px; }
          .footer-grid { grid-template-columns: 1fr; gap: 48px; }
          .hero-tag { font-size: 0.7rem; padding: 4px 10px; }
        }
      `}</style>

      <nav className={scrolled ? "scrolled" : ""}>
        <div className="container nav-content">
          <div className="logo">
            <Image src="/logo-horizontal.png" alt="ChatBidan" width={160} height={40} style={{ objectFit: 'contain' }} />
          </div>
          <div className="nav-links">
            <Link href="/register" className="btn-lp btn-lp-primary" style={{ color: 'white' }}>
              Mulai Konsultasi
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-tag">
               <span style={{ fontSize: '1.2rem' }}>✨</span> Chat Bidan No. 1 di Indonesia
            </div>
            <h1>Pendamping Setia <br/><span>Perjalanan Bunda</span></h1>
            <p className="hero-desc">
              Akses cepat ke bidan profesional 24 Jam. Konsultasi kehamilan, menyusui, dan promil tanpa ribet, langsung dari ponsel Bunda.
            </p>
            <div className="hero-btns" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Link href="/register" className="btn-lp btn-lp-primary" style={{ color: 'white' }}>
                Mulai Gratis Sekarang <ArrowRight size={20} />
              </Link>
              <Link href="/bidans" className="btn-lp btn-lp-outline">
                Lihat Daftar Bidan
              </Link>
            </div>
            <div className="hero-rating" style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={18} fill="#FBBF24" color="#FBBF24" />
                ))}
              </div>
              <span style={{ fontSize: '1rem', color: '#64748B' }}>
                <b style={{ color: '#0F172A' }}>4.9/5</b> dari 10,000+ Bunda
              </span>
            </div>
          </div>
          
          <div className="hero-image-container">
            <div className="hero-main-img">
              <Image 
                src="/hero-portrait.png" 
                alt="ChatBidan Professional Bidan" 
                fill
                priority 
                style={{ objectFit: 'cover' }}
              />
            </div>
            
            {/* Floating Badges */}
            <div className="glass-badge" style={{ 
              top: '10%', right: '-5%', 
              animation: 'float 5s ease-in-out infinite' 
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, background: '#ED54B5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <MessageCircle size={22} fill="white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Respon Cepat</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Dalam 2 Menit</div>
                </div>
              </div>
            </div>

            <div className="glass-badge" style={{ 
              bottom: '15%', left: '-10%', 
              animation: 'float 6s ease-in-out infinite', animationDelay: '1s'
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tenaga Ahli</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>100+ Bidan Berlisensi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="fitur">
        <div className="container">
          <div className="section-header">
            <div className="hero-tag" style={{ margin: '0 auto 16px', background: 'rgba(237, 84, 181, 0.1)', color: '#ED54B5' }}>Solusi Lengkap</div>
            <h2>Didesain Untuk Kebutuhan Bunda</h2>
            <p style={{ color: '#666' }}>Fitur canggih yang memudahkan setiap tahap perjalanan kehamilan Bunda.</p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: <MessageCircle />,
                title: "Live Chat 24/7",
                desc: "Tanya kapan saja, tenang kapan saja. Bidan kami siap menjawab kekhawatiran Bunda."
              },
              {
                icon: <Baby />,
                title: "Tracker Janin",
                desc: "Lihat perkembangan si kecil setiap minggu dengan visualisasi buah yang lucu."
              },
              {
                icon: <Calendar />,
                title: "Booking Terjadwal",
                desc: "Atur sesi konsultasi mendalam sesuai jadwal kenyamanan Bunda dan Bidan."
              },
              {
                icon: <ShieldCheck />,
                title: "Bidan Terkurasi",
                desc: "Hanya bidan dengan sertifikasi resmi dan pengalaman minimal 5 tahun."
              },
              {
                icon: <Star />,
                title: "Riwayat Konsultasi",
                desc: "Simpan semua catatan dan saran penting dari bidan di satu tempat."
              },
              {
                icon: <CheckCircle2 />,
                title: "Privasi Terjamin",
                desc: "Data medis dan percakapan Bunda terenkripsi aman dan rahasia."
              }
            ].map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon" style={{ background: 'rgba(237, 84, 181, 0.05)', color: '#ED54B5' }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid Section / Showcase */}
      <section className="showcase-section">
        <div className="container showcase-grid">
          <div className="showcase-image">
            <div style={{
              position: 'relative', width: '100%', height: 500, borderRadius: 40,
              overflow: 'hidden', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)'
            }}>
              <Image 
                src="/showcase-mother.png" 
                alt="Mother using ChatBidan" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ 
                    width: 72, height: 72, background: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    margin: '0 auto 20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <Play fill="white" color="white" />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '1.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Tonton Testimoni Bunda</p>
                </div>
              </div>
            </div>
          </div>
          <div className="showcase-content">
            <h2>Konsultasi Menjadi Lebih <br/><span style={{ color: '#ED54B5' }}>Personal & Nyaman</span></h2>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: 32 }}>
              Kami percaya setiap Bunda berhak mendapatkan perhatian khusus. Di ChatBidan, Bunda tidak hanya bicara dengan sistem, tapi dengan hati seorang ahli.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                "Interaksi real-time tanpa bot",
                "Rekomendasi gizi & nutrisi janin",
                "Tips mengatasi keluhan kehamilan",
                "Persiapan persalinan mental & fisik"
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}>
                  <div style={{ width: 24, height: 24, background: '#ED54B5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={14} color="white" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="trust-section" style={{ background: '#C0E0EC', padding: '96px 0' }}>
        <div className="container">
          <div className="stats-grid">
            {[
              { label: "Bunda Terdaftar", value: "50k+" },
              { label: "Bidan Profesional", value: "120+" },
              { label: "Rating Kepuasan", value: "4.9/5" },
              { label: "Layanan 24 Jam", value: "Non-stop" }
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <h4 style={{ 
                   fontSize: '3rem', fontWeight: 850, marginBottom: 8,
                   color: '#ED54B5'
                }}>{s.value}</h4>
                <p style={{ opacity: 0.8, fontSize: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, color: '#1E293B' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="cta-card" style={{ 
            background: '#FBD5ED',
            border: '1px solid rgba(0,0,0,0.02)', overflow: 'visible'
          }}>
             <div style={{ position: 'relative', zIndex: 2 }}>
                <h2>Siap Menemani <br/><span style={{ color: '#ED54B5' }}>Si Kecil?</span></h2>
                <p style={{ fontSize: '1.2rem', maxWidth: 600, margin: '0 auto 40px', color: '#475569', fontWeight: 500 }}>
                  Bergabunglah dengan 50,000+ Bunda cerdas lainnya yang telah merasakan ketenangan dalam perjalanan kehamilan mereka.
                </p>
                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/register" className="btn-lp btn-lp-primary" style={{ boxShadow: '0 10px 20px rgba(237, 84, 181, 0.2)' }}>
                    Daftar Sekarang
                  </Link>
                  <Link href="/bidans" className="btn-lp" style={{ border: '2px solid rgba(0,0,0,0.05)', color: '#1E293B', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
                    Tanya Bidan Dulu
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="logo" style={{ marginBottom: 20 }}>
                <Image src="/logo-horizontal.png" alt="ChatBidan" width={160} height={40} style={{ objectFit: 'contain' }} />
              </div>
              <p style={{ color: '#666', maxWidth: 300 }}>
                Platform konsultasi kesehatan ibu dan anak terdepan di Indonesia. Temukan kedamaian pikiran dalam kehamilan Bunda.
              </p>
            </div>
            <div>
              <h5 style={{ fontWeight: 800, marginBottom: 24 }}>Produk</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="#fitur" style={{ textDecoration: 'none', color: '#666' }}>Layanan Chat</Link>
                <Link href="#janin" style={{ textDecoration: 'none', color: '#666' }}>Tracker Janin</Link>
                <Link href="/bidans" style={{ textDecoration: 'none', color: '#666' }}>Daftar Bidan</Link>
              </div>
            </div>
            <div>
              <h5 style={{ fontWeight: 800, marginBottom: 24 }}>Bantuan</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="#" style={{ textDecoration: 'none', color: '#666' }}>FAQ</Link>
                <Link href="#" style={{ textDecoration: 'none', color: '#666' }}>Kontak</Link>
                <Link href="#" style={{ textDecoration: 'none', color: '#666' }}>Syarat & Ketentuan</Link>
              </div>
            </div>
            <div>
              <h5 style={{ fontWeight: 800, marginBottom: 24 }}>Sosial</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="#" style={{ textDecoration: 'none', color: '#666' }}>Instagram</Link>
                <Link href="#" style={{ textDecoration: 'none', color: '#666' }}>TikTok</Link>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 40, borderTop: '1px solid #F0F0F0', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
            © 2026 ChatBidan by TemanBunda. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
