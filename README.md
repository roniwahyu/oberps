# 🚀 Oberps - Outcome-Based Education RPS Generator System

<p align="center">
  <img src="public/globe.svg" width="80" alt="Oberps Logo" />
</p>

<p align="center">
  <b>Sistem Pembangkit Rencana Pembelajaran Semester (RPS) Berbasis Outcome-Based Education (OBE) & SN-DIKTI</b>
</p>

<p align="center">
  <a href="#-fitur-unggulan"><img src="https://img.shields.io/badge/Framework-Next.js%2016%20Turbopack-black?style=for-the-badge&logo=next.js" alt="Next.js 16" /></a>
  <a href="#-fitur-unggulan"><img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  <a href="#-fitur-unggulan"><img src="https://img.shields.io/badge/Styling-TailwindCSS%20v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" /></a>
  <a href="#-fitur-unggulan"><img src="https://img.shields.io/badge/AI_Engine-Dahl_Global%20%2B%20Puter.js-indigo?style=for-the-badge&logo=openai" alt="AI Engine" /></a>
</p>

---

## 📌 Ringkasan Sistem

**Oberps** adalah platform pintar penyusun Rencana Pembelajaran Semester (RPS) berbasis **Outcome-Based Education (OBE)** yang mengimplementasikan standar **SN-DIKTI** dan prinsip *Constructive Alignment*. 

Aplikasi ini menggunakan arsitektur AI *Chain-of-Thought (CoT)* untuk mentransformasikan kurikulum institusi menjadi dokumen RPS yang presisi, mencakup Capaian Pembelajaran Lulusan (CPL), Sub-CPMK, matriks taksonomi Bloom, rencana scaffolding mingguan (M1-M16) dengan bobot 100%, desain *Project-Based Learning (PjBL)* / *Case Method*, dan rubrik analitik 4x4.

---

## ✨ Fitur Unggulan

### 1. 🧙‍♂️ Interactive 9-Step OBE Wizard Engine
- **Step 1: Identitas MK**: Pengisian Nama MK, Kode, SKS Teori/Praktikum, Semester, Prodi, dan Tim Dosen.
- **Step 2: Acuan Kurikulum XLSX**: Impor spreadsheet kurikulum institusi (`Implementasi_Modul_OBE*.xlsx`) untuk auto-populate CPL & Profil Lulusan.
- **Step 3: Seleksi CPL Dibebankan**: Pilihan CPL prodi berstandar SN-DIKTI.
- **Step 4: Formulasi CPMK & Validasi KKO**: KKO Validator Anderson-Krathwohl terintegrasi (mendeteksi & memperingatkan kata kerja tak terukur seperti *memahami* / *mengetahui*).
- **Step 5: Taksonomi Bloom Matrix**: Pemetaan level kognitif C3-C6 (Analisis, Evaluasi, Kreasi).
- **Step 6: Scaffolding Mingguan (M1-M16) & Kalkulator Bobot 100%**: Penyeimbang bobot otomatis real-time.
- **Step 7: Rancangan PjBL / Case Method**: Skenario proyek 3 fase & *Driving Questions*.
- **Step 8: Rubrik Analitik 4x4**: Kriteria & deskriptor level penilaian (Sangat Baik, Baik, Cukup, Kurang).
- **Step 9: Review & Trigger AI**: Generasi instan berakurasi tinggi.

### 2. 🔀 Dwi-Flow Form Selection (Wizard vs Klasik)
- Pengaturan alur formulir dari lingkungan `.env` (`NEXT_PUBLIC_RPS_FLOW=wizard` vs `FLOW=classic`).
- Bento Header Toolbar dengan toggle pill instan untuk kemudahan navigasi dosen.

### 3. ⚡ Multi-LLM Engine & Auto-Key Rotation
- **Primary Engine**: Dahl Global API (`MiniMaxAI/MiniMax-M2.7`) dengan rotasi otomatis 3 API Keys (`DAHL_KEY_1`, `DAHL_KEY_2`, `DAHL_KEY_3`).
- **Fallback Engine**: Puter.js browser AI gratis (`claude-3-7-sonnet`, `gpt-4o`, `deepseek-reasoner`).
- **Offline Engine**: Standalone Mock Generator untuk penggunaan tanpa koneksi internet.

### 4. 🎨 Redesign Modern Bento Grid UI & Main Navbar
- Header Glassmorphism dengan tab animasi *Framer Motion*, indicator status active LLM, dan *Mobile Drawer Overlay Menu*.
- Layout Bento Grid responsif & Modal Ultra Full Wide (**1500px / 96% viewport width**).

