// Master prompt template for RPS generation - OBE curriculum framework & SN-DIKTI Indonesia Standards
// Based on PROMPT - BUAT RPS OBE With AI Master Guide & 18 PDF Distillation

export interface RPSFormInput {
  mataKuliah: string;
  kodeMK?: string;
  sks: string;
  sksTeori?: string;
  sksPraktikum?: string;
  semester: string;
  programStudi: string;
  namaDosen?: string;
}

export const DEFAULT_FORM_INPUT: RPSFormInput = {
  mataKuliah: "Struktur Data",
  kodeMK: "STI-207",
  sks: "3",
  sksTeori: "2",
  sksPraktikum: "1",
  semester: "2",
  programStudi: "S1 Sistem dan Teknologi Informasi",
  namaDosen: "Tim Dosen Struktur Data",
};

// The JSON structure template that the LLM must follow
export const RPS_JSON_TEMPLATE = `{
  "CPL_PRODI": "CPL02: Mampu merancang, membangun, menguji, dan mengintegrasikan perangkat lunak... \\nCPL09: Mampu menerapkan matematika, statistika, metode penelitian, dan pemikiran komputasional...",
  "CPMK": "CPMK-1 (CPL09 — C4): Mahasiswa mampu menganalisis... \\nCPMK-2 (CPL02 — C3): Mahasiswa mampu mengimplementasikan...",
  "TAKSONOMI": [
    { "TAK_KODE": "CPL09", "TAK_CPMK": "CPMK-1: Menganalisis kompleksitas Big-O...", "TAK_ASPEK": "Pengetahuan", "TAK_LVL": "C4" },
    { "TAK_KODE": "CPL02", "TAK_CPMK": "CPMK-2: Mengimplementasikan struktur data linier...", "TAK_ASPEK": "Keterampilan Khusus", "TAK_LVL": "C3" }
  ],
  "DESKRIPSI": "Mata kuliah ini memberikan kemampuan berpikir komputasional...",
  "MATERI_POKOK": "1. Konsep dasar struktur data dan Big-O notation\\n2. Array statis dan dinamis\\n3. Linked List...",
  "REFERENSI_UTAMA": "1. Carrano, F. M. (2019)...\\n2. Goodrich, M. T. (2022)...",
  "REFERENSI_PENDUKUNG": "1. Sedgewick, R. (2011)...\\n2. VisuAlgo (2024)...",
  "INTEGRASI_RISPKM": "Terintegrasi dengan penelitian bidang sistem informasi dan algoritmika...",
  "MEDIA_LUNAK": "Python IDE (VSCode/PyCharm), Jupyter Notebook, GitHub, VisuAlgo",
  "MEDIA_KERAS": "Proyektor, Whiteboard, Perangkat Lab Komputer",
  "TEAM_TEACHING": "-",
  "MK_SYARAT": "STI-102 Algoritma dan Pemrograman",
  "M1_KEMAMPUAN": "Mahasiswa mampu...", "M1_MATERI": "...", "M1_INDIKATOR": "...", "M1_TEKNIK": "...", "M1_BOBOT": "4", "M1_METODE": "...", "M1_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M1_PENGALAMAN": "...", "M1_MEDIA": "...", "M1_REFERENSI": "...",
  "M2_KEMAMPUAN": "", "M2_MATERI": "", "M2_INDIKATOR": "", "M2_TEKNIK": "", "M2_BOBOT": "4", "M2_METODE": "", "M2_WAKTU": "", "M2_PENGALAMAN": "", "M2_MEDIA": "", "M2_REFERENSI": "",
  "M3_KEMAMPUAN": "", "M3_MATERI": "", "M3_INDIKATOR": "", "M3_TEKNIK": "", "M3_BOBOT": "3", "M3_METODE": "", "M3_WAKTU": "", "M3_PENGALAMAN": "", "M3_MEDIA": "", "M3_REFERENSI": "",
  "M4_KEMAMPUAN": "", "M4_MATERI": "", "M4_INDIKATOR": "", "M4_TEKNIK": "", "M4_BOBOT": "3", "M4_METODE": "", "M4_WAKTU": "", "M4_PENGALAMAN": "", "M4_MEDIA": "", "M4_REFERENSI": "",
  "M5_KEMAMPUAN": "", "M5_MATERI": "", "M5_INDIKATOR": "", "M5_TEKNIK": "", "M5_BOBOT": "4", "M5_METODE": "", "M5_WAKTU": "", "M5_PENGALAMAN": "", "M5_MEDIA": "", "M5_REFERENSI": "",
  "M6_KEMAMPUAN": "", "M6_MATERI": "", "M6_INDIKATOR": "", "M6_TEKNIK": "", "M6_BOBOT": "3", "M6_METODE": "", "M6_WAKTU": "", "M6_PENGALAMAN": "", "M6_MEDIA": "", "M6_REFERENSI": "",
  "M7_KEMAMPUAN": "", "M7_MATERI": "", "M7_INDIKATOR": "", "M7_TEKNIK": "", "M7_BOBOT": "4", "M7_METODE": "", "M7_WAKTU": "", "M7_PENGALAMAN": "", "M7_MEDIA": "", "M7_REFERENSI": "",
  "M8_KEMAMPUAN": "EVALUASI TENGAH SEMESTER (UTS)", "M8_MATERI": "Materi Pertemuan 1 s.d. 7", "M8_INDIKATOR": "Ketepatan analisis dan implementasi", "M8_TEKNIK": "Ujian Tulis + Praktikum", "M8_BOBOT": "25", "M8_METODE": "Ujian Terbuka", "M8_WAKTU": "TM: 1x100'", "M8_PENGALAMAN": "Mengerjakan Soal UTS", "M8_MEDIA": "Komputer/E-Learning", "M8_REFERENSI": "-",
  "M9_KEMAMPUAN": "", "M9_MATERI": "", "M9_INDIKATOR": "", "M9_TEKNIK": "", "M9_BOBOT": "4", "M9_METODE": "", "M9_WAKTU": "", "M9_PENGALAMAN": "", "M9_MEDIA": "", "M9_REFERENSI": "",
  "M10_KEMAMPUAN": "", "M10_MATERI": "", "M10_INDIKATOR": "", "M10_TEKNIK": "", "M10_BOBOT": "3", "M10_METODE": "", "M10_WAKTU": "", "M10_PENGALAMAN": "", "M10_MEDIA": "", "M10_REFERENSI": "",
  "M11_KEMAMPUAN": "", "M11_MATERI": "", "M11_INDIKATOR": "", "M11_TEKNIK": "", "M11_BOBOT": "3", "M11_METODE": "", "M11_WAKTU": "", "M11_PENGALAMAN": "", "M11_MEDIA": "", "M11_REFERENSI": "",
  "M12_KEMAMPUAN": "", "M12_MATERI": "", "M12_INDIKATOR": "", "M12_TEKNIK": "", "M12_BOBOT": "4", "M12_METODE": "", "M12_WAKTU": "", "M12_PENGALAMAN": "", "M12_MEDIA": "", "M12_REFERENSI": "",
  "M13_KEMAMPUAN": "", "M13_MATERI": "", "M13_INDIKATOR": "", "M13_TEKNIK": "", "M13_BOBOT": "3", "M13_METODE": "", "M13_WAKTU": "", "M13_PENGALAMAN": "", "M13_MEDIA": "", "M13_REFERENSI": "",
  "M14_KEMAMPUAN": "", "M14_MATERI": "", "M14_INDIKATOR": "", "M14_TEKNIK": "", "M14_BOBOT": "3", "M14_METODE": "", "M14_WAKTU": "", "M14_PENGALAMAN": "", "M14_MEDIA": "", "M14_REFERENSI": "",
  "M15_KEMAMPUAN": "", "M15_MATERI": "", "M15_INDIKATOR": "", "M15_TEKNIK": "", "M15_BOBOT": "5", "M15_METODE": "", "M15_WAKTU": "", "M15_PENGALAMAN": "", "M15_MEDIA": "", "M15_REFERENSI": "",
  "M16_KEMAMPUAN": "EVALUASI AKHIR SEMESTER (UAS)", "M16_MATERI": "Materi Pertemuan 9 s.d. 15", "M16_INDIKATOR": "Ketepatan penyelesaian proyek dan ujian", "M16_TEKNIK": "Ujian Praktikum + Presentasi", "M16_BOBOT": "25", "M16_METODE": "Ujian Akhir + Presentasi", "M16_WAKTU": "TM: 1x100'", "M16_PENGALAMAN": "Mengerjakan Soal UAS / Presentasi", "M16_MEDIA": "Komputer/E-Learning", "M16_REFERENSI": "-",
  "RANCANGAN_TUGAS": "JUDUL TUGAS: ... \\nDESKRIPSI: ... \\nBENTUK LUARAN: ... \\nMETODE: ...",
  "RUBRIK_PENILAIAN": "KRITERIA 1 - Ketajaman Analisis Kompleksitas (30%): ... \\nKRITERIA 2 - Kebenaran Kode (30%): ..."
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
    extraInstructions: `\n\nMODE RINGKAS: Buat deskripsi yang singkat dan padat untuk setiap field. Hindari paragraf panjang. Materi pokok maksimal 5-7 item. Referensi utama maksimal 2. Bobot didistribusikan sederhana (mis. 3-5% per minggu pertemuan, UTS 25%, UAS 25%). Total bobot M1-M16 wajib 100%.`,
  },
  {
    id: "detailed",
    label: "Detail & Mendalam",
    description: "Versi mendalam — deskripsi lengkap untuk setiap Sub-CPMK, indikator SMART, dan pengalaman belajar eksplisit.",
    extraInstructions: `\n\nMODE DETAIL: Berikan deskripsi yang sangat lengkap dan terstruktur untuk setiap field. Materi pokok harus detail dengan sub-bab. Indikator harus terukur (SMART). Pengalaman belajar harus eksplisit (ceramah, diskusi, praktikum, tugas). Referensi utama 3-4 buku/jurnal akademik. Rancangan tugas detail dengan kriteria penilaian spesifik. Total bobot M1-M16 wajib 100%.`,
  },
  {
    id: "project-based",
    label: "Berbasis Proyek (PjBL / Case Method)",
    description: "Fokus pada pembelajaran berbasis proyek (Team-Based Project) dan pemecahan kasus (Case Method).",
    extraInstructions: `\n\nMODE BERBASIS PROYEK: Struktur pembelajaran berbasis proyek (Project-Based Learning & Case Method). Minggu 1-3: pengenalan & perancangan. Minggu 4-7: implementasi bertahap & case study. Minggu 8: UTS (presentasi progres 25%). Minggu 9-14: pengembangan proyek tim. Minggu 15: final presentation. Minggu 16: UAS (25%). Total bobot M1-M16 wajib 100%. Rancangan tugas berupa kasus/proyek nyata industri.`,
  },
];

/**
 * Raw God-Tier Master Prompt Template with explicit {{TAG}} and [[TAG]] placeholders
 * designed for seamless Agentic AI prompt customization, variable substitution, and LLM subagent orchestration.
 */
export const GODTIER_RAW_MASTER_PROMPT_TEMPLATE = `IDENTITAS PERAN: Pakar Kurikulum OBE & SN-DIKTI Indonesia dengan keahlian Constructive Alignment & Instructional Design.

