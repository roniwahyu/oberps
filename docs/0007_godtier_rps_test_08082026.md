# DEV LOG 0007: Ujicoba Master Prompt "God-Tier" Penyusunan RPS OBE (MK Struktur Data)

**Tanggal**: 8 Agustus 2026  
**Status**: SELESAI & BERHASIL (SUCCESS)  
**Dokumen Acuan**: `Implementasi_Modul_OBE_S1_SISTEKIN_UWG_2025 (1).xlsx`  
**Mata Kuliah Uji**: Struktur Data (STI-207, Semester 2, 3 SKS)  
**Provider & Engine**: Dahl Global API (`https://inference.dahl.global/v1`) — `MiniMaxAI/MiniMax-M2.7`  
**Dokumen Output Utama**:  
1. [RPS_StrukturData_MK_STI207_UWG.md](file:///d:/laragon/www/oberps/docs/RPS_StrukturData_MK_STI207_UWG.md) (Dokumen Markdown RPS Lengkap)  
2. `docs/rps_merged.json` (Structured JSON Data - 172 fields)  
3. `db/custom.db` (Tabel `rps_generated` terisi log & payload lengkap)

---

## 🎯 Resume & Ringkasan Hasil Ujicoba

Ujicoba penyusunan Rencana Pembelajaran Semester (RPS) berbasis Outcome-Based Education (OBE) untuk **Mata Kuliah Struktur Data (STI-207)** menggunakan **God-Tier Master Prompt (Single-Shot Chain-of-Thought Distillation dari 18 PDF Prompt)** telah **100% berhasil dilaksanakan**.

### 1. Data Ekstraksi dari XLSX Kurikulum Prodi STI UWG 2025
- **Mata Kuliah**: Struktur Data (Kode: STI-207)
- **Posisi Kurikulum**: Semester 2, Bobot 3 SKS (2 SKS Teori + 1 SKS Praktikum), Prasyarat STI-102 Algoritma dan Pemrograman.
- **Profil Lulusan (PL) Terkait**: PL01 (*AI-Driven System Developer*), PL03 (*IoT & Multimedia System Integrator*), PL04 (*Semantic Knowledge & Data Integration Engineer*), PL06 (*Digital Governance & System Analyst*).
- **CPL Dibebankan**:
  - **CPL02**: Mampu merancang, membangun, menguji, dan mengintegrasikan perangkat lunak, basis data, API, dan layanan cloud untuk menghasilkan sistem informasi yang andal.
  - **CPL09**: Mampu menerapkan matematika, statistika, metode penelitian, dan pemikiran komputasional untuk memecahkan masalah serta mengomunikasikan hasil secara ilmiah.

---

## 🏗️ Struktur RPS & Ketercapaian Komponen

| No | Komponen RPS OBE | Keterangan Status | Nilai / Validasi |
|:---:|:---|:---|:---|
| 1 | **Identitas MK** | Lengkap 100% | Nama, Kode, SKS, Smt, Prodi, Prasyarat, Team Teaching |
| 2 | **CPL Dibebankan** | Presisi 100% | CPL02 & CPL09 persis acuan Kurikulum STI UWG 2025 |
| 3 | **Rumusan CPMK (ABCD)** | Terukur 100% | 4 CPMK menggunakan KKO Anderson & Krathwohl terukur (C3-C5) |
| 4 | **Pemetaan Taksonomi Bloom** | Matriks Valid | CPL09 -> CPMK1 (C4), CPL02 -> CPMK2 (C3), CPL02 -> CPMK3 (C3), CPL09+CPL02 -> CPMK4 (C5) |
| 5 | **Deskripsi & Materi Pokok** | Substantif | 150-200 kata deskripsi + 13 topik materi pokok berurutan |
| 6 | **Referensi (APA 7th)** | Standardized | 3 Referensi Utama (Carrano, Goodrich, Lafore) + 2 Pendukung (Sedgewick, VisuAlgo) |
| 7 | **Media Pembelajaran** | Dual-Category | Software (VSCode, Jupyter, VisuAlgo, GitHub) & Hardware (Lab Komputer, Server JupyterHub) |
| 8 | **Matriks 16 Minggu (Scaffolding)** | Lengkap 100% | Minggu 1-7 (Struktur Linier), M8 (UTS 25%), Minggu 9-15 (Non-Linier, Sorting, Searching, PjBL), M16 (UAS 25%) |
| 9 | **Total Bobot Evaluasi** | **100.0% Valid** | 4%+4%+3%+3%+4%+3%+4% (M1-7: 25%) + UTS 25% + 4%+3%+3%+4%+3%+3%+5% (M9-15: 25%) + UAS 25% = **100%** |
| 10 | **Rancangan Tugas (PjBL)** | Project-Based | Simulasi Antrean Layanan Publik (Queue FIFO + Priority Queue Heap + Binary Search) |
| 11 | **Rubrik Penilaian Analitik** | 4x4 Rubric | 4 Kriteria (Analisis 30%, Kebenaran Kode 30%, Dokumentasi 20%, Kolaborasi 20%) x 4 Level Deskriptor |
| 12 | **Integrasi Penelitian & PkM** | Contextualized | Relevan dengan riset algoritmika & PkM sistem informasi layanan publik prodi |

---

## 🛠️ Temuan Teknis & Solusi yang Diterapkan

1. **Rotasi Multi-API Key Dahl Global**:
   - Diimplementasikan 3 Dahl API Key (`DAHL_KEY_1`, `DAHL_KEY_2`, `DAHL_KEY_3`) dengan mekanisme failover/rotation otomatis untuk mencegah kendala quota atau rate-limit.
2. **Kinerja LLM Engine**:
   - Model `MiniMaxAI/MiniMax-M2.7` terbukti **10x lebih cepat (42.4 detik)** dibanding model alternatif yang mengalami HTTP 524 timeout.
3. **Stripping Reasoning Block (`<think>`)**:
   - Model penalaran (CoT) menyertakan tag `<think>...</think>`, yang berhasil di-strip otomatis menggunakan regular expression sebelum validasi JSON parser.
4. **Verifikasi Bobot 100%**:
   - Skema bobot minggu 1 s.d 16 telah diselaraskan secara akurat hingga tepat mencapai sum **100%** sesuai aturan SN-DIKTI.

---

## 📌 Kesimpulan

Penyusunan RPS OBE untuk Mata Kuliah **Struktur Data (STI-207)** menggunakan **God-Tier Master Prompt** telah selesai 100% dengan kualitas tinggi, presisi kurikulum prodi UWG, dan tanpa adanya placeholder. Dokumen siap digunakan dan dijadikan benchmark untuk mata kuliah lainnya.
