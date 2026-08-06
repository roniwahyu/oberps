// Master prompt template for RPS generation - OBE curriculum framework
// Replaceable parts: Mata Kuliah, SKS, Semester, Program Studi

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
  "CPMK": "M1: ... \\nM2: ... \\nM3: ... \\nM4: ...",
  "TAKSONOMI": [
    { "TAK_KODE": "CPL-1", "TAK_CPMK": "M1: Deskripsi lengkap tentang kemampuan yang diharapkan...", "TAK_ASPEK": "Sikap", "TAK_LVL": "A3" },
    { "TAK_KODE": "CPL-2", "TAK_CPMK": "M2: Deskripsi lengkap...", "TAK_ASPEK": "Pengetahuan", "TAK_LVL": "C4" },
    { "TAK_KODE": "CPL-3", "TAK_CPMK": "M3: Deskripsi lengkap...", "TAK_ASPEK": "Keterampilan Umum", "TAK_LVL": "P3" },
    { "TAK_KODE": "CPL-4", "TAK_CPMK": "M4: Deskripsi lengkap...", "TAK_ASPEK": "Keterampilan Khusus", "TAK_LVL": "P4" }
  ],
  "DESKRIPSI": "",
  "MATERI_POKOK": "1. ... \\n2. ... \\n3. ...",
  "REFERENSI_UTAMA": "1. ... \\n2. ...",
  "REFERENSI_PENDUKUNG": "1. ...",
  "INTEGRASI_RISPKM": "Terintegrasi dengan penelitian tentang...",
  "MEDIA_LUNAK": "E-Learning, Zoom, dll",
  "MEDIA_KERAS": "Proyektor, Whiteboard, dll",
  "TEAM_TEACHING": "-",
  "MK_SYARAT": "-",
  "M1_KEMAMPUAN": "", "M1_MATERI": "", "M1_INDIKATOR": "", "M1_TEKNIK": "", "M1_BOBOT": "", "M1_METODE": "", "M1_WAKTU": "TM: 3x50'", "M1_PENGALAMAN": "", "M1_MEDIA": "", "M1_REFERENSI": "",
  "M2_KEMAMPUAN": "", "M2_MATERI": "", "M2_INDIKATOR": "", "M2_TEKNIK": "", "M2_BOBOT": "", "M2_METODE": "", "M2_WAKTU": "", "M2_PENGALAMAN": "", "M2_MEDIA": "", "M2_REFERENSI": "",
  "M3_KEMAMPUAN": "", "M3_MATERI": "", "M3_INDIKATOR": "", "M3_TEKNIK": "", "M3_BOBOT": "", "M3_METODE": "", "M3_WAKTU": "", "M3_PENGALAMAN": "", "M3_MEDIA": "", "M3_REFERENSI": "",
  "M4_KEMAMPUAN": "", "M4_MATERI": "", "M4_INDIKATOR": "", "M4_TEKNIK": "", "M4_BOBOT": "", "M4_METODE": "", "M4_WAKTU": "", "M4_PENGALAMAN": "", "M4_MEDIA": "", "M4_REFERENSI": "",
  "M5_KEMAMPUAN": "", "M5_MATERI": "", "M5_INDIKATOR": "", "M5_TEKNIK": "", "M5_BOBOT": "", "M5_METODE": "", "M5_WAKTU": "", "M5_PENGALAMAN": "", "M5_MEDIA": "", "M5_REFERENSI": "",
  "M6_KEMAMPUAN": "", "M6_MATERI": "", "M6_INDIKATOR": "", "M6_TEKNIK": "", "M6_BOBOT": "", "M6_METODE": "", "M6_WAKTU": "", "M6_PENGALAMAN": "", "M6_MEDIA": "", "M6_REFERENSI": "",
  "M7_KEMAMPUAN": "", "M7_MATERI": "", "M7_INDIKATOR": "", "M7_TEKNIK": "", "M7_BOBOT": "", "M7_METODE": "", "M7_WAKTU": "", "M7_PENGALAMAN": "", "M7_MEDIA": "", "M7_REFERENSI": "",
  "M8_KEMAMPUAN": "EVALUASI TENGAH SEMESTER (UTS)", "M8_MATERI": "Ujian Tengah Semester", "M8_INDIKATOR": "-", "M8_TEKNIK": "Ujian Tulis/Praktek", "M8_BOBOT": "25", "M8_METODE": "Ujian", "M8_WAKTU": "90 Menit", "M8_PENGALAMAN": "Mengerjakan Soal", "M8_MEDIA": "Kertas/E-Learning", "M8_REFERENSI": "-",
  "M9_KEMAMPUAN": "", "M9_MATERI": "", "M9_INDIKATOR": "", "M9_TEKNIK": "", "M9_BOBOT": "", "M9_METODE": "", "M9_WAKTU": "", "M9_PENGALAMAN": "", "M9_MEDIA": "", "M9_REFERENSI": "",
  "M10_KEMAMPUAN": "", "M10_MATERI": "", "M10_INDIKATOR": "", "M10_TEKNIK": "", "M10_BOBOT": "", "M10_METODE": "", "M10_WAKTU": "", "M10_PENGALAMAN": "", "M10_MEDIA": "", "M10_REFERENSI": "",
  "M11_KEMAMPUAN": "", "M11_MATERI": "", "M11_INDIKATOR": "", "M11_TEKNIK": "", "M11_BOBOT": "", "M11_METODE": "", "M11_WAKTU": "", "M11_PENGALAMAN": "", "M11_MEDIA": "", "M11_REFERENSI": "",
  "M12_KEMAMPUAN": "", "M12_MATERI": "", "M12_INDIKATOR": "", "M12_TEKNIK": "", "M12_BOBOT": "", "M12_METODE": "", "M12_WAKTU": "", "M12_PENGALAMAN": "", "M12_MEDIA": "", "M12_REFERENSI": "",
  "M13_KEMAMPUAN": "", "M13_MATERI": "", "M13_INDIKATOR": "", "M13_TEKNIK": "", "M13_BOBOT": "", "M13_METODE": "", "M13_WAKTU": "", "M13_PENGALAMAN": "", "M13_MEDIA": "", "M13_REFERENSI": "",
  "M14_KEMAMPUAN": "", "M14_MATERI": "", "M14_INDIKATOR": "", "M14_TEKNIK": "", "M14_BOBOT": "", "M14_METODE": "", "M14_WAKTU": "", "M14_PENGALAMAN": "", "M14_MEDIA": "", "M14_REFERENSI": "",
  "M15_KEMAMPUAN": "", "M15_MATERI": "", "M15_INDIKATOR": "", "M15_TEKNIK": "", "M15_BOBOT": "", "M15_METODE": "", "M15_WAKTU": "", "M15_PENGALAMAN": "", "M15_MEDIA": "", "M15_REFERENSI": "",
  "M16_KEMAMPUAN": "EVALUASI AKHIR SEMESTER (UAS)", "M16_MATERI": "Ujian Akhir Semester", "M16_INDIKATOR": "-", "M16_TEKNIK": "Ujian Tulis/Project", "M16_BOBOT": "25", "M16_METODE": "Ujian", "M16_WAKTU": "90 Menit", "M16_PENGALAMAN": "Mengerjakan Soal", "M16_MEDIA": "Kertas/E-Learning", "M16_REFERENSI": "-",
  "RANCANGAN_TUGAS": "Deskripsi Tugas: ... \\nTujuan: ...",
  "RUBRIK_PENILAIAN": "Sangat Baik (80-100): ... \\nBaik (70-79): ... \\nCukup (60-69): ... \\nKurang (<60): ..."
}`;

/**
 * Build the master prompt with form values filled in
 */
export function buildMasterPrompt(input: RPSFormInput): string {
  return `Bertindaklah sebagai Pakar Kurikulum Perguruan Tinggi. Tugas Anda adalah merumuskan Rencana Pembelajaran Semester (RPS) berbasis OBE.

Mata Kuliah: ${input.mataKuliah}

SKS: ${input.sks} SKS

Semester: ${input.semester}

Program Studi: ${input.programStudi}

ATURAN MUTLAK:

1. Anda WAJIB memberikan output HANYA dalam format JSON murni.

2. Penamaan CPL_PRODI WAJIB diawali dengan CPL-1, CPL-2, dst (Bukan 1., 2.).

3. Pada array "TAKSONOMI", kolom "TAK_CPMK" WAJIB diisi dengan DESKRIPSI LENGKAP rumusan CPMK (Misal: "M1: Mahasiswa mampu menganalisis...").

4. Pastikan total bobot persentase di matriks dari M1 sampai M16 berjumlah tepat 100.

Gunakan persis struktur JSON berikut (tambah/kurangi isi array TAKSONOMI sesuai kebutuhan):

${RPS_JSON_TEMPLATE}`;
}
