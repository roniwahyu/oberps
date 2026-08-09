import { CurriculumOBEModuleData } from "./types";

export const SAMPLE_CURRICULUM_DATA: CurriculumOBEModuleData = {
  prodi: "S1 Sistem dan Teknologi Informasi",
  universitas: "Universitas Widya Gama Malang",
  tahun: "2025",

  profilLulusan: [
    {
      kodePL: "PL01",
      namaProfil: "AI-Driven System Developer & Engineer",
      deskripsi: "Lulusan yang mampu merancang, menguji, dan mengintegrasikan perangkat lunak berbasis AI dan layanan cloud.",
      sumber: "Profil Lulusan Prodi SISTEKIN UWG 2025",
    },
    {
      kodePL: "PL02",
      namaProfil: "Interactive UI/UX & Digital Media Specialist",
      deskripsi: "Lulusan yang mampu mengintegrasikan prinsip UI/UX, interaksi manusia-komputer, dan media digital.",
      sumber: "Profil Lulusan Prodi SISTEKIN UWG 2025",
    },
    {
      kodePL: "PL03",
      namaProfil: "IoT & Smart Systems Integrator",
      deskripsi: "Lulusan yang mampu merancang dan mengimplementasikan arsitektur sistem tertanam dan sensor IoT.",
      sumber: "Profil Lulusan Prodi SISTEKIN UWG 2025",
    },
    {
      kodePL: "PL04",
      namaProfil: "Data & Knowledge Engineer",
      deskripsi: "Lulusan yang mampu mengelola infrastruktur data, ontologi, dan pemrosesan informasi terstruktur.",
      sumber: "Profil Lulusan Prodi SISTEKIN UWG 2025",
    },
    {
      kodePL: "PL05",
      namaProfil: "IT Governance & System Auditor",
      deskripsi: "Lulusan yang mampu mengevaluasi tata kelola, keamanan informasi, dan keandalan sistem.",
      sumber: "Profil Lulusan Prodi SISTEKIN UWG 2025",
    },
    {
      kodePL: "PL06",
      namaProfil: "Tech Entrepreneur & Innovator",
      deskripsi: "Lulusan yang mampu mengembangkan solusi teknologi bernilai bisnis dan beretika.",
      sumber: "Profil Lulusan Prodi SISTEKIN UWG 2025",
    },
  ],

  cpl: [
    { kodeCPL: "CPL01", pernyataan: "Mampu merancang dan menganalisis kebutuhan sistem informasi terintegrasi.", kategori: "Pengetahuan" },
    { kodeCPL: "CPL02", pernyataan: "Mampu merancang, membangun, dan menguji perangkat lunak berbasis AI.", kategori: "Keterampilan Khusus" },
    { kodeCPL: "CPL03", pernyataan: "Mampu menerapkan komputasi cerdas dan pemrosesan analitika data.", kategori: "Keterampilan Khusus" },
    { kodeCPL: "CPL04", pernyataan: "Mampu menyusun rancangan antarmuka pengguna (UI/UX) dan pengalaman interaktif.", kategori: "Keterampilan Khusus" },
    { kodeCPL: "CPL05", pernyataan: "Mampu mengintegrasikan arsitektur IoT dan sensor terdistribusi.", kategori: "Keterampilan Khusus" },
    { kodeCPL: "CPL06", pernyataan: "Mampu mengelola tata kelola data dan interoperabilitas sistem.", kategori: "Pengetahuan" },
    { kodeCPL: "CPL07", pernyataan: "Mampu mengevaluasi audit keamanan informasi dan risiko TI.", kategori: "Pengetahuan" },
    { kodeCPL: "CPL08", pernyataan: "Mampu bekerja sama dalam tim lintas disiplin dan beretika profesional.", kategori: "Sikap" },
    { kodeCPL: "CPL09", pernyataan: "Mampu menerapkan matematika dan pemikiran komputasional untuk memecahkan masalah.", kategori: "Keterampilan Umum" },
    { kodeCPL: "CPL10", pernyataan: "Mampu mengomunikasikan hasil kerja ilmiah dan teknologi secara lisan maupun tulisan.", kategori: "Keterampilan Umum" },
  ],

  plCplMatrix: [
    { kodePL: "PL01", kodeCPL: "CPL01", isMapped: true },
    { kodePL: "PL01", kodeCPL: "CPL02", isMapped: true },
    { kodePL: "PL01", kodeCPL: "CPL03", isMapped: true },
    { kodePL: "PL02", kodeCPL: "CPL04", isMapped: true },
    { kodePL: "PL02", kodeCPL: "CPL09", isMapped: true },
    { kodePL: "PL03", kodeCPL: "CPL05", isMapped: true },
    { kodePL: "PL03", kodeCPL: "CPL02", isMapped: true },
    { kodePL: "PL04", kodeCPL: "CPL06", isMapped: true },
    { kodePL: "PL05", kodeCPL: "CPL07", isMapped: true },
    { kodePL: "PL06", kodeCPL: "CPL08", isMapped: true },
    { kodePL: "PL06", kodeCPL: "CPL10", isMapped: true },
  ],

  mataKuliah: [
    { kodeMK: "MKU-101", namaMK: "Agama I", sks: 2, sksTeori: 2, sksPraktikum: 0, semester: 1, kategori: "MKU" },
    { kodeMK: "MKU-102", namaMK: "Pancasila", sks: 2, sksTeori: 2, sksPraktikum: 0, semester: 1, kategori: "MKU" },
    { kodeMK: "STI-101", namaMK: "Pengantar Sistem dan Teknologi Informasi", sks: 3, sksTeori: 3, sksPraktikum: 0, semester: 1, kategori: "Inti" },
    { kodeMK: "STI-102", namaMK: "Algoritma dan Pemrograman (+P)", sks: 3, sksTeori: 2, sksPraktikum: 1, semester: 1, kategori: "Inti" },
    { kodeMK: "STI-207", namaMK: "Struktur Data (+P)", sks: 3, sksTeori: 2, sksPraktikum: 1, semester: 2, kategori: "Inti" },
    { kodeMK: "STI-526", namaMK: "Internet of Things (+P)", sks: 3, sksTeori: 2, sksPraktikum: 1, semester: 5, kategori: "Penciri" },
    { kodeMK: "STI-635", namaMK: "Desain dan Evaluasi Antarmuka Pengguna (UI/UX) (+P)", sks: 3, sksTeori: 2, sksPraktikum: 1, semester: 6, kategori: "Penciri" },
    { kodeMK: "STI-741", namaMK: "Integrasi Layanan Cerdas Berbasis AI (+P)", sks: 3, sksTeori: 2, sksPraktikum: 1, semester: 7, kategori: "Penciri" },
    { kodeMK: "STI-743", namaMK: "Audit dan Tata Kelola Sistem Informasi", sks: 3, sksTeori: 3, sksPraktikum: 0, semester: 7, kategori: "Penciri" },
  ],

  petaCPL: [
    { kodeMK: "STI-101", namaMK: "Pengantar SISTEKIN", sks: 3, semester: 1, mapping: { CPL01: "I" } },
    { kodeMK: "STI-102", namaMK: "Algoritma Pemrograman", sks: 3, semester: 1, mapping: { CPL02: "I" } },
    { kodeMK: "STI-207", namaMK: "Struktur Data", sks: 3, semester: 2, mapping: { CPL02: "R", CPL09: "M" } },
    { kodeMK: "STI-526", namaMK: "Internet of Things", sks: 3, semester: 5, mapping: { CPL02: "R", CPL05: "M" } },
    { kodeMK: "STI-635", namaMK: "UI/UX Design", sks: 3, semester: 6, mapping: { CPL04: "M", CPL09: "R", CPL10: "M" } },
    { kodeMK: "STI-741", namaMK: "Integrasi Layanan AI", sks: 3, semester: 7, mapping: { CPL01: "R", CPL02: "M", CPL03: "M", CPL05: "R", CPL06: "M" } },
    { kodeMK: "STI-743", namaMK: "Audit & Tata Kelola SI", sks: 3, semester: 7, mapping: { CPL07: "M", CPL09: "R", CPL10: "M" } },
  ],

  cpmkSubCpmk: [
    {
      kodeMK: "STI-741",
      namaMK: "Integrasi Layanan Cerdas Berbasis AI",
      plUtama: "PL01",
      cpmkKode: "CPMK1",
      cpmkRumusan: "Menganalisis kebutuhan integrasi layanan cerdas dan data pada suatu kasus organisasi.",
      subCpmkKode: "Sub-CPMK1.1",
      subCpmkRumusan: "Mengidentifikasi kebutuhan pengguna, sumber data, dan batasan sistem.",
      kodeCPL: "CPL01",
      metodeEvaluasi: "Studi Kasus + Tugas Analisis",
    },
    {
      kodeMK: "STI-741",
      namaMK: "Integrasi Layanan Cerdas Berbasis AI",
      plUtama: "PL01",
      cpmkKode: "CPMK2",
      cpmkRumusan: "Merancang dan membangun prototipe layanan cerdas berbasis AI yang terintegrasi.",
      subCpmkKode: "Sub-CPMK2.1",
      subCpmkRumusan: "Mengembangkan API/model layanan cerdas dan mekanisme integrasi.",
      kodeCPL: "CPL02",
      metodeEvaluasi: "Praktikum + Project",
    },
    {
      kodeMK: "STI-635",
      namaMK: "Desain dan Evaluasi UI/UX",
      plUtama: "PL02",
      cpmkKode: "CPMK1",
      cpmkRumusan: "Menganalisis karakteristik, kebutuhan, dan konteks pengguna.",
      subCpmkKode: "Sub-CPMK1.1",
      subCpmkRumusan: "Menyusun persona, user journey, dan kebutuhan pengalaman pengguna.",
      kodeCPL: "CPL04",
      metodeEvaluasi: "Studi Kasus",
    },
  ],

  evaluasiMKList: [
    {
      kodeMK: "STI-741",
      namaMK: "Integrasi Layanan Cerdas Berbasis AI",
      cplDibebankan: ["CPL02", "CPL03", "CPL05", "CPL06"],
      bobot: { tugas: 0.15, kuis: 0.1, uts: 0.2, uas: 0.2, aktivitas: 0.1, project: 0.25 },
      mahasiswa: [
        { no: 1, nim: "230101001", nama: "Ahmad Rizky", tugas: 85, kuis: 80, uts: 82, uas: 88, aktivitas: 90, project: 92 },
        { no: 2, nim: "230101002", nama: "Budi Santoso", tugas: 78, kuis: 75, uts: 74, uas: 80, aktivitas: 85, project: 84 },
      ],
    },
    {
      kodeMK: "STI-635",
      namaMK: "Desain dan Evaluasi UI/UX",
      cplDibebankan: ["CPL04", "CPL09", "CPL10"],
      bobot: { tugas: 0.15, kuis: 0.1, uts: 0.2, uas: 0.2, aktivitas: 0.1, project: 0.25 },
      mahasiswa: [
        { no: 1, nim: "230101001", nama: "Ahmad Rizky", tugas: 90, kuis: 88, uts: 85, uas: 92, aktivitas: 95, project: 94 },
      ],
    },
  ],

  rekapitulasiCPL: [
    { kodeCPL: "CPL01", fokusCPL: "Analisis kebutuhan & perancangan solusi", jumlahMKPendukung: 7, mkPengukurLevelM: "STI-741", targetPercent: 75, capaianAktualPercent: 82.5, status: "Tercapai" },
    { kodeCPL: "CPL02", fokusCPL: "Pengembangan perangkat lunak & platform AI", jumlahMKPendukung: 13, mkPengukurLevelM: "STI-741", targetPercent: 75, capaianAktualPercent: 85.0, status: "Tercapai" },
    { kodeCPL: "CPL03", fokusCPL: "AI, komputasi & analitika data", jumlahMKPendukung: 12, mkPengukurLevelM: "STI-741", targetPercent: 75, capaianAktualPercent: 84.2, status: "Tercapai" },
    { kodeCPL: "CPL04", fokusCPL: "UX, gamifikasi & multimedia", jumlahMKPendukung: 10, mkPengukurLevelM: "STI-635", targetPercent: 75, capaianAktualPercent: 89.8, status: "Tercapai" },
    { kodeCPL: "CPL05", fokusCPL: "IoT, infrastruktur & integrasi sistem", jumlahMKPendukung: 11, mkPengukurLevelM: "STI-526, STI-741", targetPercent: 75, capaianAktualPercent: 81.0, status: "Tercapai" },
  ],
};
