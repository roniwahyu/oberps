# 0005 - Implementation Plan: Step-by-Step RPS OBE Wizard
**Nomor:** 0005  
**Tanggal:** 08 Agustus 2026  
**Topik:** Wizard Interaktif 9-Step Generate RPS OBE Berbasis MASTER PROMPT PDF  
**Status:** DRAFT — Menunggu Persetujuan  
**Referensi:** `PROMPT - BUAT RPS OBE With AI (1).pdf` (8 halaman, 18 prompt)

---

## Tujuan

Mengimplementasikan **wizard interaktif berbasis PROMPT PDF** untuk menghasilkan RPS OBE yang lebih tepat dan terarah — menggantikan alur "isi form → klik buat" menjadi proses **guided step-by-step** sesuai 18 Prompt dalam dokumen *"BUAT RPS OBE With AI"*.

Wizard mendukung upload dokumen acuan kurikulum dalam format **XLSX, CSV, PDF, MD** (contoh: `Implementasi_Modul_OBE_S1_SISTEKIN_UWG_2025.xlsx`) sebagai konteks CPL, CPMK, dan PL institusi.

---

## Analisis MASTER PROMPT PDF (18 Prompt → 9 Wizard Step)

PDF berisi panduan 18 prompt bertahap untuk membuat RPS OBE yang memiliki **Constructive Alignment** (Keselarasan Konstruktif). Pemetaan ke wizard step:

| No | Prompt PDF | Tujuan | Wizard Step |
|---|---|---|---|
| 1 | Setting peran AI sebagai Pakar Kurikulum OBE + SN-DIKTI | Inisialisasi konteks | AUTO (system prompt) |
| 2 | Validasi pemahaman AI tentang Constructive Alignment | Cek kesiapan AI | AUTO (hidden) |
| 3 | Konfirmasi data mata kuliah & prodi | Identitas MK | **Step 1** |
| 4 | Input CPL Prodi + analisis Level Bloom | CPL dari kurikulum | **Step 3** |
| 5 | Rumuskan 4-5 CPMK dari CPL (prinsip ABCD + KKO) | CPMK | **Step 4** |
| 6 | Buat Deskripsi Singkat Mata Kuliah (150-200 kata) | Deskripsi MK | **Step 5** |
| 7 | Turunkan Sub-CPMK 16 Minggu (Scaffolding + KKO) | Peta Kompetensi | **Step 6** |
| 8 | Revisi SKS Teori vs Praktikum per minggu | Adjustment waktu | **Step 6 lanjut** |
| 9-10 | Wake-up call / konteks ulang | Context refresh | AUTO |
| 10b | Self-koreksi KKO — ganti kata abstrak → KKO terukur | QA Otomatis | AUTO (post-step 6) |
| 11 | Referensi buku dari file terlampir | Daftar Pustaka | **Step 7** |
| 12 | Skenario Case Method per minggu | Metode Pembelajaran | **Step 6 + detail** |
| 13 | Rancangan Team-Based Project (PjBL) Minggu 12-14 | Proyek mahasiswa | **Step 6 + detail** |
| 14 | Rubrik Penilaian Analitik (4 kriteria, 4 skala) | Rubrik | **Step 8** |
| 16 | Bank Soal Kuis (C2-C4, pilgan + esai) | Bank Soal | **Step 9 (opsional)** |
| 17 | Detail rencana per minggu (indikator, metode, waktu) | Detail Mingguan | **Step 6 + Step 8** |
| 18 | Rencana Tugas Mahasiswa (Driving Question + PjBL) | Rancangan Tugas | **Step 8 lanjut** |

---

## Prinsip OBE yang Harus Diterapkan (dari PDF)

### Constructive Alignment
- **CPL** → diturunkan ke **CPMK** → diturunkan ke **Sub-CPMK** per minggu
- Setiap Sub-CPMK selaras dengan **metode pembelajaran** dan **metode penilaian**
- Rantai: CPL ↔ CPMK ↔ Sub-CPMK ↔ Indikator ↔ Teknik Penilaian

### KKO (Kata Kerja Operasional) — Taksonomi Bloom Revisi
- WAJIB terukur: `menganalisis`, `menjelaskan`, `merancang`, `mengimplementasikan`, `mengidentifikasi`
- DILARANG: `memahami`, `mengetahui`, `mengerti`, `mempelajari`
- Tingkatan: **C1** (Mengingat) → **C6** (Mencipta), **A1-A5** (Afektif), **P1-P5** (Psikomotorik)

### Format ABCD untuk CPMK
- **A** = Audience (mahasiswa)
- **B** = Behavior (KKO terukur)
- **C** = Condition (konteks/situasi)
- **D** = Degree (standar ketercapaian)

