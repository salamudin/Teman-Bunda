# 🤖 Panduan Lengkap TWA Android — ChatBidan
> **Trusted Web Activity (TWA)** memungkinkan ChatBidan masuk ke Google Play Store sebagai aplikasi native penuh, tanpa address bar browser, dengan performa setara native app.

---

## 📋 Daftar Isi
1. [Persiapan Environment](#tahap-1-persiapan-environment)
2. [Validasi PWA (Critical)](#tahap-2-validasi-pwa-critical)
3. [Inisialisasi Project Bubblewrap](#tahap-3-inisialisasi-project-bubblewrap)
4. [Digital Asset Links](#tahap-4-digital-asset-links)
5. [Build AAB untuk Play Store](#tahap-5-build-aab-untuk-play-store)
6. [Upload ke Google Play Console](#tahap-6-upload-ke-google-play-console)
7. [Supabase Auth di TWA](#tahap-7-supabase-auth-di-twa)
8. [Push Notifications (OneSignal)](#tahap-8-push-notifications-onesignal)
9. [Troubleshooting](#tahap-9-troubleshooting)
10. [Checklist Final](#checklist-final)

---

## Tahap 1: Persiapan Environment

### 1.1 Prasyarat wajib

| Tool | Versi Minimum | Cara Cek |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Java JDK | 17+ | `java -version` |
| Android Studio | Koala+ | – |

### 1.2 Install Java JDK 17 (macOS)

```bash
# Jika menggunakan Homebrew
brew install openjdk@17

# Set JAVA_HOME
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
source ~/.zshrc

# Verifikasi
java -version
```

### 1.3 Install Android SDK via Android Studio

1. Download [Android Studio](https://developer.android.com/studio)
2. Buka **Android Studio → SDK Manager**
3. Install:
   - **Android SDK Platform 34** (Android 14)
   - **Android SDK Build-Tools 34.0.0**
   - **Android SDK Command-line Tools**

```bash
# Set environment variable Android SDK (macOS)
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc

# Verifikasi
adb version
```

### 1.4 Install Bubblewrap CLI

```bash
# Install global
npm install -g @bubblewrap/cli

# Verifikasi instalasi
bubblewrap --version
```

### 1.5 Jalankan Bubblewrap Doctor

```bash
bubblewrap doctor
```

> ⚠️ Jika diminta download Android SDK atau JDK, ketik **`y`** dan ikuti instruksi. Proses ini hanya dilakukan **sekali** di awal.

---

## Tahap 2: Validasi PWA (Critical)

Sebelum build TWA, pastikan PWA di `https://chatbidan.com` lulus semua syarat berikut.

### 2.1 Cek manifest.json

URL: `https://chatbidan.com/manifest.json`

Syarat wajib yang **sudah terpenuhi** di project ini:
- ✅ `name` & `short_name`
- ✅ `start_url: "/"`
- ✅ `display: "standalone"`
- ✅ `theme_color` & `background_color`
- ✅ Icon 192×192 (`/icon.png`)
- ✅ Icon 512×512 maskable (`/logo-vertical.png`)
- ✅ `scope: "/"`

### 2.2 Cek Service Worker

URL: `https://chatbidan.com/sw.js`

Syarat wajib yang **sudah terpenuhi**:
- ✅ Terdaftar & aktif
- ✅ Offline fallback (`/offline.html`)
- ✅ Cache-first strategy untuk static assets

### 2.3 Lighthouse PWA Audit

1. Buka Chrome → `https://chatbidan.com`
2. Buka DevTools (`F12`) → Tab **Lighthouse**
3. Pilih **Progressive Web App** → **Analyze page load**
4. Pastikan semua item di bagian **"PWA"** centang ✅ hijau

> **Target score PWA: 100/100** sebelum lanjut ke tahap berikutnya.

### 2.4 Verifikasi HTTPS & Mixed Content

```bash
# Cek header security di terminal
curl -I https://chatbidan.com
```

Pastikan response mengandung:
```
HTTP/2 200
strict-transport-security: max-age=...
```

---

## Tahap 3: Inisialisasi Project Bubblewrap

### 3.1 Buat folder project Android terpisah

```bash
# Di luar folder project Next.js Anda
cd ~/Documents
mkdir ChatBidanAndroid && cd ChatBidanAndroid
```

### 3.2 Jalankan init

```bash
bubblewrap init --manifest=https://chatbidan.com/manifest.json
```

### 3.3 Jawaban yang TEPAT saat setup interaktif

Bubblewrap akan menampilkan serangkaian prompt. Gunakan jawaban berikut:

```
? Web App URL: https://chatbidan.com/
? Application name: ChatBidan
? Short name: ChatBidan
? Application ID (package name): com.chatbidan.app
? Version code: 1
? Version name: 1.0.0
? Background color: #C0E0EC
? Theme color: #C0E0EC
? Splash screen color: #C0E0EC
? Display mode: standalone
? Orientation: portrait
? Enable notification delegation: Yes
? Include Chrome OS support: No
? Path to KeyStore file: ./twa-keystore.keystore
? Key alias: chatbidan-key
```

### 3.4 Buat KeyStore (Tanda Tangan Digital App)

Saat diminta membuat keystore baru, isi form berikut:

```
Enter keystore password: [BUAT PASSWORD KUAT - SIMPAN BAIK-BAIK!]
Re-enter new password: [ULANGI PASSWORD]
What is your first and last name?: ChatBidan Developer
What is the name of your organizational unit?: Engineering
What is the name of your organization?: TemanBunda
What is the name of your City or Locality?: Jakarta
What is the name of your State or Province?: DKI Jakarta
What is the two-letter country code?: ID
```

> 🔴 **CRITICAL**: Password KeyStore ini **TIDAK BISA DIUBAH** setelah app dipublish ke Play Store. Simpan di password manager (1Password, Bitwarden, dll).

### 3.5 Ambil SHA-256 Fingerprint

```bash
# Setelah init selesai, jalankan:
keytool -list -v -keystore ./twa-keystore.keystore -alias chatbidan-key

# Atau via Bubblewrap:
bubblewrap fingerprint add
```

Output akan menampilkan:
```
SHA256: AA:BB:CC:DD:EE:FF:...  ← SALIN INI!
```

---

## Tahap 4: Digital Asset Links

Langkah ini menghubungkan domain web dengan app Android secara kriptografis.

### 4.1 Update assetlinks.json di project Next.js

Buka file `public/.well-known/assetlinks.json` dan ganti `YOUR_SHA256_FINGERPRINT_HERE` dengan fingerprint asli Anda:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.chatbidan.app",
    "sha256_cert_fingerprints": [
      "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
    ]
  }
}]
```

### 4.2 Pastikan file dapat diakses publik

Vercel sudah melayani static files dari folder `public/`. Setelah deploy, pastikan URL ini accessible:

```
https://chatbidan.com/.well-known/assetlinks.json
```

> ⚠️ Response HARUS berupa JSON mentah, bukan redirect atau HTML error.

### 4.3 Konfigurasi MIME type (Next.js config)

Buka `next.config.ts` dan pastikan ada header untuk `.well-known`:

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}

export default nextConfig
```

### 4.4 Deploy ke Vercel

```bash
cd /Users/vidio/Documents/TemanBunda/bunda-care

# Commit assetlinks.json yang sudah diupdate
git add public/.well-known/assetlinks.json next.config.ts
git commit -m "feat: add digital asset links for TWA verification"
git push origin main
```

Vercel akan auto-deploy. Tunggu ~1-2 menit lalu verifikasi:

```bash
curl https://chatbidan.com/.well-known/assetlinks.json
```

### 4.5 Validasi via Google Tool

Gunakan [Statement List Generator & Tester](https://developers.google.com/digital-asset-links/tools/generator):
- Source: **Android App** → Package: `com.chatbidan.app`
- Target: **Site** → `https://chatbidan.com`
- Klik **Test Statement**
- Harus muncul: ✅ **"Success"**

---

## Tahap 5: Build AAB untuk Play Store

### 5.1 Jalankan build di folder ChatBidanAndroid

```bash
cd ~/Documents/ChatBidanAndroid

bubblewrap build
```

> Masukkan **KeyStore password** saat diminta.

### 5.2 Output file yang dihasilkan

```
ChatBidanAndroid/
├── app-release-bundle.aab      ← Upload ini ke Play Store
├── app-release-signed.apk      ← Test di perangkat fisik
└── twa-manifest.json           ← Konfigurasi project
```

### 5.3 Test APK di perangkat Android

```bash
# Hubungkan HP Android via USB (aktifkan USB Debugging)
adb devices

# Install APK untuk testing
adb install app-release-signed.apk
```

Buka aplikasi **ChatBidan** di HP. Pastikan:
- ❌ Tidak ada address bar
- ✅ Tampil fullscreen seperti native app
- ✅ Splash screen muncul dengan warna `#C0E0EC`

### 5.4 Jika ingin rebuild setelah update

```bash
# Update versi di twa-manifest.json dulu
# "appVersionCode": 2, "appVersionName": "1.0.1"

bubblewrap build
```

---

## Tahap 6: Upload ke Google Play Console

### 6.1 Buat akun Google Play Developer

- URL: https://play.google.com/console
- Biaya registrasi: **USD 25** (sekali seumur hidup)

### 6.2 Buat app baru

1. Klik **"Create app"**
2. App name: **ChatBidan**
3. Default language: **Indonesian**
4. App or game: **App**
5. Free or paid: **Free**
6. Centang semua declarations

### 6.3 Upload AAB

1. Masuk ke **Production → Releases**
2. Klik **"Create new release"**
3. Upload file `app-release-bundle.aab`
4. Release notes: `Versi perdana ChatBidan - Platform konsultasi bidan professional`

### 6.4 Lengkapi Store Listing

| Field | Isi |
|---|---|
| App name | ChatBidan |
| Short description | Konsultasi bidan profesional kapan saja |
| Full description | Platform konsultasi bidan... |
| Category | Health & Fitness |
| Email | support@chatbidan.com |

### 6.5 Google Play App Signing (Penting!)

> Saat upload pertama kali, Google Play akan menanyakan apakah ingin menggunakan **Google Play App Signing**. **Pilih YES** — ini mengamankan keystore Anda di Google. Anda tetap butuh keystore lokal untuk men-sign bundle sebelum upload.

### 6.6 Update assetlinks.json dengan fingerprint Play Store

Setelah enrollment Google Play App Signing, Google akan generate **fingerprint baru**. Anda perlu menambahkannya ke `assetlinks.json`:

1. Masuk Play Console → **Setup → App Integrity**
2. Copy **SHA-256 certificate fingerprint** dari bagian "App signing key certificate"
3. Update `public/.well-known/assetlinks.json` — **tambahkan** fingerprint Play Store (jangan hapus fingerprint debug/local):

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.chatbidan.app",
    "sha256_cert_fingerprints": [
      "FINGERPRINT_KEYSTORE_LOKAL_ANDA",
      "FINGERPRINT_DARI_GOOGLE_PLAY_APP_SIGNING"
    ]
  }
}]
```

4. Deploy ulang ke Vercel.

---

## Tahap 7: Supabase Auth di TWA

TWA menggunakan Chrome Custom Tab yang **berbagi storage** dengan Chrome browser di device. Ini artinya:

### 7.1 Behavior Storage

| Storage Type | Behavior di TWA |
|---|---|
| `localStorage` | ✅ Persists — login tetap tersimpan |
| `sessionStorage` | ✅ Aktif selama session |
| Cookies | ✅ Shared dengan Chrome |
| IndexedDB | ✅ Persists |

### 7.2 Konfigurasi Supabase Client

Pastikan Supabase client di project menggunakan `persistSession: true` (default sudah true):

```typescript
// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,        // ← Penting!
      storageKey: 'chatbidan-auth', // ← Custom key
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  }
)
```

### 7.3 OAuth Redirect Handling

Jika menggunakan OAuth (Google login), redirect URL harus di-allowlist:

1. Masuk ke **Supabase Dashboard → Authentication → URL Configuration**
2. Tambahkan ke **Redirect URLs**:
   ```
   https://chatbidan.com/auth/callback
   https://chatbidan.com/**
   ```

### 7.4 Deep Link Handling untuk TWA

Tambahkan konfigurasi di `twa-manifest.json` (folder ChatBidanAndroid):

```json
{
  "handleLinks": "preferred",
  "navigationColor": "#C0E0EC",
  "navigationColorDark": "#C0E0EC",
  "navigationDividerColor": "#C0E0EC",
  "enableNotifications": true
}
```

---

## Tahap 8: Push Notifications (OneSignal)

### 8.1 Setup OneSignal (tanpa Firebase)

1. Daftar di [OneSignal.com](https://onesignal.com) (gratis)
2. Buat app baru → Pilih platform **Web Push**
3. Pilih **My website is a Progressive Web App**
4. Masukkan:
   - Site URL: `https://chatbidan.com`
   - Site Name: `ChatBidan`
   - Local Testing: `https://chatbidan.com`
5. Salin **App ID** yang diberikan

### 8.2 Update Service Worker

Tambahkan dukungan OneSignal ke `public/sw.js`:

```javascript
// Import OneSignal service worker
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
```

> Atau buat file `public/OneSignalSDKWorker.js` dengan konten:
> ```javascript
> importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
> ```

### 8.3 Inisialisasi OneSignal di App

Tambahkan ke `src/app/layout.tsx`:

```tsx
// src/app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* OneSignal Web Push */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "GANTI_DENGAN_APP_ID_ONESIGNAL_ANDA",
                serviceWorkerParam: { scope: "/" },
                notifyButton: { enable: false },
                promptOptions: {
                  slidedown: {
                    prompts: [{
                      type: "push",
                      autoPrompt: true,
                      text: {
                        actionMessage: "ChatBidan ingin mengirim notifikasi untuk update konsultasi Anda.",
                        acceptButton: "Izinkan",
                        cancelButton: "Nanti saja"
                      },
                      delay: {
                        pageViews: 1,
                        timeDelay: 5
                      }
                    }]
                  }
                }
              });
            });
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 8.4 Test Push Notification

1. Buka `https://chatbidan.com` di browser
2. Izinkan notifikasi saat diminta
3. Masuk OneSignal Dashboard → **Messages → New Push**
4. Kirim test message → Harus muncul di browser/device

---

## Tahap 9: Troubleshooting

### ❌ Problem: Address bar masih muncul di TWA

**Penyebab**: Digital Asset Links gagal diverifikasi.

**Solusi**:
1. Pastikan `https://chatbidan.com/.well-known/assetlinks.json` bisa diakses (bukan redirect)
2. Pastikan SHA-256 fingerprint sudah benar (match antara keystore dan assetlinks.json)
3. Cek Content-Type response header harus `application/json`
4. Tunggu propagasi DNS jika baru deploy (~5 menit)

```bash
# Debug assetlinks.json
curl -v https://chatbidan.com/.well-known/assetlinks.json
```

### ❌ Problem: `bubblewrap init` gagal fetch manifest

**Solusi**:
```bash
# Pastikan manifest accessible
curl https://chatbidan.com/manifest.json

# Jika ada masalah CORS, coba:
bubblewrap init --manifest=https://chatbidan.com/manifest.json --skipPwaValidation
```

### ❌ Problem: Build gagal dengan error SDK

**Solusi**:
```bash
# Reset Bubblewrap config
rm ~/.bubblewrap/config.json

# Jalankan ulang doctor
bubblewrap doctor

# Rebuild
bubblewrap build
```

### ❌ Problem: Supabase logout setelah buka TWA

**Penyebab**: App tidak share storage dengan Chrome jika user belum login di Chrome sebelumnya.

**Solusi**: TWA berbagi storage dengan Chrome. Pastikan user login sekali via browser, setelah itu session persist otomatis.

### ❌ Problem: OneSignal tidak muncul di TWA

**Solusi**: OneSignal Web Push bekerja via Service Worker. Pastikan:
1. `OneSignalSDKWorker.js` ada di `/public/`
2. Service Worker scope adalah `/`
3. HTTPS aktif (bukan HTTP)

---

## Checklist Final

### PWA Checklist
- [ ] `manifest.json` accessible di `https://chatbidan.com/manifest.json`
- [ ] Service Worker terdaftar & aktif
- [ ] Offline fallback page berfungsi
- [ ] Lighthouse PWA score 100
- [ ] Tidak ada mixed content (HTTP di dalam HTTPS)
- [ ] HTTPS aktif dengan valid SSL cert

### TWA Checklist
- [ ] Bubblewrap CLI terinstall
- [ ] `bubblewrap doctor` pass tanpa error
- [ ] Project diinisialisasi dengan package name `com.chatbidan.app`
- [ ] KeyStore dibuat & password disimpan aman
- [ ] SHA-256 fingerprint sudah disalin

### Digital Asset Links Checklist
- [ ] `assetlinks.json` diupdate dengan fingerprint asli
- [ ] File accessible di `https://chatbidan.com/.well-known/assetlinks.json`
- [ ] Google Asset Links validator menunjukkan ✅ Success
- [ ] Fingerprint Play Store App Signing ditambahkan (jika sudah upload ke Play Store)

### Build Checklist
- [ ] `bubblewrap build` berhasil tanpa error
- [ ] `app-release-bundle.aab` terbuat
- [ ] APK sudah ditest di device fisik — tidak ada address bar
- [ ] Splash screen muncul dengan benar

### Play Store Checklist
- [ ] Google Play Developer account terdaftar
- [ ] App listing lengkap (description, screenshot, icon)
- [ ] AAB sudah di-upload ke Production track
- [ ] Review selesai & app published

### Supabase Checklist
- [ ] `persistSession: true` dikonfigurasi
- [ ] OAuth redirect URL sudah ditambahkan
- [ ] Login tetap aktif setelah restart app

### Notifikasi Checklist
- [ ] OneSignal App ID sudah dikonfigurasi
- [ ] `OneSignalSDKWorker.js` ada di `/public/`
- [ ] Notification permission prompt muncul
- [ ] Test push notification berhasil diterima

---

## 📁 Struktur File yang Dihasilkan

```
ChatBidanAndroid/               ← Folder project TWA
├── twa-manifest.json           ← Konfigurasi Bubblewrap
├── twa-keystore.keystore       ← 🔴 JANGAN COMMIT KE GIT!
├── app-release-bundle.aab      ← Upload ke Play Store
├── app-release-signed.apk      ← Test di device
├── build.gradle
├── settings.gradle
└── app/
    └── src/
        └── main/
            ├── AndroidManifest.xml
            └── res/
                └── ... (icons, splash screens)

bunda-care/public/              ← Project Next.js Anda
├── manifest.json               ← ✅ Sudah configured
├── sw.js                       ← ✅ Sudah configured
├── offline.html                ← ✅ Sudah ada
└── .well-known/
    └── assetlinks.json         ← ⚠️ Update SHA-256 fingerprint!
```

---

## 🔐 Keamanan & Best Practices

```bash
# Tambahkan keystore ke .gitignore!
echo "twa-keystore.keystore" >> ~/Documents/ChatBidanAndroid/.gitignore
echo "*.keystore" >> ~/Documents/ChatBidanAndroid/.gitignore
echo "*.jks" >> ~/Documents/ChatBidanAndroid/.gitignore
```

**Backup KeyStore ke tempat yang aman:**
- Google Drive (encrypted)
- 1Password / Bitwarden
- USB drive fisik

> 🔴 **JIKA KEYSTORE HILANG, ANDA TIDAK BISA UPDATE APP DI PLAY STORE SELAMANYA.**

---

*Dokumen ini berlaku untuk ChatBidan v1.0.0 — Terakhir diperbarui: April 2026*
