import { RPSFormInput, TemplateId } from "./rps-template";

/**
 * Generates a complete, valid OBE RPS JSON structure independently without external LLM dependencies.
 * Follows SN-DIKTI Indonesia & Anderson-Krathwohl Bloom Taxonomy Standards (based on Master Prompt Guide PDF).
 */
export function generateFallbackRPS(
  input: RPSFormInput,
  templateId: TemplateId = "standard"
): Record<string, unknown> {
  const mk = input.mataKuliah || "Mata Kuliah";
  const prodi = input.programStudi || "Program Studi";
  const sksNum = parseInt(input.sks, 10) || 3;
  const sem = input.semester || "1";

  const cplProdi = `CPL-1 (Sikap): Bekerja sama dan memiliki kepekaan sosial serta kepedulian terhadap masyarakat dan lingkungan dalam penerapan ${mk}.\nCPL-2 (Pengetahuan): Menguasai konsep teoritis, metode, dan prinsip dasar ${mk} pada ${prodi}.\nCPL-3 (Keterampilan Umum): Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan ${mk}.\nCPL-4 (Keterampilan Khusus): Mampu merancang, mengimplementasikan, dan mengevaluasi solusi berbasis ${mk} sesuai standar industri.`;

  const cpmk = `M1: Mahasiswa mampu menganalisis konsep dasar dan fondasi teoritis ${mk} (C4).\nM2: Mahasiswa mampu merumuskan spesifikasi kebutuhan dan pemodelan arsitektur ${mk} (C4).\nM3: Mahasiswa mampu merancang dan merkayasa solusi ${mk} secara sistematis (P3).\nM4: Mahasiswa mampu mengembangkan, menguji, dan mengevaluasi produk ${mk} berbasis standar OBE (P4).`;

  const taksonomi = [
    {
      TAK_KODE: "CPL-1",
      TAK_CPMK: `M1: Mahasiswa mampu menganalisis konsep dasar dan fondasi teoritis ${mk} secara komprehensif.`,
      TAK_ASPEK: "Sikap",
      TAK_LVL: "A3",
    },
    {
      TAK_KODE: "CPL-2",
      TAK_CPMK: `M2: Mahasiswa mampu merumuskan spesifikasi kebutuhan dan pemodelan arsitektur ${mk}.`,
      TAK_ASPEK: "Pengetahuan",
      TAK_LVL: "C4",
    },
    {
      TAK_KODE: "CPL-3",
      TAK_CPMK: `M3: Mahasiswa mampu merancang dan merkayasa solusi ${mk} secara sistematis.`,
      TAK_ASPEK: "Keterampilan Umum",
      TAK_LVL: "P3",
    },
    {
      TAK_KODE: "CPL-4",
      TAK_CPMK: `M4: Mahasiswa mampu mengembangkan, menguji, dan mengevaluasi produk ${mk} berbasis standar OBE.`,
      TAK_ASPEK: "Keterampilan Khusus",
      TAK_LVL: "P4",
    },
  ];

  const deskripsi = `Mata kuliah ${mk} (${sksNum} SKS, Semester ${sem}) merupakan mata kuliah wajib pada ${prodi}. Mata kuliah ini membekali mahasiswa dengan kompetensi analisis, perancangan, implementasi, dan pengujian dalam ${mk} berbasis prinsip Outcome-Based Education (OBE) dan standar SN-DIKTI.`;

  const materiPokok = `1. Pengantar & Analisis Komprehensif ${mk}\n2. Spesifikasi Kebutuhan & Pemodelan Arsitektur\n3. Perancangan Sistem & Desain Solusi Terstruktur\n4. Implementasi, Kodifikasi, & Praktikum ${mk}\n5. Pengujian Sistem, Penjaminan Mutu, & Validas\n6. Evaluasi Kinerja & Optimasi Solusi\n7. Studi Kasus Industri & Isu Terkini ${mk}`;

  const refUtama = `1. Utama, P. (2024). Buku Ajar ${mk} Berbasis OBE. Penerbit Akademik Press.\n2. Anderson, L.W. & Krathwohl, D.R. (2001). A Taxonomy for Learning, Teaching, and Assessing. Longman.`;
  const refPendukung = `1. Smith, J. & Doe, R. (2023). Applied Principles in ${prodi}. IEEE Education.`;

  const integrasiRispkm = `Terintegrasi dengan hasil penelitian dosen pengampu tentang inovasi ${mk} serta kegiatan pengabdian masyarakat di lingkungan ${prodi}.`;

  const result: Record<string, unknown> = {
    CPL_PRODI: cplProdi,
    CPMK: cpmk,
    TAKSONOMI: taksonomi,
    DESKRIPSI: deskripsi,
    MATERI_POKOK: materiPokok,
    REFERENSI_UTAMA: refUtama,
    REFERENSI_PENDUKUNG: refPendukung,
    INTEGRASI_RISPKM: integrasiRispkm,
    MEDIA_LUNAK: "E-Learning / LMS, IDE / Tools Pembelajaran, Zoom / Google Meet",
    MEDIA_KERAS: "Laptop, Proyektor LCD, Whiteboard, Perangkat Lab",
    TEAM_TEACHING: "Tim Dosen Pengampu " + prodi,
    MK_SYARAT: "Prasyarat Kurikulum " + prodi,
    RANCANGAN_TUGAS: `Tugas Mandiri & Kelompok: Mahasiswa diminta menganalisis, merancang, dan mengimplementasikan proyek ${mk} secara berkelompok (3-4 orang). Luaran berupa dokumen spesifikasi, produk/prototipe, dan presentasi tim.`,
    RUBRIK_PENILAIAN: `Sangat Baik (81-100): Ketajaman analisis sangat mendalam, perancangan presisi, dan solusi inovatif.\nBaik (61-80): Analisis baik, perancangan sesuai standar, dan mampu menyelesaikan masalah tepat waktu.\nCukup (41-60): Penguasaan memadai namun perancangan masih memerlukan penyempurnaan.\nKurang (<40): Belum mencapai standar kriteria minimal pembelajaran ${mk}.`,
  };

  const weeklyTopics = [
    { title: `Analisis Pendahuluan & Kontrak Perkuliahan ${mk}`, bobot: "3" },
    { title: `Kaji Teori & Konsep Fondasi ${mk}`, bobot: "3" },
    { title: `Identifikasi Masalah & Formulasi Kebutuhan`, bobot: "4" },
    { title: `Analisis Kasus & Pemodelan Awal ${mk}`, bobot: "5" },
    { title: `Perancangan Arsitektur & Desain Solusi`, bobot: "4" },
    { title: `Penerapan Metodologi & Tools Pengembangan`, bobot: "3" },
    { title: `Sintesis Materi & Evaluasi Progres Proyek`, bobot: "3" },
    { title: `EVALUASI TENGAH SEMESTER (UTS)`, bobot: "25" },
    { title: `Penerapan Teknik Lanjutan ${mk}`, bobot: "4" },
    { title: `Implementasi Sistem & Praktikum Lapangan`, bobot: "4" },
    { title: `Pengujian, Validasi, & Penjaminan Mutu`, bobot: "4" },
    { title: `Integrasi Sistem & Mekanisme Deployment`, bobot: "5" },
    { title: `Evaluasi Performa & Optimasi Solusi`, bobot: "3" },
    { title: `Analisis Keamanan, Etika, & Standar Industri`, bobot: "4" },
    { title: `Finalisasi Proyek & Presentasi Evaluatif`, bobot: "5" },
    { title: `EVALUASI AKHIR SEMESTER (UAS)`, bobot: "25" },
  ];

  const tmTime = `TM: ${sksNum}x50', PT: ${sksNum}x60', BM: ${sksNum}x60'`;

  for (let i = 1; i <= 16; i++) {
    const key = `M${i}`;
    const topic = weeklyTopics[i - 1];

    if (i === 8) {
      result[`${key}_KEMAMPUAN`] = "EVALUASI TENGAH SEMESTER (UTS)";
      result[`${key}_MATERI`] = "Materi Pertemuan 1 sampai 7";
      result[`${key}_INDIKATOR`] = "Ketepatan analisis kasus dan penyelesaian soal UTS";
      result[`${key}_TEKNIK`] = "Ujian Tulis / Evaluasi Progres Proyek";
      result[`${key}_BOBOT`] = "25";
      result[`${key}_METODE`] = "Ujian Terbuka / Tes Tulis";
      result[`${key}_WAKTU`] = "TM: 1x90'";
      result[`${key}_PENGALAMAN`] = "Mengerjakan evaluasi tengah semester";
      result[`${key}_MEDIA`] = "LMS / Lembar Ujian";
      result[`${key}_REFERENSI`] = "Referensi Utama 1 & 2";
    } else if (i === 16) {
      result[`${key}_KEMAMPUAN`] = "EVALUASI AKHIR SEMESTER (UAS)";
      result[`${key}_MATERI`] = "Materi Pertemuan 9 sampai 15";
      result[`${key}_INDIKATOR`] = "Ketepatan penyelesaian proyek akhir dan ujian komprehensif";
      result[`${key}_TEKNIK`] = "Ujian Akhir / Presentasi Proyek";
      result[`${key}_BOBOT`] = "25";
      result[`${key}_METODE`] = "Ujian Akhir / Presentasi";
      result[`${key}_WAKTU`] = "TM: 1x90'";
      result[`${key}_PENGALAMAN`] = "Mempresentasikan hasil proyek akhir";
      result[`${key}_MEDIA`] = "LMS / Media Presentasi";
      result[`${key}_REFERENSI`] = "Seluruh Referensi";
    } else {
      result[`${key}_KEMAMPUAN`] = `Mahasiswa mampu menganalisis dan menerapkan ${topic.title}.`;
      result[`${key}_MATERI`] = topic.title;
      result[`${key}_INDIKATOR`] = `Ketepatan analisis konsep dan keaktifan diskusi dalam ${topic.title}.`;
      result[`${key}_TEKNIK`] = i % 3 === 0 ? "Tugas Praktik / Rubrik Analitik" : "Observasi & Partisipasi";
      result[`${key}_BOBOT`] = topic.bobot;
      result[`${key}_METODE`] = templateId === "project-based" ? "Team-Based Project (PjBL) / Case Method" : "Small Group Discussion / Discovery Learning";
      result[`${key}_WAKTU`] = tmTime;
      result[`${key}_PENGALAMAN`] = `Mengkaji materi ${topic.title}, berdiskusi SCL, dan menyelesaikan studi kasus.`;
      result[`${key}_MEDIA`] = "LMS, Slide Presentasi, Modul Ajar";
      result[`${key}_REFERENSI`] = "Utama (1, 2)";
    }
  }

  return result;
}
