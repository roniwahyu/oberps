# 0006 - GOD-TIER MASTER PROMPT: RPS OBE Single-Shot
**Nomor:** 0006  
**Tanggal:** 08 Agustus 2026  
**Topik:** Satu Master Prompt Komprehensif untuk Generate RPS OBE Lengkap  
**Sumber:** Distilasi dari 18 Prompt dalam `PROMPT - BUAT RPS OBE With AI (1).pdf`  
**Teknik:** Chain-of-Thought (CoT) + Self-Correction + Constructive Alignment

---

## Filosofi

PDF aslinya dirancang untuk **chat interaktif** — user dan AI berdialog 18 kali secara bertahap.  
Untuk aplikasi kita, semua dialog itu bisa **dikompres menjadi 1 prompt** dengan cara:

1. **Chain-of-Thought Internal** — AI diperintahkan untuk "berpikir bertahap" di dalam responnya sebelum output JSON
2. **Self-Correction Built-in** — Prompt 10 (koreksi KKO abstrak) diintegrasikan sebagai aturan wajib
3. **All-in-One Context** — Data mata kuliah, CPL, kurikulum semua dimasukkan sekaligus
4. **Single JSON Output** — Output akhir tetap 1 JSON valid yang bisa langsung diparse

Hasilnya: **Kualitas setara 18 prompt bertahap, tapi dalam 1 panggilan API.**

---

## GOD-TIER MASTER PROMPT (Versi Bahasa Indonesia)

> Ini adalah teks prompt yang akan dikirim ke LLM API. Variabel dalam `{{kurung kurawal}}` akan diisi oleh aplikasi.

---

