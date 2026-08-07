// Master prompt template for RPS generation - OBE curriculum framework & SN-DIKTI Indonesia Standards
// Based on PROMPT - BUAT RPS OBE With AI Master Guide

export interface RPSFormInput {
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
}

export const DEFAULT_FORM_INPUT: RPSFormInput = {
  mataKuliah: "Rekayasa Perangkat Lunak",
  sks: "3",
  semester: "4",
  programStudi: "S1 Teknik Informatika",
};

// The JSON structure template that the LLM must follow
export const RPS_JSON_TEMPLATE = `{
  "CPL_PRODI": "CPL-1 (Sikap): ... \\nCPL-2 (Pengetahuan): ... \\nCPL-3 (Keterampilan Umum): ... \\nCPL-4 (Keterampilan Khusus): ...",
  "CPMK": "M1: Mahasiswa mampu... \\nM2: Mahasiswa mampu... \\nM3: Mahasiswa mampu... \\nM4: Mahasiswa mampu...",
  "TAKSONOMI": [
    { "TAK_KODE": "CPL-1", "TAK_CPMK": "M1: Mahasiswa mampu menjelaskan...", "TAK_ASPEK": "Sikap", "TAK_LVL": "A3" },
    { "TAK_KODE": "CPL-2", "TAK_CPMK": "M2: Mahasiswa mampu menganalisis...", "TAK_ASPEK": "Pengetahuan", "TAK_LVL": "C4" },
    { "TAK_KODE": "CPL-3", "TAK_CPMK": "M3: Mahasiswa mampu merancang...", "TAK_ASPEK": "Keterampilan Umum", "TAK_LVL": "P3" },
    { "TAK_KODE": "CPL-4", "TAK_CPMK": "M4: Mahasiswa mampu mengembangkan...", "TAK_ASPEK": "Keterampilan Khusus", "TAK_LVL": "P4" }
  ],
  "DESKRIPSI": "",
  "MATERI_POKOK": "1. ... \\n2. ... \\n3. ...",
  "REFERENSI_UTAMA": "1. ... \\n2. ...",
  "REFERENSI_PENDUKUNG": "1. ...",
  "INTEGRASI_RISPKM": "Terintegrasi dengan penelitian tentang...",
  "MEDIA_LUNAK": "E-Learning, Zoom, Google Classroom, IDE",
  "MEDIA_KERAS": "Proyektor, Whiteboard, Perangkat Lab",
  "TEAM_TEACHING": "-",
  "MK_SYARAT": "-",
  "M1_KEMAMPUAN": "", "M1_MATERI": "", "M1_INDIKATOR": "", "M1_TEKNIK": "", "M1_BOBOT": "", "M1_METODE": "", "M1_WAKTU": "TM: 3x50', PT: 3x60', BM: 3x60'", "M1_PENGALAMAN": "", "M1_MEDIA": "", "M1_REFERENSI": "",
  "M2_KEMAMPUAN": "", "M2_MATERI": "", "M2_INDIKATOR": "", "M2_TEKNIK": "", "M2_BOBOT": "", "M2_METODE": "", "M2_WAKTU": "", "M2_PENGALAMAN": "", "M2_MEDIA": "", "M2_REFERENSI": "",
  "M3_KEMAMPUAN": "", "M3_MATERI": "", "M3_INDIKATOR": "", "M3_TEKNIK": "", "M3_BOBOT": "", "M3_METODE": "", "M3_WAKTU": "", "M3_PENGALAMAN": "", "M3_MEDIA": "", "M3_REFERENSI": "",
  "M4_KEMAMPUAN": "", "M4_MATERI": "", "M4_INDIKATOR": "", "M4_TEKNIK": "", "M4_BOBOT": "", "M4_METODE": "", "M4_WAKTU": "", "M4_PENGALAMAN": "", "M4_MEDIA": "", "M4_REFERENSI": "",
  "M5_KEMAMPUAN": "", "M5_MATERI": "", "M5_INDIKATOR": "", "M5_TEKNIK": "", "M5_BOBOT": "", "M5_METODE": "", "M5_WAKTU": "", "M5_PENGALAMAN": "", "M5_MEDIA": "", "M5_REFERENSI": "",
  "M6_KEMAMPUAN": "", "M6_MATERI": "", "M6_INDIKATOR": "", "M6_TEKNIK": "", "M6_BOBOT": "", "M6_METODE": "", "M6_WAKTU": "", "M6_PENGALAMAN": "", "M6_MEDIA": "", "M6_REFERENSI": "",
  "M7_KEMAMPUAN": "", "M7_MATERI": "", "M7_INDIKATOR": "", "M7_TEKNIK": "", "M7_BOBOT": "", "M7_METODE": "", "M7_WAKTU": "", "M7_PENGALAMAN": "", "M7_MEDIA": "", "M7_REFERENSI": "",
  "M8_KEMAMPUAN": "EVALUASI TENGAH SEMESTER (UTS)", "M8_MATERI": "Materi Pertemuan 1 s.d. 7", "M8_INDIKATOR": "Ketepatan jawaban dan analisis", "M8_TEKNIK": "Ujian Tulis/Evaluasi Proyek", "M8_BOBOT": "25", "M8_METODE": "Ujian Terbuka/Tes Tulis", "M8_WAKTU": "TM: 1x90'", "M8_PENGALAMAN": "Mengerjakan Soal UTS", "M8_MEDIA": "Kertas/E-Learning", "M8_REFERENSI": "-",
  "M9_KEMAMPUAN": "", "M9_MATERI": "", "M9_INDIKATOR": "", "M9_TEKNIK": "", "M9_BOBOT": "", "M9_METODE": "", "M9_WAKTU": "", "M9_PENGALAMAN": "", "M9_MEDIA": "", "M9_REFERENSI": "",
  "M10_KEMAMPUAN": "", "M10_MATERI": "", "M10_INDIKATOR": "", "M10_TEKNIK": "", "M10_BOBOT": "", "M10_METODE": "", "M10_WAKTU": "", "M10_PENGALAMAN": "", "M10_MEDIA": "", "M10_REFERENSI": "",
  "M11_KEMAMPUAN": "", "M11_MATERI": "", "M11_INDIKATOR": "", "M11_TEKNIK": "", "M11_BOBOT": "", "M11_METODE": "", "M11_WAKTU": "", "M11_PENGALAMAN": "", "M11_MEDIA": "", "M11_REFERENSI": "",
  "M12_KEMAMPUAN": "", "M12_MATERI": "", "M12_INDIKATOR": "", "M12_TEKNIK": "", "M12_BOBOT": "", "M12_METODE": "", "M12_WAKTU": "", "M12_PENGALAMAN": "", "M12_MEDIA": "", "M12_REFERENSI": "",
  "M13_KEMAMPUAN": "", "M13_MATERI": "", "M13_INDIKATOR": "", "M13_TEKNIK": "", "M13_BOBOT": "", "M13_METODE": "", "M13_WAKTU": "", "M13_PENGALAMAN": "", "M13_MEDIA": "", "M13_REFERENSI": "",
  "M14_KEMAMPUAN": "", "M14_MATERI": "", "M14_INDIKATOR": "", "M14_TEKNIK": "", "M14_BOBOT": "", "M14_METODE": "", "M14_WAKTU": "", "M14_PENGALAMAN": "", "M14_MEDIA": "", "M14_REFERENSI": "",
  "M15_KEMAMPUAN": "", "M15_MATERI": "", "M15_INDIKATOR": "", "M15_TEKNIK": "", "M15_BOBOT": "", "M15_METODE": "", "M15_WAKTU": "", "M15_PENGALAMAN": "", "M15_MEDIA": "", "M15_REFERENSI": "",
  "M16_KEMAMPUAN": "EVALUASI AKHIR SEMESTER (UAS)", "M16_MATERI": "Materi Pertemuan 9 s.d. 15", "M16_INDIKATOR": "Ketepatan penyelesaian proyek/soal", "M16_TEKNIK": "Ujian Tulis/Presentasi Proyek", "M16_BOBOT": "25", "M16_METODE": "Ujian Akhir/Presentasi", "M16_WAKTU": "TM: 1x90'", "M16_PENGALAMAN": "Mengerjakan Soal UAS / Presentasi", "M16_MEDIA": "Kertas/E-Learning", "M16_REFERENSI": "-",
  "RANCANGAN_TUGAS": "Deskripsi Tugas: ... \\nTujuan: ... \\nMetode Pengerjaan: ... \\nBentuk Luaran: ...",
  "RUBRIK_PENILAIAN": "Sangat Baik (81-100): ... \\nBaik (61-80): ... \\nCukup (41-60): ... \\nKurang (<40): ..."
}`;