### Scaffolding Matriks 16 Minggu
- M1-M7: Konten bertingkat dari dasar ke lanjut
- M8: UTS (bobot 25%)
- M9-M15: Lanjutan konten + proyek/case
- M16: UAS (bobot 25%)
- Total bobot M1-M16 = **100%** (wajib tepat)

---

## Arsitektur Wizard (9 Step)

```
Step 1: Identitas Mata Kuliah
  Input: Nama MK, Kode MK, SKS Total, SKS Teori, SKS Praktikum,
         Semester, Program Studi, Jenjang (S1/S2/D3/D4), Nama Dosen

Step 2: Upload Dokumen Acuan Kurikulum (OPSIONAL — Sangat Direkomendasikan)
  Input: File XLSX / CSV / PDF / MD
  Contoh: implementasi_modul_OBE.xlsx, buku_panduan_kurikulum.pdf
  Output AI: Ekstrak PL (Profil Lulusan), CPL, CPMK per dokumen
  → Jika tidak upload: user input CPL manual di Step 3

Step 3: CPL Prodi (Capaian Pembelajaran Lulusan)
  Tampil: CPL dari dokumen (jika ada) ATAU form input manual
  AI Call: Analisis Level Bloom per CPL (C/A/P level)
  Output: Tabel | Kode CPL | Rumusan CPL | Domain | Level Bloom |
  User: Review & edit sebelum lanjut

Step 4: CPMK (Capaian Pembelajaran Mata Kuliah)
  AI Call (Prompt 5): Generate 4-5 CPMK dari CPL (prinsip ABCD + KKO)
  Output: Tabel | Kode CPL | Rumusan CPMK | Level Bloom | Condition & Degree |
  Validasi: Auto-check KKO (warn jika ada kata abstrak)
  User: Edit inline, tambah/hapus baris

Step 5: Deskripsi Singkat & Materi Pokok
  AI Call (Prompt 6): Generate deskripsi 150-200 kata dari CPMK
  Output: Deskripsi MK, Materi Pokok (list), Media Pembelajaran, MK Prasyarat

Step 6: Matriks 16 Minggu (Sub-CPMK + Metode + Waktu)
  AI Call (Prompt 7-8 + 10 + 12-13 + 17):
    - Sub-CPMK tiap minggu (KKO, scaffolding)
    - Bahan Kajian (Topik + Sub-topik)
    - Metode Pembelajaran (SCL: SGD, Case Method, PjBL, Discovery)
    - Waktu: TM / PT / BM (sesuai SKS)
    - Ref ke CPMK
    - Bobot (%)
    - Auto-koreksi KKO (Prompt 10)
  Output: Tabel 16 baris editable inline
  Constraint: M8=UTS(25%), M16=UAS(25%), Total=100%

Step 7: Referensi & Daftar Pustaka
  Input: Upload file daftar buku / input manual
  AI Call (Prompt 11): Petakan buku ke minggu yang relevan
  Output: Tabel referensi per minggu + referensi utama & pendukung global

Step 8: Rubrik Penilaian & Rancangan Tugas
  AI Call (Prompt 14 + 18):
    - Rubrik Analitik 4x4:
        Baris: Ketajaman Analisis (30%), Solusi & Inovasi (30%),
               Komunikasi/Presentasi (20%), Kerjasama Tim (20%)
        Kolom: Sangat Baik (81-100) | Baik (61-80) | Cukup (41-60) | Kurang (<40)
    - Rancangan Tugas: Judul, Deskripsi, Metode Pengerjaan, Bentuk Luaran,
      Indikator & Bobot, Jadwal, Ketentuan (plagiasi, LMS, dll.)
  User: Edit & finalisasi

Step 9: Review Final & Generate RPS
  Tampil: Preview lengkap semua data wizard
  Generate: Compose semua context → Final JSON RPS (schema rps-template.ts)
  AI Call (Final): buildFinalRPSPrompt() → JSON lengkap 16 minggu
  Actions: Simpan ke DB | Export PDF | Export DOCX | Kembali Edit
```

---

## Struktur File yang Akan Dibuat / Diubah

### Komponen Baru — `src/components/rps/wizard/`

```
wizard/
├── rps-wizard.tsx               # Controller utama, state machine 9-step
├── wizard-progress.tsx          # Step indicator + progress bar horizontal
├── wizard-nav.tsx               # Tombol Prev / Next / Generate AI
├── step-1-identity.tsx          # Form identitas mata kuliah
├── step-2-curriculum-upload.tsx # Drag-drop upload XLSX/CSV/PDF/MD + preview
├── step-3-cpl.tsx               # Tabel CPL + AI analisis Bloom
├── step-4-cpmk.tsx              # Tabel CPMK editable + validasi KKO
├── step-5-deskripsi.tsx         # Deskripsi MK + Materi Pokok
├── step-6-matriks.tsx           # Tabel 16 minggu editable inline
├── step-7-referensi.tsx         # Upload/input referensi + AI petakan
├── step-8-rubrik.tsx            # Rubrik 4x4 + Rancangan Tugas
└── step-9-review.tsx            # Preview final + tombol Generate & Save
```