```
IDENTITAS PERAN ANDA:
Anda adalah Pakar Kurikulum Pendidikan Tinggi Indonesia sekaligus Ahli Instructional Design
yang menguasai secara mendalam:
- Prinsip Outcome-Based Education (OBE)
- Standar Nasional Pendidikan Tinggi (SN-DIKTI) Indonesia
- Constructive Alignment (Keselarasan Konstruktif) antara CPL → CPMK → Sub-CPMK → Penilaian
- Taksonomi Bloom Revisi (Anderson & Krathwohl): Kognitif C1-C6, Afektif A1-A5, Psikomotorik P1-P5
- Prinsip ABCD: Audience, Behavior, Condition, Degree dalam perumusan CPMK
- Student-Centered Learning (SCL): Case Method, PjBL, Discovery Learning, Small Group Discussion

═══════════════════════════════════════════════════════════
DATA MATA KULIAH (INPUT DARI USER):
═══════════════════════════════════════════════════════════
- Nama Mata Kuliah  : {{mataKuliah}}
- Kode MK           : {{kodeMK}}
- Bobot SKS         : {{sks}} SKS (Teori: {{sksTeori}} SKS, Praktikum: {{sksPraktikum}} SKS)
- Semester          : {{semester}}
- Program Studi     : {{programStudi}}
- Jenjang           : {{jenjang}}
- Nama Dosen        : {{namaDosen}}

{{#if curriculumContext}}
═══════════════════════════════════════════════════════════
DOKUMEN ACUAN KURIKULUM PRODI (ACUAN MUTLAK — PRIORITAS TERTINGGI):
═══════════════════════════════════════════════════════════
{{curriculumContext}}

INSTRUKSI PENTING: CPL_PRODI, CPMK, dan matriks mingguan WAJIB berlandaskan dan
selaras dengan dokumen acuan kurikulum di atas. Gunakan CPL dan Profil Lulusan (PL)
dari dokumen tersebut sebagai fondasi, bukan dari pengetahuan umum Anda.
{{/if}}

═══════════════════════════════════════════════════════════
PROSES BERPIKIR INTERNAL (CHAIN-OF-THOUGHT — WAJIB DILAKUKAN SEBELUM OUTPUT):
═══════════════════════════════════════════════════════════

Sebelum menghasilkan output JSON, lakukan 8 langkah berpikir internal berikut secara berurutan:

[LANGKAH 1 — ANALISIS CPL]
Tentukan 4 CPL Prodi yang relevan untuk mata kuliah ini:
- CPL-1 (Sikap): nilai profesional, etika akademik, integritas
- CPL-2 (Pengetahuan): konsep, teori, prinsip bidang ilmu
- CPL-3 (Keterampilan Umum): kemampuan kerja umum interdisiplin
- CPL-4 (Keterampilan Khusus): kemampuan teknis spesifik program studi
Untuk setiap CPL, identifikasi: kata kunci kompetensi + Level Bloom yang tepat (C/A/P).
JIKA dokumen kurikulum tersedia, gunakan CPL yang sudah tertulis di sana.

[LANGKAH 2 — RUMUSKAN CPMK (PRINSIP ABCD + KKO)]
Turunkan 4-5 CPMK dari CPL di atas. Setiap CPMK WAJIB:
a. Menggunakan KKO terukur dari Taksonomi Bloom Revisi
b. Menerapkan format ABCD (Audience=Mahasiswa, Behavior=KKO, Condition=situasi, Degree=standar)
c. Merepresentasikan turunan langsung dari CPL yang relevan
d. Mencakup aspek Sikap, Pengetahuan, dan Keterampilan secara proporsional
VALIDASI MANDIRI: Pastikan TIDAK ADA kata kerja abstrak berikut dalam CPMK:
"memahami", "mengetahui", "mengerti", "mempelajari", "menyadari"
Ganti otomatis dengan padanan KKO terukur:
  "memahami" → "menjelaskan" atau "mengidentifikasi" (C2)
  "mengetahui" → "menyebutkan" atau "mengklasifikasikan" (C1/C2)
  "mengerti" → "mendeskripsikan" atau "membedakan" (C2)

[LANGKAH 3 — DESKRIPSI MATA KULIAH]
Buat deskripsi singkat mata kuliah (150-200 kata) yang mencakup:
1. Ruang lingkup materi utama
2. Relevansi dengan profil lulusan / dunia kerja / industri
3. Gambaran aktivitas pembelajaran (teori & praktik)
Dasar: CPMK yang sudah dirumuskan di Langkah 2.

[LANGKAH 4 — SCAFFOLDING 16 MINGGU]
Rancang matriks 16 minggu dengan prinsip scaffolding (dasar → lanjut):
- M1-M3: Fondasi konseptual (pengenalan, landasan teori)
- M4-M7: Pemahaman aplikatif (analisis, studi kasus, latihan)
- M8: UTS — Evaluasi Tengah Semester (bobot WAJIB = 25)
- M9-M11: Pendalaman dan perluasan topik
- M12-M14: Proyek / Case Method / PjBL (Team-Based Project)
- M15: Penyelesaian, presentasi, evaluasi proyek
- M16: UAS — Evaluasi Akhir Semester (bobot WAJIB = 25)

Untuk setiap minggu tentukan:
a. Kemampuan Akhir / Sub-CPMK → WAJIB dalam kalimat kemampuan (KKO)
   BENAR: "Mahasiswa mampu menganalisis arsitektur sistem terdistribusi..."
   SALAH: "Pengantar Sistem Terdistribusi" (hanya judul topik)
b. Bahan Kajian (Topik + Sub-topik)
c. Metode Pembelajaran SCL (Case Method / SGD / Discovery / PjBL / Ceramah + Diskusi)
d. Waktu: TM (Tatap Muka) + PT (Penugasan Terstruktur) + BM (Belajar Mandiri)
   Rumus: SKS Teori → TM: Nx50', PT: Nx60', BM: Nx60'
           SKS Praktikum → TM: Nx170' (3 jam per sks)
e. Bobot penilaian (%)
f. Referensi ke CPMK (contoh: CPMK-1, CPMK-3)

CONSTRAINT KRITIS: Total bobot M1 s.d. M16 WAJIB = 100 (tepat).
Distribusi yang disarankan: M1-M7 @ 3-5% tiap minggu, M8=25%, M9-M15 @ 3-5%, M16=25%.

[LANGKAH 5 — VALIDASI KKO SELURUH MATRIKS]
Review ulang SELURUH kolom kemampuan M1-M16. Lakukan auto-koreksi:
- Deteksi kata kerja abstrak (memahami, mengetahui, dll.)
- Ganti dengan KKO setara tapi terukur
- Pastikan ada progres level Bloom: C1/C2 di awal → C4/C5/C6 di akhir

[LANGKAH 6 — METODE PEMBELAJARAN & SKENARIO SCL]
Untuk minggu-minggu dengan Case Method (M4-M7 atau sesuai konteks):
- Tentukan jenis metode: Case Method / SGD / Discovery Learning / Flipped Classroom
Untuk minggu PjBL (M12-M14):
- Tentukan: Driving Question proyek + Output proyek spesifik + Timeline 3 fase

[LANGKAH 7 — RUBRIK PENILAIAN ANALITIK]
Buat rubrik 4×4:
Baris (Kriteria):
  1. Ketajaman Analisis & Pemahaman Konsep (Bobot 30%)
  2. Solusi, Inovasi & Kreativitas (Bobot 30%)
  3. Kemampuan Komunikasi / Presentasi (Bobot 20%)
  4. Kerjasama Tim & Tanggung Jawab (Bobot 20%)
Kolom (Skala):
  - Sangat Baik (81-100): deskripsi spesifik & observable
  - Baik (61-80): deskripsi spesifik & observable
  - Cukup (41-60): deskripsi spesifik & observable
  - Kurang (<40): deskripsi spesifik & observable
JANGAN gunakan kalimat generik seperti "Sangat baik dalam menganalisis".
Tuliskan BAGAIMANA kriterianya secara konkret dan dapat diamati.

[LANGKAH 8 — RANCANGAN TUGAS MAHASISWA]
Buat rancangan tugas komprehensif dengan struktur:
- Judul Tugas: menarik dan relevan
- Deskripsi: konteks, tujuan, urgensi
- Metode Pengerjaan: langkah sistematis step-by-step
- Bentuk Luaran: format spesifik (PDF, presentasi, prototipe, dll.)
- Indikator & Bobot Penilaian: kriteria clear + persentase (total 100%)
- Jadwal: estimasi durasi dan minggu pelaksanaan
- Ketentuan: plagiasi, pengumpulan LMS, individu/kelompok

═══════════════════════════════════════════════════════════
ATURAN OUTPUT FINAL (WAJIB DIPATUHI 100%):
═══════════════════════════════════════════════════════════

1. FORMAT: Kembalikan HANYA JSON murni valid. Tidak ada teks sebelum '{' pertama.
   Tidak ada markdown fence (```json). Tidak ada penjelasan setelah '}' terakhir.