export type TemplateId = "standard" | "compact" | "detailed" | "project-based";

export interface PromptTemplate {
  id: TemplateId;
  label: string;
  description: string;
  extraInstructions: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "standard",
    label: "Standar (SN-DIKTI)",
    description: "Template standar Outcome-Based Education (OBE) sesuai SN-DIKTI Indonesia.",
    extraInstructions: "",
  },
  {
    id: "compact",
    label: "Ringkas",
    description: "Versi ringkas — fokus pada inti CPL/CPMK, materi pokok, dan bobot.",
    extraInstructions: `\n\nMODE RINGKAS: Buat deskripsi yang singkat dan padat untuk setiap field. Hindari paragraf panjang. Materi pokok maksimal 5-7 item. Referensi utama maksimal 2. Bobot didistribusikan sederhana (mis. 3-5% per minggu pertemuan, UTS 25%, UAS 25%).`,
  },
  {
    id: "detailed",
    label: "Detail & Mendalam",
    description: "Versi mendalam — deskripsi lengkap untuk setiap Sub-CPMK, indikator SMART, dan pengalaman belajar eksplisit.",
    extraInstructions: `\n\nMODE DETAIL: Berikan deskripsi yang sangat lengkap dan terstruktur untuk setiap field. Materi pokok harus detail dengan sub-bab. Indikator harus terukur (SMART). Pengalaman belajar harus eksplisit (ceramah, diskusi, praktikum, tugas). Referensi utama 3-4 buku/jurnal akademik. Rancangan tugas detail dengan kriteria penilaian spesifik.`,
  },
  {
    id: "project-based",
    label: "Berbasis Proyek (PjBL / Case Method)",
    description: "Fokus pada pembelajaran berbasis proyek (Team-Based Project) dan pemecahan kasus (Case Method).",
    extraInstructions: `\n\nMODE BERBASIS PROYEK: Struktur pembelajaran berbasis proyek (Project-Based Learning & Case Method). Minggu 1-3: pengenalan & perancangan. Minggu 4-7: implementasi bertahap & case study. Minggu 8: UTS (presentasi progres). Minggu 9-14: pengembangan proyek tim. Minggu 15: final presentation. Minggu 16: UAS. Bobot: tugas proyek 40%, UTS 25%, UAS 25%, partisipasi 10%. Rancangan tugas berupa kasus/proyek nyata industri.`,
  },
];