### Library Baru — `src/lib/`

```
wizard-prompt-builder.ts         # Semua builder prompt per-step
wizard-context.ts                # TypeScript interfaces WizardContext & step data
kko-validator.ts                 # Validator KKO Taksonomi Bloom (kata abstrak checker)
curriculum-parser.ts             # Parser XLSX/CSV/PDF/MD untuk ekstrak CPL/CPMK
```

### API Route Baru — `src/app/api/rps/`

```
wizard/route.ts                  # POST — stream AI response per-step wizard
curriculum-extract/route.ts      # POST — upload file, ekstrak CPL/CPMK server-side
```

### Modifikasi File Existing

```
src/app/page.tsx                 # Tambah tab/mode "Wizard" di samping "Builder"
src/components/rps/curriculum-uploader.tsx   # Perkuat parser XLSX/CSV kolom OBE
src/lib/rps-template.ts          # Perluas RPSFormInput untuk data wizard
```

---

## Data Flow Lengkap

```
[Upload XLSX/CSV/PDF/MD]
        |
        v
[API: curriculum-extract] --> [Parse: PL, CPL, CPMK list]
        |
        v
[Step 3: Tampil CPL] --> [AI: Bloom Analysis] --> [User Edit CPL]
        |
        v
[Step 4: AI draft CPMK] -- validasi KKO --> [User Edit CPMK]
        |
        v
[Step 5: AI Deskripsi] <-- [CPMK final]
        |
        v
[Step 6: AI 16-Minggu Matrix] <-- [CPMK + SKS + Mode Pembelajaran]
        |   AI self-koreksi KKO (Prompt 10)
        v
[Step 7: Referensi] --> [AI petakan ke minggu]
        |
        v
[Step 8: Rubrik + Rancangan Tugas]
        |
        v
[Step 9: Compose Final JSON RPS] --> [Save DB] --> [Export PDF/DOCX]
```

---

## Interface TypeScript Utama

```typescript
// src/lib/wizard-context.ts

export interface WizardStep1Data {
  mataKuliah: string;
  kodeMK: string;
  sksTotal: string;
  sksTeori: string;
  sksPraktikum: string;
  semester: string;
  programStudi: string;
  jenjang: "S1" | "S2" | "D3" | "D4";
  namaDosen: string;
  templateId: TemplateId;
}

export interface CPLItem {
  kode: string;          // e.g. "CPL-1"
  domain: "Sikap" | "Pengetahuan" | "Keterampilan Umum" | "Keterampilan Khusus";
  rumusan: string;       // Teks CPL
  bloomLevel: string;    // e.g. "C4", "A3", "P2"
}

export interface CPMKItem {
  kode: string;          // e.g. "CPMK-1"
  refCPL: string;        // e.g. "CPL-1, CPL-2"
  rumusan: string;       // Teks CPMK (KKO + ABCD)
  bloomLevel: string;    // e.g. "C4"
  condition: string;
  degree: string;
  isValid: boolean;      // false jika mengandung kata abstrak
}

export interface MatriksRow {
  minggu: number;
  kemampuan: string;     // Sub-CPMK dalam kalimat KKO
  materi: string;
  metode: string;
  waktu: string;         // "TM: 3x50', PT: 3x60', BM: 3x60'"
  refCPMK: string;
  bobot: number;         // integer, total M1-M16 = 100
  pengalaman: string;
  media: string;
  referensi: string;
}

export interface WizardContext {
  step1: WizardStep1Data;
  curriculumRaw: string;          // Raw text dari dokumen upload
  cplList: CPLItem[];
  cpmkList: CPMKItem[];
  deskripsi: string;
  materiPokok: string;
  referensiUtama: string;
  referensiPendukung: string;
  matriks: MatriksRow[];
  rubrik: string;
  rancanganTugas: string;
  currentStep: number;
  llmConfig: LLMConfig;
}
```

---

## Prompt Builder Utama

