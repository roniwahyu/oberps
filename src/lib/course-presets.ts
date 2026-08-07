// Preset mata kuliah templates for quick-start

export interface CoursePreset {
  id: string;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string;
  kategori: string;
  icon: string; // lucide icon name
}

export const COURSE_PRESETS: CoursePreset[] = [
  {
    id: "rpl",
    mataKuliah: "Rekayasa Perangkat Lunak",
    sks: "3",
    semester: "4",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas konsep, prinsip, dan metodologi dalam rekayasa perangkat lunak mencakup analisis kebutuhan, desain, implementasi, pengujian, dan pemeliharaan perangkat lunak.",
    kategori: "Pemrograman",
    icon: "Code2",
  },
  {
    id: "pbo",
    mataKuliah: "Pemrograman Berorientasi Objek",
    sks: "3",
    semester: "3",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas konsep pemrograman berorientasi objek meliputi encapsulation, inheritance, polymorphism, dan abstraction menggunakan bahasa pemrograman modern.",
    kategori: "Pemrograman",
    icon: "Code2",
  },
  {
    id: "bd",
    mataKuliah: "Basis Data",
    sks: "3",
    semester: "3",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas konsep model data, normalisasi, SQL, transaksi, dan manajemen sistem basis data relasional serta NoSQL.",
    kategori: "Data",
    icon: "Database",
  },
  {
    id: "jaringan",
    mataKuliah: "Jaringan Komputer",
    sks: "3",
    semester: "4",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas konsep dasar jaringan komputer, protokol TCP/IP, routing, switching, dan arsitektur jaringan modern.",
    kategori: "Infrastruktur",
    icon: "Network",
  },
  {
    id: "ai",
    mataKuliah: "Kecerdasan Buatan",
    sks: "3",
    semester: "5",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas konsep kecerdasan buatan meliputi search algorithms, machine learning, neural networks, dan aplikasi AI modern.",
    kategori: "AI/ML",
    icon: "Brain",
  },
  {
    id: "ml",
    mataKuliah: "Pembelajaran Mesin",
    sks: "3",
    semester: "6",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas algoritma pembelajaran mesin supervised dan unsupervised, evaluasi model, dan implementasi menggunakan library modern.",
    kategori: "AI/ML",
    icon: "Brain",
  },
  {
    id: "algoritma",
    mataKuliah: "Algoritma dan Struktur Data",
    sks: "4",
    semester: "2",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas analisis kompleksitas algoritma, struktur data dasar (list, tree, graph), dan algoritma sorting serta searching.",
    kategori: "Dasar",
    icon: "Binary",
  },
  {
    id: "sisop",
    mataKuliah: "Sistem Operasi",
    sks: "3",
    semester: "4",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas konsep sistem operasi meliputi process management, memory management, file system, dan concurrency.",
    kategori: "Infrastruktur",
    icon: "Cpu",
  },
  {
    id: "kewirausahaan",
    mataKuliah: "Kewirausahaan",
    sks: "2",
    semester: "6",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas konsep kewirausahaan, identifikasi peluang usaha, business model canvas, dan pengembangan startup berbasis teknologi.",
    kategori: "Umum",
    icon: "Rocket",
  },
  {
    id: "metpen",
    mataKuliah: "Metodologi Penelitian",
    sks: "2",
    semester: "6",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas metode penelitian ilmiah, penulisan proposal, teknik pengumpulan data, dan analisis statistik untuk penelitian.",
    kategori: "Umum",
    icon: "Microscope",
  },
  {
    id: "si",
    mataKuliah: "Sistem Informasi Manajemen",
    sks: "3",
    semester: "3",
    programStudi: "S1 Sistem Informasi",
    deskripsi:
      "Mata kuliah ini membahas peran sistem informasi dalam organisasi, arsitektur SIM, pengambilan keputusan, dan transformasi digital.",
    kategori: "Sistem Informasi",
    icon: "LayoutDashboard",
  },
  {
    id: "manajemen-proyek",
    mataKuliah: "Manajemen Proyek TI",
    sks: "3",
    semester: "6",
    programStudi: "S1 Teknik Informatika",
    deskripsi:
      "Mata kuliah ini membahas manajemen proyek teknologi informasi meliputi perencanaan, penjadwalan, manajemen risiko, dan metodologi Agile/Scrum.",
    kategori: "Manajemen",
    icon: "ClipboardList",
  },
];

export const PRESET_CATEGORIES = [
  "Semua",
  "Pemrograman",
  "Data",
  "AI/ML",
  "Infrastruktur",
  "Dasar",
  "Sistem Informasi",
  "Manajemen",
  "Umum",
];
