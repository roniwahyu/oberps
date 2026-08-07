import { RPSFormInput, TemplateId } from "./rps-template";

/**
 * Generates a complete, valid OBE RPS JSON structure independently without external LLM dependencies.
 * Used when no API Key is configured or when running in offline/standalone mode.
 */
export function generateFallbackRPS(
  input: RPSFormInput,
  templateId: TemplateId = "standard"
): Record<string, unknown> {
  const mk = input.mataKuliah || "Mata Kuliah";
  const prodi = input.programStudi || "Program Studi";
  const sks = input.sks || "3";
  const sem = input.semester || "1";

  const cplProdi = `CPL-1 (Sikap): Bekerja sama dan memiliki kepekaan sosial serta kepedulian terhadap masyarakat dan lingkungan dalam penerapan ${mk}.\nCPL-2 (Pengetahuan): Menguasai konsep teoritis dan prinsip dasar ${mk} pada ${prodi}.\nCPL-3 (Keterampilan Umum): Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan ${mk}.\nCPL-4 (Keterampilan Khusus): Mampu merancang, mengimplementasikan, dan mengevaluasi solusi berbasis ${mk} sesuai standar industri.`;

  const cpmk = `M1: Mahasiswa mampu memahami konsep dasar dan prinsip utama ${mk}.\nM2: Mahasiswa mampu menganalisis permasalahan dan kebutuhan solusi dalam bidang ${mk}.\nM3: Mahasiswa mampu merancang dan mendesain arsitektur/sistem ${mk}.\nM4: Mahasiswa mampu mengimplementasikan dan menguji karya/solusi berbasis ${mk} secara mandiri dan kelompok.`;

  const taksonomi = [
    {
      TAK_KODE: "CPL-1",
      TAK_CPMK: `M1: Memahami konsep dasar dan prinsip utama ${mk} secara komprehensif.`,
      TAK_ASPEK: "Sikap",
      TAK_LVL: "A3",
    },
    {
      TAK_KODE: "CPL-2",
      TAK_CPMK: `M2: Menganalisis permasalahan serta merumuskan spesifikasi kebutuhan ${mk}.`,
      TAK_ASPEK: "Pengetahuan",
      TAK_LVL: "C4",
    },
    {
      TAK_KODE: "CPL-3",
      TAK_CPMK: `M3: Merancang model arsitektur dan rancangan teknis ${mk}.`,
      TAK_ASPEK: "Keterampilan Umum",
      TAK_LVL: "P3",
    },
    {
      TAK_KODE: "CPL-4",
      TAK_CPMK: `M4: Mengembangkan dan mengevaluasi produk/solusi ${mk} berbasis standar OBE.`,
      TAK_ASPEK: "Keterampilan Khusus",
      TAK_LVL: "P4",
    },
  ];

  const deskripsi = `Mata kuliah ${mk} (${sks} SKS, Semester ${sem}) merupakan mata kuliah wajib pada ${prodi}. Mata kuliah ini membekali mahasiswa dengan pemahaman komprehensif mengenai prinsip, metode, dan praktik terbaik dalam ${mk}, mulai dari fondasi teoritis hingga implementasi praktis berbasis proyek.`;

  const materiPokok = `1. Pengantar dan Konsep Dasar ${mk}\n2. Prinsip & Metodologi Utama dalam ${mk}\n3. Analisis Kebutuhan dan Pemodelan Sistem\n4. Perancangan Arsitektur dan Desain Solusi\n5. Implementasi & Teknik Pengembangan\n6. Pengujian, Evaluasi, dan Penjaminan Mutu\n7. Tren Terkini dan Studi Kasus Industri dalam ${mk}`;

  const refUtama = `1. Utama, P. (2024). Buku Ajar ${mk} Berbasis OBE. Penerbit Akademik Press.\n2. Expert, A. (2023). Fundamentals of ${mk}: Principles & Practices. Springer.`;
  const refPendukung = `1. Smith, J. & Doe, R. (2022). Modern Applications in ${prodi}. IEEE Education.`;

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
    MK_SYARAT: "Pengantar " + mk + " / Matakuliah Prasyarat",
    RANCANGAN_TUGAS: `Tugas Mandiri & Kelompok: Mahasiswa diminta membuat rancangan dan studi kasus ${mk} secara berkelompok (3-4 orang). Output berupa laporan teknis dan presentasi akhir.`,
    RUBRIK_PENILAIAN: `Sangat Baik (80-100): Penguasaan konsep sangat jelas, analisis mendalam, perancangan dan implementasi sempurna.\nBaik (70-79): Penguasaan konsep baik, analisis dan implementasi tepat sesuai petunjuk.\nCukup (60-69): Penguasaan konsep memadai namun masih terdapat beberapa kekurangan analisis.\nKurang (<60): Tidak memenuhi kriteria minimal pemahaman ${mk}.`,
  };

  // Generate 16 weeks (M1-M16)
  // M8 = UTS (25%), M16 = UAS (25%)
  // Remaining 14 weeks share 50% (approx 3.5% - 4% each, e.g. M4=5%, M7=5%, M12=5%, M15=5%, rest 3-4%)
  const weeklyTopics = [
    { title: `Pendahuluan & Kontrak Perkuliahan ${mk}`, bobot: "3" },
    { title: `Konsep Dasar dan Teori Pembentuk ${mk}`, bobot: "3" },
    { title: `Identifikasi Masalah & Analisis Kebutuhan`, bobot: "4" },
    { title: `Studi Kasus & Pemodelan Awal ${mk}`, bobot: "5" },
    { title: `Prinsip Perancangan & Arsitektur`, bobot: "4" },
    { title: `Metodologi & Alat Bantu Pengembangan`, bobot: "3" },
    { title: `Review Materi & Persiapan Progres UTS`, bobot: "3" },
    { title: `EVALUASI TENGAH SEMESTER (UTS)`, bobot: "25" },
    { title: `Teknik Lanjutan dalam ${mk}`, bobot: "4" },
    { title: `Implementasi Sistem & Kodifikasi/Praktikum`, bobot: "4" },
    { title: `Pengujian, Validation & Quality Assurance`, bobot: "4" },
    { title: `Integrasi Sistem dan Deployment`, bobot: "5" },
    { title: `Analisis Performa dan Optimasi ${mk}`, bobot: "3" },
    { title: `Isu Keamanan, Etika, dan Standar Industri`, bobot: "4" },
    { title: `Presentasi Proyek Akhir & Review Kasus`, bobot: "5" },
    { title: `EVALUASI AKHIR SEMESTER (UAS)`, bobot: "25" },
  ];

  for (let i = 1; i <= 16; i++) {
    const key = `M${i}`;
    const topic = weeklyTopics[i - 1];

    if (i === 8) {
      result[`${key}_KEMAMPUAN`] = "EVALUASI TENGAH SEMESTER (UTS)";
      result[`${key}_MATERI`] = "Materi Pertemuan 1 sampai 7";
      result[`${key}_INDIKATOR`] = "Ketepatan menjawab soal dan analisis kasus UTS";
      result[`${key}_TEKNIK`] = "Ujian Tulis / Evaluasi Progres Proyek";
      result[`${key}_BOBOT`] = "25";
      result[`${key}_METODE`] = "Ujian Terbuka / Tes Tulis";
      result[`${key}_WAKTU`] = "TM: 1x90'";
      result[`${key}_PENGALAMAN`] = "Mengerjakan soal evaluasi tengah semester";
      result[`${key}_MEDIA`] = "LMS / Lembar Ujian";
      result[`${key}_REFERENSI`] = "Referensi 1 & 2";
    } else if (i === 16) {
      result[`${key}_KEMAMPUAN`] = "EVALUASI AKHIR SEMESTER (UAS)";
      result[`${key}_MATERI`] = "Materi Pertemuan 9 sampai 15";
      result[`${key}_INDIKATOR`] = "Ketepatan penyelesaian proyek akhir dan ujian komprehensif";
      result[`${key}_TEKNIK`] = "Ujian Akhir / Presentasi Proyek";
      result[`${key}_BOBOT`] = "25";
      result[`${key}_METODE`] = "Ujian Akhir / Presentasi";
      result[`${key}_WAKTU`] = "TM: 1x90'";
      result[`${key}_PENGALAMAN`] = "Mempresentasikan proyek akhir dan ujian komprehensif";
      result[`${key}_MEDIA`] = "LMS / Media Presentasi";
      result[`${key}_REFERENSI`] = "Seluruh Referensi";
    } else {
      result[`${key}_KEMAMPUAN`] = `Mahasiswa mampu menjelaskan dan menerapkan ${topic.title}.`;
      result[`${key}_MATERI`] = topic.title;
      result[`${key}_INDIKATOR`] = `Ketepatan penjelasan konsep dan partisipasi aktif dalam pembahasan ${topic.title}.`;
      result[`${key}_TEKNIK`] = i % 3 === 0 ? "Tugas Praktik / Quiz" : "Partisipasi & Observasi";
      result[`${key}_BOBOT`] = topic.bobot;
      result[`${key}_METODE`] = templateId === "project-based" ? "Project-Based Learning / Diskusi" : "Kuliah Interaktif, Diskusi Kelompok, & Praktik";
      result[`${key}_WAKTU`] = `TM: ${parseInt(sks, 10) || 3}x50'`;
      result[`${key}_PENGALAMAN`] = `Mengkaji materi ${topic.title}, berdiskusi, dan menyelesaikan studi kasus.`;
      result[`${key}_MEDIA`] = "LMS, Slide Presentasi, Modul Ajar";
      result[`${key}_REFERENSI`] = "Utama (1, 2)";
    }
  }

  return result;
}