```typescript
// src/lib/wizard-prompt-builder.ts — ringkasan

buildWizardSystemPrompt()
// → "Bertindaklah sebagai Pakar Kurikulum OBE + SN-DIKTI. 
//    Kamu paham Constructive Alignment. Konfirmasi kesiapanmu."

buildCPLAnalysisPrompt(cplList, mataKuliah)
// → Prompt 4: Analisis Level Bloom per CPL + keyword kompetensi

buildCPMKPrompt(cplList, mataKuliah, sks)
// → Prompt 5: Rumuskan 4-5 CPMK (ABCD + KKO), output tabel JSON

buildDeskripsiPrompt(cpmkList, mataKuliah, programStudi)
// → Prompt 6: Deskripsi 150-200 kata + materi pokok

buildMatriksPrompt(cpmkList, sks, templateMode, curriculumCtx)
// → Prompt 7-8-10-17: 16 baris mingguan, scaffolding, KKO, waktu TM/PT/BM

buildRubrikPrompt(mataKuliah, cpmkList)
// → Prompt 14: Rubrik analitik 4x4 (JSON)

buildRancanganTugasPrompt(mataKuliah, topik, cpmk)
// → Prompt 18: Rencana tugas lengkap (JSON)

buildFinalRPSPrompt(context: WizardContext)
// → Compose semua data → Final JSON RPS sesuai schema rps-template.ts
```

---

## UX / UI Design Notes

- **Progress Bar**: Step indicator horizontal 1-9 dengan label singkat & status (done/active/pending)
- **AI Generate Button**: Tersedia per-step (bukan hanya di akhir wizard)
- **Editable Tables**: Tabel CPL, CPMK, Matriks 16 Minggu — edit inline (klik sel → input)
- **KKO Validator**: Highlight otomatis merah jika tabel mengandung kata abstrak
- **Context Panel (kanan)**: Ringkasan konteks yang sudah terkumpul (bisa collapse)
- **Auto-save Draft**: Setiap step tersimpan di `localStorage` (key: `smartrps_wizard_draft`)
- **Mode Toggle**: Header toggle antara **Wizard** (guided) dan **Builder** (expert cepat)
- **Streaming AI**: Setiap AI call bisa streaming agar UX lebih responsif
- **Puter.js Fallback**: Jika semua API LLM gagal, setiap step auto-fallback ke Puter.js

---

## Prioritas Implementasi

| Fase | Komponen | Prioritas |
|---|---|---|
| Fase 1 | `wizard-context.ts`, `wizard-prompt-builder.ts`, `kko-validator.ts` | TINGGI |
| Fase 1 | `rps-wizard.tsx` + `wizard-progress.tsx` + `wizard-nav.tsx` | TINGGI |
| Fase 1 | Step 1, 3, 4, 5, 6 (inti OBE) | TINGGI |
| Fase 2 | Step 2 (upload kurikulum) + `curriculum-extract/route.ts` | SEDANG |
| Fase 2 | Step 7 (referensi), Step 8 (rubrik) | SEDANG |
| Fase 3 | Step 9 (review + final generate) | TINGGI |
| Fase 3 | Export PDF/DOCX dari wizard | RENDAH |

---

## Open Questions (Perlu Keputusan)

1. **Wizard vs Builder**: Apakah wizard menggantikan atau melengkapi Builder saat ini?
   - Rekomendasi: **Melengkapi** — wizard = mode "guided", builder = mode "expert cepat"

2. **Per-step AI vs satu call di akhir**: Apakah setiap step memanggil AI terpisah?
   - Rekomendasi: **Per-step** — lebih responsif, user bisa review tiap tahap

3. **Format file referensi**: XLSX, CSV, PDF, MD semua didukung?
   - PDF perlu pymupdf di server-side API route
   - XLSX/CSV via SheetJS di klien

4. **Step opsional**: Step 7 (referensi) & Step 9b (bank soal) opsional atau wajib?
   - Rekomendasi: Opsional — bisa dilewati dengan tombol "Skip"

5. **Bahasa output**: Semua output AI tetap dalam Bahasa Indonesia?
   - Rekomendasi: Ya, sesuai standar SN-DIKTI

---

## Dokumen Terkait

- `PROMPT - BUAT RPS OBE With AI (1).pdf` — Master guide 18 prompt
- `Implementasi_Modul_OBE_S1_SISTEKIN_UWG_2025.xlsx` — Contoh data kurikulum
- `docs/prompt_pdf_extracted.txt` — Hasil ekstraksi teks PDF
- `src/lib/rps-template.ts` — Schema JSON RPS existing
- `src/components/rps/curriculum-uploader.tsx` — Upload kurikulum existing
- `src/lib/puter-generator.ts` — Puter.js fallback
- `0004_puter_fallback_08082026.md` — Dev log Puter.js fallback

---

*Dokumen ini dibuat sebagai konteks untuk pengembangan wizard interaktif SmartRPS Builder.*  
*Selanjutnya: Tunggu persetujuan → Mulai Fase 1 implementasi.*