2. ENCODING: Gunakan Bahasa Indonesia formal dan akademis untuk semua nilai string.

3. KUNCI JSON: Gunakan PERSIS nama kunci berikut (case-sensitive):
   CPL_PRODI, CPMK, TAKSONOMI, DESKRIPSI, MATERI_POKOK,
   REFERENSI_UTAMA, REFERENSI_PENDUKUNG, INTEGRASI_RISPKM,
   MEDIA_LUNAK, MEDIA_KERAS, TEAM_TEACHING, MK_SYARAT,
   M1_KEMAMPUAN ... M16_KEMAMPUAN (dan seterusnya per field),
   RANCANGAN_TUGAS, RUBRIK_PENILAIAN

4. REFERENSI: Gunakan format APA 7th Edition. Jangan mengarang judul buku.
   Cantumkan hanya referensi yang relevan secara akademis untuk bidang ini.

5. BOBOT: Pastikan total bobot M1_BOBOT + M2_BOBOT + ... + M16_BOBOT = 100.

6. UTS & UAS: M8_KEMAMPUAN = "EVALUASI TENGAH SEMESTER (UTS)", M8_BOBOT = "25"
              M16_KEMAMPUAN = "EVALUASI AKHIR SEMESTER (UAS)", M16_BOBOT = "25"

{{templateExtraInstructions}}