DATA MATA KULIAH (INPUT):
- Nama Mata Kuliah : {{MATA_KULIAH}}
- Kode MK          : {{KODE_MK}}
- Bobot SKS        : {{SKS}} SKS {{SKS_DETAIL}}
- Semester         : {{SEMESTER}}
- Program Studi    : {{PROGRAM_STUDI}}
- Dosen Pengampu   : {{NAMA_DOSEN}}{{CURRICULUM_SECTION}}

ATURAN UTAMA & CHAIN-OF-THOUGHT INTERNAL:

1. ATURAN OUTPUT:
   - Anda WAJIB mengembalikan jawaban HANYA dalam format JSON murni yang valid tanpa teks pembuka/penutup, tanpa penjelasan di luar JSON, dan tanpa markdown fence (\`\`\`json).
   - Gunakan Bahasa Indonesia formal.

2. CPL & CPMK (CONSTRUCTIVE ALIGNMENT):
   - Gunakan CPL resmi prodi. Rumuskan CPMK dengan format ABCD terukur.
   - Gunakan Kata Kerja Operasional (KKO) Anderson & Krathwohl (Level C1-C6, A1-A5, P1-P5).
   - DILARANG KERAS menggunakan kata kerja abstrak/tidak terukur (seperti: "memahami", "mengetahui", "mengerti", "mempelajari"). Gunakan KKO terukur seperti "menganalisis", "menjelaskan", "merancang", "mengimplementasikan", "mengidentifikasi", "mengevaluasi".

3. MATRIKS MINGGUAN (M1 s.d. M16):
   - Scaffolding: Urutkan materi dan Sub-CPMK dari tingkat dasar ke tingkat lanjut secara logis.
   - Kemampuan Akhir (Mx_KEMAMPUAN) WAJIB dalam bentuk kalimat kemampuan terukur (KKO), contoh: "Mahasiswa mampu membedakan...", BUKAN hanya judul topik materi.
   - Minggu 8 WAJIB bertuliskan "EVALUASI TENGAH SEMESTER (UTS)" dengan M8_BOBOT = "25".
   - Minggu 16 WAJIB bertuliskan "EVALUASI AKHIR SEMESTER (UAS)" dengan M16_BOBOT = "25".
   - TOTAL BOBOT PERSENTASE DARI M1 SANPAI M16 WAJIB BERJUMLAH TEPAT 100%.
     (Rekomendasi bobot: M1-M7 total 25%, M8 UTS = 25%, M9-M15 total 25%, M16 UAS = 25% -> Total = 100%).

4. RUBRIK PENILAIAN ANALITIK & RANCANGAN TUGAS:
   - Sertakan kriteria penilaian analitik 4x4 (Sangat Baik 81-100, Baik 61-80, Cukup 41-60, Kurang <40) dengan deskriptor observabel.
   - Sertakan rancangan tugas Project-Based Learning / Case Method dengan indikator performa yang jelas.

Gunakan struktur JSON berikut sebagai skema utama:

${RPS_JSON_TEMPLATE}{{EXTRA_INSTRUCTIONS}}`;

/**
 * Render Master Prompt Template by replacing {{TAG}} or [[TAG]] placeholders for Agentic AI workflows
 */
export function renderMasterPromptTemplate(
  templateString: string,
  variables: Record<string, string>
): string {
  let rendered = templateString;
  for (const [key, val] of Object.entries(variables)) {
    const upperKey = key.toUpperCase();
    const lowerKey = key.toLowerCase();

    // Replace {{KEY}}, {{key}}, [[KEY]], [[key]]
    rendered = rendered
      .replaceAll(`{{${upperKey}}}`, val)
      .replaceAll(`{{${lowerKey}}}`, val)
      .replaceAll(`{{${key}}}`, val)
      .replaceAll(`[[${upperKey}]]`, val)
      .replaceAll(`[[${lowerKey}]]`, val)
      .replaceAll(`[[${key}]]`, val);
  }
  return rendered;
}

/**
 * Build the master prompt based on PROMPT - BUAT RPS OBE With AI Master Guide & God-Tier CoT Distillation
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

  const sksDetail = input.sksTeori
    ? `(${input.sksTeori} Teori + ${input.sksPraktikum || "0"} Praktikum)`
    : "";

  return renderMasterPromptTemplate(GODTIER_RAW_MASTER_PROMPT_TEMPLATE, {
    MATA_KULIAH: input.mataKuliah,
    KODE_MK: input.kodeMK || "-",
    SKS: input.sks,
    SKS_DETAIL: sksDetail,
    SEMESTER: input.semester,
    PROGRAM_STUDI: input.programStudi,
    NAMA_DOSEN: input.namaDosen || "Tim Dosen",
    CURRICULUM_SECTION: curriculumSection,
    EXTRA_INSTRUCTIONS: template.extraInstructions,
  });
}