/**
 * Build the master prompt based on PROMPT - BUAT RPS OBE With AI Master Guide (SN-DIKTI Standard)
 */
export function buildMasterPrompt(
  input: RPSFormInput,
  templateId: TemplateId = "standard",
  curriculumContextText?: string
): string {
  const template =
    PROMPT_TEMPLATES.find((t) => t.id === templateId) || PROMPT_TEMPLATES[0];

  const curriculumSection = curriculumContextText
    ? `\n\nDOKUMEN ACUAN KURIKULUM PRODI TERLAMPIR (ACUAN MUTLAK CPL, PL, DAN CPMK INSTITUSI):\n${curriculumContextText}\n\nWAJIB: Gunakan rincian CPL dan Profil Lulusan dari dokumen acuan kurikulum di atas untuk menyelaraskan CPL_PRODI, CPMK, dan matriks mingguan M1-M16!`
    : "";

  return `BERTINDAKLAH SEBAGAI: Pakar Kurikulum Pendidikan Tinggi dan Ahli Instructional Design yang menguasai prinsip Outcome-Based Education (OBE) serta standar SN-DIKTI Indonesia.

Tugas Anda adalah merumuskan Rencana Pembelajaran Semester (RPS) dengan Keselarasan Konstruktif (Constructive Alignment) tinggi untuk mata kuliah berikut:

DATA MATA KULIAH:
- Nama Mata Kuliah: ${input.mataKuliah}
- Bobot SKS: ${input.sks} SKS
- Semester: ${input.semester}
- Program Studi: ${input.programStudi}${curriculumSection}

PRINSIP & ATURAN PENYUSUNAN RPS OBE (PEDOMAN SN-DIKTI):

1. ATURAN OUTPUT:
   - Anda WAJIB mengembalikan jawaban HANYA dalam format JSON murni yang valid tanpa teks pembuka/penutup, tanpa penjelasan, dan tanpa markdown fence di luar JSON.

2. CPL & CPMK (CONSTRUCTIVE ALIGNMENT):
   - CPL_PRODI wajib diawali kode CPL-1 (Sikap), CPL-2 (Pengetahuan), CPL-3 (Keterampilan Umum), CPL-4 (Keterampilan Khusus).
   - CPMK wajib diturunkan langsung dari CPL dengan prinsip ABCD (Audience, Behavior, Condition, Degree).
   - Gunakan Kata Kerja Operasional (KKO) revisi Anderson & Krathwohl yang terukur (Level C1-C6, A1-A5, P1-P5).
   - DILARANG KERAS menggunakan kata kerja abstrak/tidak terukur (seperti: "memahami", "mengetahui", "mengerti", "mempelajari"). Gunakan KKO terukur seperti "menganalisis", "menjelaskan", "merancang", "mengimplementasikan", "mengidentifikasi".

3. MATRIKS MINGGUAN (M1 s.d. M16):
   - Scaffolding: Urutkan materi dan Sub-CPMK dari tingkat dasar ke tingkat lanjut secara logis.
   - Kemampuan Akhir (Mx_KEMAMPUAN) WAJIB dalam bentuk kalimat kemampuan (KKO), contoh: "Mahasiswa mampu membedakan...", BUKAN hanya judul topik materi.
   - Minggu 8 WAJIB bertuliskan "EVALUASI TENGAH SEMESTER (UTS)" dengan bobot "25".
   - Minggu 16 WAJIB bertuliskan "EVALUASI AKHIR SEMESTER (UAS)" dengan bobot "25".
   - ALOKASI WAKTU (Mx_WAKTU): Hitung proporsional sesuai SKS (misal 3 SKS = "TM: 3x50', PT: 3x60', BM: 3x60'").
   - TOTAL BOBOT PERSENTASE DARI M1 SANPAI M16 WAJIB BERJUMLAH TEPAT 100.

4. RUBRIK PENILAIAN ANALITIK & RANCANGAN TUGAS:
   - Sertakan kriteria penilaian analitik (Sangat Baik 81-100, Baik 61-80, Cukup 41-60, Kurang <40).
   - Sertakan rancangan tugas yang jelas dengan indikator performa yang observable.

Gunakan struktur JSON berikut sebagai skema utama:

${RPS_JSON_TEMPLATE}${template.extraInstructions}`;
}