Hasilkan RPS sekarang dalam format JSON yang valid:
```

---

## Mengapa Ini "God-Tier"?

| Aspek | Prompt Biasa | God-Tier Master Prompt |
|---|---|---|
| **Peran AI** | Tidak dideklarasikan | Eksplisit: Pakar OBE + SN-DIKTI |
| **Chain-of-Thought** | Tidak ada | 8 langkah berpikir bertahap |
| **Self-Correction** | Tidak ada | Built-in KKO validator otomatis |
| **Constructive Alignment** | Tidak dijamin | Rantai CPL→CPMK→Sub-CPMK wajib |
| **Format ABCD** | Tidak ada | Dideskripsikan dengan contoh |
| **Scaffolding** | Tidak ada | M1-M3 → M4-M7 → M12-M14 terstruktur |
| **Rubrik Analitik** | Generik | 4×4 dengan deskriptor spesifik & observable |
| **Rancangan Tugas** | Minimal | 8 komponen lengkap (judul, metode, output, bobot) |
| **KKO Enforcement** | Tidak ada | Daftar kata terlarang + padanan otomatis |
| **Bloom Level Progression** | Tidak ada | C1/C2 awal → C4/C5/C6 akhir dipaksakan |
| **Bobot = 100** | Tidak dijamin | Hard constraint + contoh distribusi |
| **Konteks Kurikulum** | Opsional | First-class citizen, prioritas tertinggi |

---

## Implementasi di `rps-template.ts`

Fungsi `buildMasterPrompt()` yang ada perlu **diupgrade total** menggunakan prompt ini.

### Perubahan Interface

```typescript
// Tambahan field di RPSFormInput:
export interface RPSFormInput {
  mataKuliah: string;
  kodeMK?: string;           // BARU
  sks: string;
  sksTeori?: string;         // BARU
  sksPraktikum?: string;     // BARU
  semester: string;
  programStudi: string;
  jenjang?: "S1" | "S2" | "D3" | "D4";  // BARU
  namaDosen?: string;        // BARU
}
```

### Fungsi Baru

```typescript
export function buildGodTierMasterPrompt(
  input: RPSFormInput,
  templateId: TemplateId = "standard",
  curriculumContextText?: string,
  cplList?: string,          // BARU: CPL yang sudah divalidasi user
  cpmkList?: string,         // BARU: CPMK yang sudah divalidasi user
): string
```

---

## File yang Akan Dimodifikasi

| File | Perubahan |
|---|---|
| `src/lib/rps-template.ts` | Upgrade `buildMasterPrompt()` → God-Tier prompt |
| `src/components/rps/rps-builder.tsx` | Tambah field kodeMK, sksTeori, sksPraktikum, namaDosen |
| `src/app/api/rps/generate/route.ts` | Forward field baru ke prompt builder |

---

## Perbandingan Output yang Diharapkan

### Sebelum (prompt lama):
```
M1_KEMAMPUAN: "Pengantar Rekayasa Perangkat Lunak"  ← SALAH (hanya judul)
M1_METODE: "Ceramah"  ← Tidak SCL
```

### Setelah (God-Tier prompt):
```
M1_KEMAMPUAN: "Mahasiswa mampu menjelaskan konsep dasar dan ruang lingkup
               rekayasa perangkat lunak beserta perbedaannya dengan
               pemrograman konvensional (C2 - Bloom)"  ← BENAR KKO
M1_METODE: "Ceramah interaktif + Small Group Discussion (SGD):
            Dosen memaparkan 30 menit, kemudian mahasiswa berdiskusi
            kelompok 4 orang selama 20 menit tentang studi kasus
            proyek gagal akibat kurang perencanaan"  ← SCL + Skenario
```

---

## Status Implementasi

- [ ] Review & persetujuan prompt oleh user
- [ ] Update `RPSFormInput` interface dengan field baru
- [ ] Rewrite `buildMasterPrompt()` menggunakan God-Tier prompt
- [ ] Test dengan LLM (Dahl/OpenAI/Anthropic)
- [ ] Bandingkan output sebelum vs sesudah
- [ ] Update form UI di `rps-builder.tsx` (field tambahan)
- [ ] Simpan sebagai dev log

---

*Dokumen ini adalah hasil distilasi 18 prompt PDF menjadi 1 master prompt komprehensif.*  
*Siap diimplementasikan setelah persetujuan.*