### 5. 📄 Viewer, Matrix Editor & Database Persistence
- Pratinjau cetak RPS siap pakai PDF/HTML.
- Modal penyunting matriks mingguan (M1-M16).
- Database SQLite internal dengan dukungan API CRUD (`create`, `list`, `duplicate`, `search`, `batch delete`), pencarian global (`Ctrl+Shift+F`), dan *URL Share Base64 Payload*.

---

## 🛠️ Teknologi Stack

| Komponen | Teknologi |
|:---|:---|
| **Core Framework** | Next.js 16.3.0 (Turbopack) |
| **Language** | TypeScript 5+ |
| **Styling** | Tailwind CSS v4 + Shadcn UI (New York) + Framer Motion |
| **Database** | SQLite Native (`custom.db`) + Prisma ORM |
| **AI Integration** | Dahl Global API + Puter.js AI SDK + Custom CoT Master Prompt |

---

## 📜 Sejarah Log Pengembangan (Development History Log)

| Tanggal | Versi | Rilis / Milestone | Ringkasan Aktivitas Utama | Referensi Dokumen |
|:---|:---:|:---|:---|:---|
| **07-08-2026** | `v1.0` | **Inisialisasi Foundation & Engine Core** | Inisialisasi arsitektur Next.js 16, SQLite Native, Prisma ORM, arsitektur dasar generator RPS OBE, dan pustaka preset MK. | [`docs/0001_dev_log_07082026.md`](file:///d:/laragon/www/oberps/docs/0001_dev_log_07082026.md) |
| **08-08-2026** | `v1.2` | **Integrasi Dahl API & Puter.js Fallback** | Integrasi Dahl API (`MiniMaxAI/MiniMax-M2.7`) dengan rotasi 3 API Key, fallback Puter.js free browser AI, dan penanganan CoT `<think>` stripping. | [`docs/0004_puter_fallback_08082026.md`](file:///d:/laragon/www/oberps/docs/0004_puter_fallback_08082026.md) |
| **08-08-2026** | `v1.5` | **God-Tier Master Prompt & SN-DIKTI Validated** | Ujicoba Master Prompt CoT untuk MK Struktur Data (STI207), validasi bobot M1-M16 100.0% presisi, dan pembuktian ekspor markdown/JSON. | [`docs/0006_godtier_master_prompt_08082026.md`](file:///d:/laragon/www/oberps/docs/0006_godtier_master_prompt_08082026.md) |
| **08-08-2026** | `v1.8` | **Interactive 9-Step Wizard & Modern Bento Grid** | Pembangunan komponen Wizard 9-Step (`wizard-flow.tsx`), KKO Validator Anderson-Krathwohl, penyetelan flow `.env`, dan redesign layout Bento Grid. | [`docs/0011_implementation_plan_wizard_08082026.md`](file:///d:/laragon/www/oberps/docs/0011_implementation_plan_wizard_08082026.md) |
| **08-08-2026** | `v1.9` | **Resolusi Hydration, Script Warning & Full Wide Modal** | Eliminasi warning React 19 `<Script>`, penanganan *Hydration Mismatch* `curriculum-uploader.tsx`, dan pembukaan modal *Full Wide* 1500px (`dialog.tsx`). | [`docs/0014_dev_log_08082026.md`](file:///d:/laragon/www/oberps/docs/0014_dev_log_08082026.md) |
| **09-08-2026** | `v1.9.1` | **Master Feature Catalog & Centralized Docs** | Penyusunan katalog fitur lengkap, konsolidasi seluruh dokumentasi ke folder `docs/`, dan pembaruan master `README.md`. | [`docs/0017_master_feature_catalog_09082026.md`](file:///d:/laragon/www/oberps/docs/0017_master_feature_catalog_09082026.md) |
| **09-08-2026** | `v1.9.2` | **Agentic Template, Security Audit & Final Summary** | Implementasi tag template `{{ }}` & `[[ ]]`, audit keamanan 0 hardcoded key, pembuatan `godtier_master_prompt.prompt`, dan rangkuman aktivitas. | [`docs/0018_master_session_summary_09082026.md`](file:///d:/laragon/www/oberps/docs/0018_master_session_summary_09082026.md) |
| **09-08-2026** | `v2.0` | **PRD for Agentic AI OBE RPS Applications** | Penyusunan dokumen PRD lengkap berbasis `PROMPT*.pdf` & `Implementasi_Modul_OBE*.xlsx` untuk pengembangan agen AI otonom. | [`docs/0019_prd_agentic_ai_obe_rps.md`](file:///d:/laragon/www/oberps/docs/0019_prd_agentic_ai_obe_rps.md) |
| **09-08-2026** | `v3.1` | **Modular API-Driven 13-Sheet Excel Curriculum Exporter** | Implementasi modul kurikulum OBE, mesin generator 13-sheet Excel (`excel-generator.ts`), API `/api/curriculum/export`, dan `CurriculumExporterDialog`. | [`docs/0021_dev_report_09082026.md`](file:///d:/laragon/www/oberps/docs/0021_dev_report_09082026.md) |
| **09-08-2026** | `v3.1.1` | **Resolusi Hydration Mismatch & React 19 Script Warning** | Penanganan `scriptProps` pada `ThemeProvider` & guard `useEffect` pada `curriculumContext` (`rps-builder.tsx`). | [`docs/0023_dev_log_09082026.md`](file:///d:/laragon/www/oberps/docs/0023_dev_log_09082026.md) |

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat System
- Node.js v18.x atau v20.x
- npm atau bun / pnpm

### 2. Konfigurasi Lingkungan (`.env`)
Buat atau sesuaikan berkas `.env` di direktori utama:

```env
# Server Port & Mode
PORT=3000
NODE_ENV=development

# Setup Flow Form: wizard atau classic
NEXT_PUBLIC_RPS_FLOW=wizard
FLOW=wizard

# Dahl API Keys & Rotasi (Ganti dengan API Key milik Anda)
DAHL_KEY_1=your_dahl_api_key_1_here
DAHL_KEY_2=your_dahl_api_key_2_here
DAHL_KEY_3=your_dahl_api_key_3_here
```

### 3. Instalasi & Jalankan Server Lokal

```bash
# 1. Install dependensi
npm install

# 2. Jalankan server pengembangan (Dev Mode)
npm run dev

# 3. Pengujian Tipe & Production Build
npx tsc --noEmit
npm run build
```

Aplikasi dapat diakses melalui browser di `http://localhost:3000`.

---

## 📚 Indeks Dokumentasi (`docs/`)

Seluruh dokumen catatan teknis, laporan pengembangan, dan peta jalan tersimpan rapi di direktori [`docs/`](file:///d:/laragon/www/oberps/docs):

- 📄 [0023_dev_log_09082026.md](file:///d:/laragon/www/oberps/docs/0023_dev_log_09082026.md) - Catatan Resolusi Hydration Mismatch & React 19 Script Warning
- 📘 [0019_prd_agentic_ai_obe_rps.md](file:///d:/laragon/www/oberps/docs/0019_prd_agentic_ai_obe_rps.md) - **Master Product Requirement Document (PRD) for Agentic AI (v3.1.0 Enterprise)**
- 📄 [0021_dev_report_09082026.md](file:///d:/laragon/www/oberps/docs/0021_dev_report_09082026.md) - Laporan Implementasi 13-Sheet Excel Curriculum Exporter
- 📄 [0020_dev_log_09082026.md](file:///d:/laragon/www/oberps/docs/0020_dev_log_09082026.md) - Catatan Kronologis Pengembangan Modul Kurikulum
- 📄 [0022_dev_plan_09082026.md](file:///d:/laragon/www/oberps/docs/0022_dev_plan_09082026.md) - Rencana Pengembangan Lanjutan (Phase 4.0 Roadmap)
- 📄 [0018_master_session_summary_09082026.md](file:///d:/laragon/www/oberps/docs/0018_master_session_summary_09082026.md) - Ringkasan Rangkaian Aktivitas Pengembangan Kompleks
- 📄 [0017_master_feature_catalog_09082026.md](file:///d:/laragon/www/oberps/docs/0017_master_feature_catalog_09082026.md) - Katalog Fitur Lengkap Sistem Oberps
- 📄 [godtier_master_prompt.prompt](file:///d:/laragon/www/oberps/docs/godtier_master_prompt.prompt) - Standalone Prompt Template File (Standard Mustaches)
- 📄 [0006_godtier_master_prompt_08082026.md](file:///d:/laragon/www/oberps/docs/0006_godtier_master_prompt_08082026.md) - Spesifikasi CoT Master Prompt SN-DIKTI

---

<p align="center">
  <b>Developed with ❤️ for Academic Excellence & Outcome-Based Education</b>
</p>
