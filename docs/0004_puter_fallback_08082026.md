# Dev Log: Puter.js Fallback Integration
**Nomor:** 0004
**Tanggal:** 08 Agustus 2026
**Topik:** Puter.js sebagai Fallback LLM Terakhir

---

## Ringkasan

Implementasi **Puter.js** sebagai pilihan terakhir (_last-resort fallback_) ketika semua API LLM lainnya tidak terkoneksi atau gagal. Puter.js memungkinkan generate RPS OBE menggunakan model AI terbaik (`claude-3-7-sonnet` atau `gpt-4o`) **secara gratis** tanpa API key dari sisi developer — menggunakan akun Puter milik pengguna.

---

## Latar Belakang

Sebelumnya, jika semua provider LLM (OpenAI, Anthropic, Dahl, Custom) tidak terkoneksi, sistem akan jatuh ke **Mode Mandiri (Offline)** yang menggunakan engine RPS internal sederhana tanpa AI. Dengan fitur ini, sebelum jatuh ke mode mandiri, sistem akan mencoba **Puter.js** secara otomatis.

---

## File yang Dimodifikasi / Dibuat

### [NEW] `src/lib/puter-generator.ts`
Utilitas sisi-klien untuk generate RPS via Puter.js:

| Fungsi | Keterangan |
|---|---|
| `isPuterAvailable()` | Cek apakah `window.puter.ai.chat` tersedia |
| `loadPuterScript()` | Lazy-load CDN `https://js.puter.com/v2/` ke `<head>` |
| `generateRPSWithPuter(prompt, onProgress?)` | Generate dengan `claude-3-7-sonnet` → fallback ke `gpt-4o` |
| `extractTextFromPuterResponse()` | Normalisasi respon Anthropic / OpenAI format |

Konstanta:
- `PUTER_BEST_MODEL = "claude-3-7-sonnet"` — model utama (paling kapabel)
- `PUTER_FALLBACK_MODEL = "gpt-4o"` — model cadangan

---

### [MODIFY] `src/components/rps/llm-settings.tsx`

- Tambah `"puter"` ke union type `LLMProvider`
- Tambah preset `puter` di `PROVIDER_PRESETS`:
  - **Name**: Puter.js (Gratis)
  - **Default Model**: `claude-3-7-sonnet`
  - **Models**: `claude-3-7-sonnet`, `gpt-4o`, `claude-3-5-sonnet`, `o3-mini`
  - **Base URL**: `https://js.puter.com/v2/`
- Tambah icon khusus Puter.js (`Zap` hijau) di grid provider card
- Tambah kondisi rendering: provider `puter` ditampilkan sebagai **info panel** khusus (tanpa form API key, karena tidak diperlukan)
- Info panel Puter.js menampilkan:
  - Keunggulan: gratis, tanpa kartu kredit, akses GPT-4o & Claude
  - Catatan: berjalan di browser, perlu akun Puter, rate limit sesuai kuota akun
  - Tombol "Aktifkan Puter.js" dan tombol kembali ke API Token
- Update panel Mode Mandiri: tambah tombol shortcut ke Puter.js

---

### [MODIFY] `src/components/rps/rps-builder.tsx`

- Import `generateRPSWithPuter` dari `@/lib/puter-generator`
- Tambah helper `parseGeneratedJSON(rawText)`:
  - Ekstrak JSON dari markdown code fence ` ```json ... ``` `
  - Ekstrak JSON dari teks bebas (cari `{` sampai `}` terakhir)
  - Fallback ke `JSON.parse()` langsung
- Rewrite `handleGenerate` dengan **3-layer fallback chain**

---

### [MODIFY] `src/app/api/rps/generate/route.ts`

- Tambah `"puter"` ke union type `CustomLLMConfig.provider`
- Handle `provider === "puter"` sama seperti `"standalone"` — lempar `NO_API_KEY` ke klien agar klien menjalankan Puter.js langsung

---

### [MODIFY] `src/app/api/rps/test-llm/route.ts`

- Tambah `"puter"` ke union type `LLMConfigPayload.provider`

---

## Arsitektur Fallback Chain

```
User klik "Buat RPS"
        |
        v
[LAYER 1] provider === "puter" ?
        |-- YA --> generateRPSWithPuter()
        |              |-- claude-3-7-sonnet --> OK --> Selesai
        |              +-- Gagal --> gpt-4o --> OK --> Selesai
        |                                   +-- Gagal --> Error Toast
        |
        +-- TIDAK --> fetch POST /api/rps/generate (server)
                        |
                        |-- OK (200) --> Selesai
                        |
[LAYER 2]               +-- Gagal (NO_API_KEY / 401 / 403 / standalone)
                        |     |
                        |     v
                        |  Toast: "Beralih ke Puter.js (Fallback)..."
                        |  generateRPSWithPuter()
                        |     |-- Puter OK --> Selesai
                        |     +-- Puter Gagal --> Error Toast
                        |
[LAYER 3]               +-- Network Error (fetch fail / ERR_*)
                              |
                              v
                           generateRPSWithPuter()
                              |-- Puter OK --> Selesai
                              +-- Puter Gagal --> "Semua layanan AI gagal"
```

---

## Status Implementasi

- [x] Buat `puter-generator.ts`
- [x] Update `LLMProvider` type + preset di `llm-settings.tsx`
- [x] Tambah info panel Puter.js di UI Pengaturan LLM
- [x] Update standalone panel dengan shortcut Puter.js
- [x] Tambah `parseGeneratedJSON` helper di `rps-builder.tsx`
- [x] Implementasi 3-layer fallback chain di `handleGenerate`
- [x] Update type di `generate/route.ts` & `test-llm/route.ts`
- [x] **Build berhasil** — semua route terkomilasi tanpa error

---

## Cara Penggunaan

### Opsi 1: Aktifkan Puter.js Manual
1. Buka tab **Pengaturan LLM** di aplikasi
2. Klik kartu **Puter.js (Gratis)** (ikon Zap hijau)
3. Baca info panel → Klik **Aktifkan Puter.js**
4. Kembali ke tab **Builder** → Klik **Buat RPS**

### Opsi 2: Auto-Fallback (Transparan)
- Jika API key tidak tersedia / semua provider gagal
- Sistem **otomatis** beralih ke Puter.js tanpa konfigurasi
- Toast muncul: *"Beralih ke Puter.js (Fallback) — API LLM tidak tersedia"*
- Generate RPS tetap berjalan menggunakan `claude-3-7-sonnet` / `gpt-4o`

---

## Syarat & Catatan Penting

| Item | Detail |
|---|---|
| Koneksi | Perlu internet (Puter.js berjalan di sisi klien/browser) |
| Akun | Akun [puter.com](https://puter.com) gratis — login otomatis saat pertama dipanggil |
| Privasi | Prompt RPS dikirim ke server Puter/Claude/OpenAI |
| Rate Limit | Tergantung kuota akun Puter pengguna |
| Model | `claude-3-7-sonnet` (utama) → `gpt-4o` (cadangan) |

---

## Referensi

- Puter.js Docs: https://docs.puter.com/
- Puter.js CDN: `https://js.puter.com/v2/`
- npm: `@heyputer/puter.js`
