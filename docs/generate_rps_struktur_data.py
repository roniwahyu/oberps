"""
generate_rps_struktur_data.py  (v3 — key rotation + model fallback)
====================================================================
Ujicoba God-Tier Master Prompt untuk MK Struktur Data
- Baca 3 Dahl API key dari .env (DAHL_KEY_1/2/3) + rotasi otomatis
- Model primary: MiniMaxAI/MiniMax-M2.7, fallback: moonshotai/Kimi-K2.6
- Simpan hasil ke SQLite db/custom.db (tabel: rps_generated)
- Output file: docs/RPS_StrukturData_DDMMYYYY_HHmm.md + .json

Cara pakai:
  python docs/generate_rps_struktur_data.py
"""

import sys, os, re, json, time, sqlite3, urllib.request, urllib.error
from datetime import datetime

# Fix encoding untuk Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def safe_print(*args, **kwargs):
    """Print yang aman untuk Windows console (menghindari UnicodeEncodeError)"""
    msg = ' '.join(str(a) for a in args)
    msg = msg.encode('ascii', errors='replace').decode('ascii')
    print(msg, **kwargs)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ─── Baca .env ────────────────────────────────────────────────────────────────
def load_env(path: str) -> dict:
    env = {}
    try:
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return env


ENV = load_env(os.path.join(BASE_DIR, '.env'))

# Cari API key (coba berbagai nama variable)
# Kumpulkan semua API key Dahl (untuk rotasi)
DAHL_KEYS = []
for k in ['DAHL_KEY_1', 'DAHL_KEY_2', 'DAHL_KEY_3', 'DAHL_APIKEY', 'DAHL_API_KEY']:
    v = (ENV.get(k) or os.environ.get(k) or '').strip()
    if v and v not in DAHL_KEYS:
        DAHL_KEYS.append(v)

DAHL_API_KEY = DAHL_KEYS[0] if DAHL_KEYS else ''
DAHL_MODEL_PRIMARY  = ENV.get('LLM_MODEL', 'MiniMaxAI/MiniMax-M2.7')
DAHL_MODEL_FALLBACK = ENV.get('LLM_MODEL_FALLBACK', 'moonshotai/Kimi-K2.6')

DB_PATH = os.path.join(BASE_DIR, 'db', 'custom.db')


# ─── Kurikulum Context (dari XLSX STI-207) ────────────────────────────────────
CURRICULUM_CONTEXT = """
PROGRAM STUDI: S1 Sistem dan Teknologi Informasi (STI) — Kurikulum 2025
INSTITUSI: Universitas Widya Gama Malang

PROFIL LULUSAN (PL):
PL01: AI-Driven System Developer — Mengembangkan sistem informasi berbasis AI secara profesional dan adaptif
PL02: Human-Centered UX and Gamification Designer — Merancang UX berbasis kebutuhan pengguna yang inklusif
PL03: IoT and Multimedia System Integrator — Mengembangkan dan mengintegrasikan sistem IoT & multimedia andal
PL04: Semantic Knowledge and Data Integration Engineer — Mengelola dan mengintegrasikan data lintas platform
PL05: Digital Technopreneur — Mengembangkan inovasi digital berbasis kebutuhan pasar secara berkelanjutan
PL06: Digital Governance and System Analyst — Menganalisis sistem dan mendukung tata kelola digital

CPL YANG DIBEBANKAN KE STI-207 STRUKTUR DATA:

CPL02: Mampu merancang, membangun, menguji, dan mengintegrasikan perangkat lunak, basis data, API,
dan layanan cloud untuk menghasilkan sistem informasi yang andal.
Fokus Domain: Pengembangan perangkat lunak & platform
PL Terkait: PL01, PL03, PL04

CPL09: Mampu menerapkan matematika, statistika, metode penelitian, dan pemikiran komputasional
untuk memecahkan masalah serta mengomunikasikan hasil secara ilmiah.
Fokus Domain: Fondasi ilmiah & penelitian
PL Terkait: PL01, PL04, PL06

POSISI MK DALAM KURIKULUM:
Kode MK   : STI-207
Nama MK   : Struktur Data
Semester  : 2 (Genap)
SKS       : 3 SKS
Prasyarat : STI-102 Algoritma dan Pemrograman
MK Bersamaan: STI-206 Basis Data, STI-205 Matematika Diskrit, STI-209 Aljabar Linear
"""


# ─── God-Tier System Prompt ───────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "Anda adalah Pakar Kurikulum Pendidikan Tinggi Indonesia dan Ahli Instructional Design "
    "yang menguasai OBE, SN-DIKTI, Constructive Alignment, Taksonomi Bloom Revisi (C1-C6, A1-A5, P1-P5), "
    "prinsip ABCD, dan Student-Centered Learning (Case Method, PjBL, SGD, Discovery Learning). "
    "ATURAN WAJIB: Kembalikan HANYA JSON murni valid. Mulai langsung dengan { dan akhiri dengan }. "
    "Tidak ada teks sebelum atau sesudah JSON. Tidak ada markdown fence."
)


def build_god_tier_prompt(curriculum_ctx: str) -> str:
    return f"""IDENTITAS PERAN: Pakar Kurikulum OBE & SN-DIKTI dengan keahlian Constructive Alignment.

{"="*70}
DATA MATA KULIAH (INPUT):
{"="*70}
- Nama Mata Kuliah  : Struktur Data
- Kode MK           : STI-207
- Bobot SKS         : 3 SKS (2 SKS Teori + 1 SKS Praktikum)
- Semester          : 2 (Semester Genap)
- Program Studi     : S1 Sistem dan Teknologi Informasi
- Jenjang           : S1 — Universitas Widya Gama Malang

{"="*70}
DOKUMEN ACUAN KURIKULUM PRODI (PRIORITAS TERTINGGI):
{"="*70}
{curriculum_ctx}

INSTRUKSI: CPL_PRODI wajib menggunakan TEPAT CPL02 dan CPL09 dari kurikulum di atas.

{"="*70}
CHAIN-OF-THOUGHT INTERNAL (LAKUKAN SEBELUM OUTPUT JSON):
{"="*70}

[STEP 1 — ANALISIS CPL]
Gunakan CPL02 dan CPL09 dari kurikulum STI UWG 2025.
Identifikasi kata kerja utama dan level Bloom yang sesuai konteks Struktur Data:
- CPL02: merancang, membangun, menguji, mengintegrasikan → C4-C5
- CPL09: menerapkan, pemikiran komputasional, memecahkan masalah → C3-C4

[STEP 2 — RUMUSKAN 4 CPMK (ABCD + KKO TERUKUR)]
Format: "Mahasiswa mampu [KKO Anderson&Krathwohl] [objek] [kondisi] [standar ketercapaian]"
DILARANG KERAS kata: memahami, mengetahui, mengerti, mempelajari → ganti otomatis!
Contoh KKO terukur: menganalisis, mengimplementasikan, mengevaluasi, membandingkan, merancang

Saran CPMK (kembangkan menjadi kalimat ABCD yang lengkap):
CPMK-1 (CPL09): Menganalisis karakteristik, operasi, dan kompleksitas Big-O berbagai struktur data
CPMK-2 (CPL02): Mengimplementasikan struktur data linier (Array, Linked List, Stack, Queue) dalam kode
CPMK-3 (CPL02): Mengimplementasikan struktur data non-linier (Tree, Graph) dan traversal-nya
CPMK-4 (CPL09+CPL02): Mengevaluasi dan memilih algoritma sorting & searching untuk kasus nyata

[STEP 3 — DESKRIPSI MK (150-200 KATA)]
Cakup: ruang lingkup topik SD, relevansi ke pengembangan software/sistem informasi,
gambaran aktivitas (teori analisis kompleksitas + praktik implementasi Python).

[STEP 4 — SCAFFOLDING 16 MINGGU]
WAJIB: Setiap Mx_KEMAMPUAN HARUS kalimat kemampuan KKO, BUKAN judul topik!
BENAR: "Mahasiswa mampu mengimplementasikan operasi push dan pop pada Stack"
SALAH: "Stack dan Queue" atau "Pertemuan 5"

Urutan scaffolding (dari dasar ke lanjut):
M1: Pengantar SD + Array (operasi, Big-O dasar) → C2-C3
M2: Array lanjut + Analisis kompleksitas waktu & ruang → C4
M3: Single & Double Linked List (implementasi node, insert, delete) → C3
M4: Circular Linked List + perbandingan jenis Linked List → C4
M5: Stack (Array & LL-based, aplikasi: ekspresi matematika) → C3
M6: Queue, Circular Queue, Deque (aplikasi antrian nyata) → C3
M7: Hash Table + Rekursi (basis algoritma divide & conquer) → C4
M8: UTS — Evaluasi Tengah Semester (bobot WAJIB = 25)
M9: Binary Tree + Binary Search Tree (operasi CRUD) → C3
M10: AVL Tree + Heap Tree (self-balancing, priority queue) → C4
M11: Graf (representasi adjacency list & matrix, BFS, DFS) → C4
M12: Sorting: Bubble, Selection, Insertion + analisis komparatif → C4
M13: Sorting lanjut: Merge Sort, Quick Sort, Heap Sort + Big-O → C5
M14: Searching: Linear, Binary, Hash + analisis kasus terbaik/terburuk → C4
M15: Proyek Terpadu: implementasi SD untuk studi kasus aplikasi nyata → C5
M16: UAS — Evaluasi Akhir Semester (bobot WAJIB = 25)

[STEP 5 — VALIDASI KKO + HITUNG BOBOT]
Review semua Mx_KEMAMPUAN → ganti kata abstrak → pastikan ada progres Bloom level
Distribusi bobot (total WAJIB = 100):
M1=5, M2=5, M3=4, M4=4, M5=4, M6=3, M7=5, M8=25,
M9=4, M10=4, M11=3, M12=4, M13=3, M14=3, M15=5, M16=25
Verifikasi: 5+5+4+4+4+3+5+25+4+4+3+4+3+3+5+25 = 100 ✓

[STEP 6 — METODE SCL BERVARIASI]
M1-M7: Ceramah interaktif + Discovery Learning + Small Group Discussion (SGD)
M8: Ujian Terbuka (essay + praktek coding)
M9-M11: Discovery Learning + Case Analysis (analisis algoritma pada dataset nyata)
M12-M15: Case Method + Project-Based Learning (PjBL)
M16: Ujian Praktikum + Presentasi Proyek

[STEP 7 — RUBRIK ANALITIK 4x4]
Kriteria (baris):
1. Ketajaman Analisis Kompleksitas Algoritma (Bobot 30%)
2. Kebenaran & Efisiensi Implementasi Kode (Bobot 30%)
3. Kualitas Dokumentasi & Komunikasi Teknis (Bobot 20%)
4. Kolaborasi Tim & Inisiatif Problem Solving (Bobot 20%)
Skala (kolom): Sangat Baik (81-100) | Baik (61-80) | Cukup (41-60) | Kurang (<40)
DESKRIPTOR HARUS SPESIFIK & OBSERVABLE. Contoh "Sangat Baik - Ketajaman Analisis":
"Mahasiswa menganalisis Big-O secara tepat untuk semua kasus (best/average/worst),
disertai bukti empiris hasil benchmarking kode nyata."

[STEP 8 — RANCANGAN TUGAS MAHASISWA]
Judul: Implementasi Sistem Antrean Layanan Publik menggunakan Struktur Data
Driving Question: "Bagaimana memilih dan mengimplementasikan struktur data yang paling
efisien untuk mensimulasikan antrean layanan (rumah sakit/bank/loket) dengan kapasitas
dinamis dan fitur prioritas?"
Fase: Perencanaan (M12) → Implementasi (M13) → Evaluasi & Presentasi (M15)
Output: Program Python + Laporan Analisis Kompleksitas + Slide Presentasi

{"="*70}
OUTPUT JSON — GUNAKAN SKEMA PERSIS INI:
{"="*70}

{{
  "CPL_PRODI": "CPL02: Mampu merancang, membangun, menguji, dan mengintegrasikan perangkat lunak, basis data, API, dan layanan cloud untuk menghasilkan sistem informasi yang andal (Pengembangan perangkat lunak & platform; PL01, PL03, PL04).\\nCPL09: Mampu menerapkan matematika, statistika, metode penelitian, dan pemikiran komputasional untuk memecahkan masalah serta mengomunikasikan hasil secara ilmiah (Fondasi ilmiah & penelitian; PL01, PL04, PL06).",
  "CPMK": "CPMK-1 (CPL09 — C4): Mahasiswa mampu menganalisis karakteristik, operasi, dan kompleksitas Big-O berbagai struktur data linier dan non-linier untuk menentukan pilihan struktur data yang tepat sesuai kebutuhan sistem.\\nCPMK-2 (CPL02 — C3): Mahasiswa mampu mengimplementasikan struktur data linier (Array, Linked List, Stack, Queue) menggunakan bahasa pemrograman Python dengan operasi dasar yang benar dan efisien.\\nCPMK-3 (CPL02 — C3): Mahasiswa mampu mengimplementasikan struktur data non-linier (Tree, Graph) beserta algoritma traversal-nya secara akurat dalam lingkungan praktikum.\\nCPMK-4 (CPL09+CPL02 — C5): Mahasiswa mampu mengevaluasi dan memilih algoritma sorting dan searching yang paling efisien berdasarkan analisis kompleksitas Big-O untuk menyelesaikan permasalahan pengolahan data skala menengah.",
  "TAKSONOMI": [
    {{"TAK_KODE": "CPL09", "TAK_CPMK": "CPMK-1: Menganalisis kompleksitas Big-O struktur data", "TAK_ASPEK": "Pengetahuan", "TAK_LVL": "C4"}},
    {{"TAK_KODE": "CPL02", "TAK_CPMK": "CPMK-2: Mengimplementasikan struktur data linier", "TAK_ASPEK": "Keterampilan Khusus", "TAK_LVL": "C3"}},
    {{"TAK_KODE": "CPL02", "TAK_CPMK": "CPMK-3: Mengimplementasikan struktur data non-linier", "TAK_ASPEK": "Keterampilan Khusus", "TAK_LVL": "C3"}},
    {{"TAK_KODE": "CPL09", "TAK_CPMK": "CPMK-4: Mengevaluasi algoritma sorting & searching", "TAK_ASPEK": "Pengetahuan & Keterampilan", "TAK_LVL": "C5"}}
  ],
  "DESKRIPSI": "[ISI: 150-200 kata deskripsi MK Struktur Data]",
  "MATERI_POKOK": "[ISI: daftar materi pokok bernomor]",
  "REFERENSI_UTAMA": "[ISI: 2-3 buku referensi format APA 7th]",
  "REFERENSI_PENDUKUNG": "[ISI: 1-2 referensi pendukung]",
  "INTEGRASI_RISPKM": "[ISI: integrasi riset/pengabdian]",
  "MEDIA_LUNAK": "Python IDE (VSCode/PyCharm), Jupyter Notebook, GitHub, E-Learning LMS, Visualizer Algoritma (VisuAlgo)",
  "MEDIA_KERAS": "Proyektor, Whiteboard, Laboratorium Komputer",
  "TEAM_TEACHING": "-",
  "MK_SYARAT": "STI-102 Algoritma dan Pemrograman",
  "M1_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M1_MATERI": "[ISI]", "M1_INDIKATOR": "[ISI]", "M1_TEKNIK": "[ISI]", "M1_BOBOT": "5", "M1_METODE": "[ISI]", "M1_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M1_PENGALAMAN": "[ISI]", "M1_MEDIA": "[ISI]", "M1_REFERENSI": "[ISI]",
  "M2_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M2_MATERI": "[ISI]", "M2_INDIKATOR": "[ISI]", "M2_TEKNIK": "[ISI]", "M2_BOBOT": "5", "M2_METODE": "[ISI]", "M2_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M2_PENGALAMAN": "[ISI]", "M2_MEDIA": "[ISI]", "M2_REFERENSI": "[ISI]",
  "M3_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M3_MATERI": "[ISI]", "M3_INDIKATOR": "[ISI]", "M3_TEKNIK": "[ISI]", "M3_BOBOT": "4", "M3_METODE": "[ISI]", "M3_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M3_PENGALAMAN": "[ISI]", "M3_MEDIA": "[ISI]", "M3_REFERENSI": "[ISI]",
  "M4_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M4_MATERI": "[ISI]", "M4_INDIKATOR": "[ISI]", "M4_TEKNIK": "[ISI]", "M4_BOBOT": "4", "M4_METODE": "[ISI]", "M4_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M4_PENGALAMAN": "[ISI]", "M4_MEDIA": "[ISI]", "M4_REFERENSI": "[ISI]",
  "M5_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M5_MATERI": "[ISI]", "M5_INDIKATOR": "[ISI]", "M5_TEKNIK": "[ISI]", "M5_BOBOT": "4", "M5_METODE": "[ISI]", "M5_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M5_PENGALAMAN": "[ISI]", "M5_MEDIA": "[ISI]", "M5_REFERENSI": "[ISI]",
  "M6_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M6_MATERI": "[ISI]", "M6_INDIKATOR": "[ISI]", "M6_TEKNIK": "[ISI]", "M6_BOBOT": "3", "M6_METODE": "[ISI]", "M6_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M6_PENGALAMAN": "[ISI]", "M6_MEDIA": "[ISI]", "M6_REFERENSI": "[ISI]",
  "M7_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M7_MATERI": "[ISI]", "M7_INDIKATOR": "[ISI]", "M7_TEKNIK": "[ISI]", "M7_BOBOT": "5", "M7_METODE": "[ISI]", "M7_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M7_PENGALAMAN": "[ISI]", "M7_MEDIA": "[ISI]", "M7_REFERENSI": "[ISI]",
  "M8_KEMAMPUAN": "EVALUASI TENGAH SEMESTER (UTS)", "M8_MATERI": "Materi Pertemuan 1 s.d. 7 (Array, Linked List, Stack, Queue, Hash Table, Rekursi)", "M8_INDIKATOR": "Ketepatan analisis kompleksitas dan kebenaran implementasi kode struktur data linier", "M8_TEKNIK": "Ujian Tulis + Praktikum Coding", "M8_BOBOT": "25", "M8_METODE": "Ujian Terbuka (Essay + Coding)", "M8_WAKTU": "TM: 1x100'", "M8_PENGALAMAN": "Mengerjakan soal analisis Big-O dan mengimplementasikan kode SD dalam batas waktu", "M8_MEDIA": "Komputer Lab / E-Learning", "M8_REFERENSI": "-",
  "M9_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M9_MATERI": "[ISI]", "M9_INDIKATOR": "[ISI]", "M9_TEKNIK": "[ISI]", "M9_BOBOT": "4", "M9_METODE": "[ISI]", "M9_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M9_PENGALAMAN": "[ISI]", "M9_MEDIA": "[ISI]", "M9_REFERENSI": "[ISI]",
  "M10_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M10_MATERI": "[ISI]", "M10_INDIKATOR": "[ISI]", "M10_TEKNIK": "[ISI]", "M10_BOBOT": "4", "M10_METODE": "[ISI]", "M10_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M10_PENGALAMAN": "[ISI]", "M10_MEDIA": "[ISI]", "M10_REFERENSI": "[ISI]",
  "M11_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M11_MATERI": "[ISI]", "M11_INDIKATOR": "[ISI]", "M11_TEKNIK": "[ISI]", "M11_BOBOT": "3", "M11_METODE": "[ISI]", "M11_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M11_PENGALAMAN": "[ISI]", "M11_MEDIA": "[ISI]", "M11_REFERENSI": "[ISI]",
  "M12_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M12_MATERI": "[ISI]", "M12_INDIKATOR": "[ISI]", "M12_TEKNIK": "[ISI]", "M12_BOBOT": "4", "M12_METODE": "[ISI]", "M12_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M12_PENGALAMAN": "[ISI]", "M12_MEDIA": "[ISI]", "M12_REFERENSI": "[ISI]",
  "M13_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M13_MATERI": "[ISI]", "M13_INDIKATOR": "[ISI]", "M13_TEKNIK": "[ISI]", "M13_BOBOT": "3", "M13_METODE": "[ISI]", "M13_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M13_PENGALAMAN": "[ISI]", "M13_MEDIA": "[ISI]", "M13_REFERENSI": "[ISI]",
  "M14_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M14_MATERI": "[ISI]", "M14_INDIKATOR": "[ISI]", "M14_TEKNIK": "[ISI]", "M14_BOBOT": "3", "M14_METODE": "[ISI]", "M14_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M14_PENGALAMAN": "[ISI]", "M14_MEDIA": "[ISI]", "M14_REFERENSI": "[ISI]",
  "M15_KEMAMPUAN": "[KALIMAT KKO LENGKAP]", "M15_MATERI": "[ISI]", "M15_INDIKATOR": "[ISI]", "M15_TEKNIK": "[ISI]", "M15_BOBOT": "5", "M15_METODE": "[ISI]", "M15_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'", "M15_PENGALAMAN": "[ISI]", "M15_MEDIA": "[ISI]", "M15_REFERENSI": "[ISI]",
  "M16_KEMAMPUAN": "EVALUASI AKHIR SEMESTER (UAS)", "M16_MATERI": "Materi Pertemuan 9 s.d. 15 (Tree, Graph, Sorting, Searching, Proyek)", "M16_INDIKATOR": "Ketepatan implementasi algoritma kompleks dan analisis performa proyek akhir", "M16_TEKNIK": "Ujian Praktikum + Presentasi Proyek Kelompok", "M16_BOBOT": "25", "M16_METODE": "Ujian Akhir + Presentasi", "M16_WAKTU": "TM: 1x100'", "M16_PENGALAMAN": "Mengerjakan soal UAS dan mempresentasikan proyek implementasi sistem antrean", "M16_MEDIA": "Komputer Lab / Zoom / E-Learning", "M16_REFERENSI": "-",
  "RANCANGAN_TUGAS": "[ISI: rancangan tugas lengkap 8 komponen]",
  "RUBRIK_PENILAIAN": "[ISI: rubrik analitik 4x4 dengan deskriptor spesifik]"
}}

INGAT: Ganti SEMUA placeholder [KALIMAT KKO LENGKAP] dan [ISI] dengan konten substantif yang relevan.
Pastikan total bobot = 100. Output harus JSON valid yang dapat langsung diparse."""


# ─── SQLite Helper ────────────────────────────────────────────────────────────
def init_db(db_path: str):
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS rps_generated (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            mata_kuliah TEXT NOT NULL,
            kode_mk     TEXT,
            semester    TEXT,
            prodi       TEXT,
            provider    TEXT,
            model       TEXT,
            prompt_text TEXT,
            raw_response TEXT,
            json_data   TEXT,
            md_path     TEXT,
            bobot_total INTEGER,
            status      TEXT DEFAULT 'ok',
            created_at  TEXT DEFAULT (datetime('now','localtime'))
        )
    """)
    conn.commit()
    return conn


def save_to_db(conn, meta: dict):
    conn.execute("""
        INSERT INTO rps_generated
        (mata_kuliah, kode_mk, semester, prodi, provider, model,
         prompt_text, raw_response, json_data, md_path, bobot_total, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        meta['mata_kuliah'], meta['kode_mk'], meta['semester'], meta['prodi'],
        meta['provider'], meta['model'],
        meta['prompt_text'][:5000],
        meta['raw_response'][:10000],
        meta['json_data'],
        meta['md_path'],
        meta['bobot_total'],
        meta['status']
    ))
    conn.commit()


# ─── LLM API Calls ────────────────────────────────────────────────────────────
def call_api_single(api_key: str, model: str, prompt: str,
                    base_url: str = "https://inference.dahl.global/v1",
                    timeout: int = 200) -> str:
    """Satu panggilan API ke endpoint OpenAI-compatible"""
    url = f"{base_url.rstrip('/')}/chat/completions"
    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 8192,
        "temperature": 0.2
    }).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
    })
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return data['choices'][0]['message']['content']


def call_api_with_rotation(prompt: str,
                           keys: list,
                           models: list,
                           base_url: str = "https://inference.dahl.global/v1") -> tuple:
    """Rotasi key + model: coba semua kombinasi sampai berhasil"""
    errors = []
    for model in models:
        for idx, key in enumerate(keys):
            safe_print(f"  [Try] model={model} key=key_{idx+1} ({key[:16]}...)")
            try:
                result = call_api_single(key, model, prompt, base_url, timeout=200)
                safe_print(f"  [OK] Berhasil dengan model={model} key_{idx+1}")
                return result, model, key
            except urllib.error.HTTPError as e:
                body = e.read().decode('utf-8', errors='replace')[:200]
                err = f"HTTP {e.code} model={model} key_{idx+1}: {body[:100]}"
                safe_print(f"  [FAIL] {err}")
                errors.append(err)
                if e.code == 524:  # timeout, tunggu sebentar sebelum retry
                    safe_print("  [WAIT] 524 timeout, tunggu 10 detik...")
                    time.sleep(10)
            except Exception as e:
                err = f"{type(e).__name__} model={model} key_{idx+1}: {e}"
                safe_print(f"  [FAIL] {err}")
                errors.append(err)
    raise RuntimeError(f"Semua kombinasi key+model gagal. Errors: {errors}")


def extract_json(text: str) -> dict:
    """Ekstrak JSON dari respon LLM, termasuk strip <think>...</think> block"""
    text = text.strip()
    # Strip <think>...</think> block (MiniMax, DeepSeek reasoning models)
    text = re.sub(r'<think>[\s\S]*?</think>', '', text, flags=re.IGNORECASE).strip()
    # Remove markdown fence
    fence = re.search(r'```(?:json)?\s*([\s\S]*?)```', text, re.IGNORECASE)
    if fence:
        text = fence.group(1).strip()
    # Find JSON object boundaries
    start, end = text.find('{'), text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return json.loads(text)


# ─── Markdown Generator ───────────────────────────────────────────────────────
def to_markdown(data: dict) -> str:
    ts = datetime.now().strftime("%d %B %Y")
    md = f"""# RENCANA PEMBELAJARAN SEMESTER (RPS)
## Mata Kuliah: Struktur Data (STI-207)

> **SmartRPS Builder** — God-Tier Master Prompt (Distilasi 18 Prompt OBE)  
> Kurikulum: S1 Sistem dan Teknologi Informasi, Universitas Widya Gama Malang  
> Referensi XLSX: `Implementasi_Modul_OBE_S1_SISTEKIN_UWG_2025.xlsx`  
> Generated: {ts}

---

## A. IDENTITAS MATA KULIAH

| Komponen | Keterangan |
|:---|:---|
| **Nama Mata Kuliah** | Struktur Data |
| **Kode MK** | STI-207 |
| **Bobot SKS** | 3 SKS (2 SKS Teori + 1 SKS Praktikum) |
| **Semester** | II (Genap) |
| **Program Studi** | S1 Sistem dan Teknologi Informasi |
| **Jenjang** | Strata 1 (S1) |
| **MK Prasyarat** | {data.get('MK_SYARAT', 'STI-102 Algoritma dan Pemrograman')} |
| **Team Teaching** | {data.get('TEAM_TEACHING', '-')} |

---

## B. CPL PRODI YANG DIBEBANKAN

{data.get('CPL_PRODI', '-')}

---

## C. CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK)

{data.get('CPMK', '-')}

---

## D. PEMETAAN CPL — CPMK — TAKSONOMI BLOOM

| Kode CPL | Rumusan CPMK | Aspek | Level Bloom |
|:---|:---|:---|:---|
"""
    for t in data.get('TAKSONOMI', []):
        md += f"| {t.get('TAK_KODE','')} | {t.get('TAK_CPMK','')} | {t.get('TAK_ASPEK','')} | **{t.get('TAK_LVL','')}** |\n"

    md += f"""
---

## E. DESKRIPSI MATA KULIAH

{data.get('DESKRIPSI', '-')}

---

## F. MATERI POKOK

{data.get('MATERI_POKOK', '-')}

---

## G. REFERENSI PEMBELAJARAN

### Referensi Utama
{data.get('REFERENSI_UTAMA', '-')}

### Referensi Pendukung
{data.get('REFERENSI_PENDUKUNG', '-')}

---

## H. MEDIA PEMBELAJARAN

| Media Lunak | Media Keras |
|:---|:---|
| {data.get('MEDIA_LUNAK', '-')} | {data.get('MEDIA_KERAS', '-')} |

---

## I. MATRIKS RENCANA PEMBELAJARAN 16 MINGGU

| Mgg | Kemampuan Akhir (Sub-CPMK) | Bahan Kajian | Metode | Waktu | Indikator Penilaian | Teknik Penilaian | Bobot |
|:---:|:---|:---|:---|:---|:---|:---|:---:|
"""
    total_bobot = 0
    for i in range(1, 17):
        k = data.get(f'M{i}_KEMAMPUAN', '')
        m = data.get(f'M{i}_MATERI', '')
        met = data.get(f'M{i}_METODE', '')
        w = data.get(f'M{i}_WAKTU', '')
        ind = data.get(f'M{i}_INDIKATOR', '')
        tek = data.get(f'M{i}_TEKNIK', '')
        b = data.get(f'M{i}_BOBOT', '0')
        try:
            total_bobot += int(b)
        except:
            pass
        is_eval = any(x in k for x in ['UTS', 'UAS', 'EVALUASI'])
        if is_eval:
            md += f"| **{i}** | **{k}** | {m} | {met} | {w} | {ind} | {tek} | **{b}%** |\n"
        else:
            md += f"| {i} | {k} | {m} | {met} | {w} | {ind} | {tek} | {b}% |\n"

    md += f"""
> **Total Bobot: {total_bobot}%** {'✅ (Valid = 100%)' if total_bobot == 100 else f'⚠️ (Harus = 100%)'}

---

## J. RANCANGAN TUGAS MAHASISWA

{data.get('RANCANGAN_TUGAS', '-')}

---

## K. RUBRIK PENILAIAN ANALITIK

{data.get('RUBRIK_PENILAIAN', '-')}

---

## L. INTEGRASI PENELITIAN & PENGABDIAN MASYARAKAT

{data.get('INTEGRASI_RISPKM', '-')}

---

*RPS ini dihasilkan oleh SmartRPS Builder menggunakan God-Tier Master Prompt.*  
*Distilasi dari 18 panduan prompt OBE — sesuai SN-DIKTI & Kurikulum STI UWG 2025.*  
*Total bobot: {total_bobot}%*
"""
    return md, total_bobot


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    provider = ENV.get('LLM_PROVIDER', 'dahl')
    base_url = ENV.get('LLM_BASE_URL', 'https://inference.dahl.global/v1')
    models   = [DAHL_MODEL_PRIMARY, DAHL_MODEL_FALLBACK]
    models   = list(dict.fromkeys(m for m in models if m))  # deduplicate

    if not DAHL_KEYS:
        safe_print("[ERROR] Tidak ada DAHL API key di .env!")
        safe_print("  Tambahkan: DAHL_KEY_1=dahl_xxx ke file .env")
        sys.exit(1)

    safe_print(f"[SmartRPS GOD-TIER] Provider : {provider}")
    safe_print(f"[SmartRPS GOD-TIER] Models   : {models}")
    safe_print(f"[SmartRPS GOD-TIER] Endpoint : {base_url}")
    safe_print(f"[SmartRPS GOD-TIER] Keys     : {len(DAHL_KEYS)} key(s) tersedia")
    safe_print(f"[SmartRPS GOD-TIER] Key list : {[k[:16]+'...' for k in DAHL_KEYS]}")
    safe_print("")

    prompt = build_god_tier_prompt(CURRICULUM_CONTEXT)
    print(f"[SmartRPS] Prompt chars: {len(prompt)}")
    print(f"[SmartRPS] Mengirim ke LLM API... (estimasi 45-120 detik)")

    t0 = time.time()
    raw_text = ""
    rps_data = {}
    status = "ok"
    bobot_total = 0
    md_content = "# RPS Generation Failed\n\nTidak ada output dari LLM."
    used_model = models[0] if models else "unknown"
    used_key = DAHL_KEYS[0][:16] + "..." if DAHL_KEYS else "unknown"

    try:
        safe_print(f"[SmartRPS] Mencoba {len(DAHL_KEYS)} key x {len(models)} model...")
        raw_text, used_model, used_key = call_api_with_rotation(
            prompt, DAHL_KEYS, models, base_url
        )
        elapsed = time.time() - t0
        safe_print(f"[SmartRPS] Respon: {elapsed:.1f}s | {len(raw_text)} chars")
        safe_print(f"[SmartRPS] Model dipakai : {used_model}")
        safe_print(f"[SmartRPS] Key dipakai   : {used_key[:16]}...")

        # Tampilkan snippet awal untuk debug
        snippet = raw_text[:200].replace('\n', ' ')
        safe_print(f"[SmartRPS] Raw snippet   : {snippet}")

        rps_data = extract_json(raw_text)
        safe_print(f"[SmartRPS] JSON parsed: {len(rps_data)} fields")

        md_content, bobot_total = to_markdown(rps_data)
        safe_print(f"[SmartRPS] Total bobot: {bobot_total}%")

    except json.JSONDecodeError as e:
        safe_print(f"[SmartRPS] JSON Parse Error: {e}")
        safe_print(f"  Raw snippet: {raw_text[:300]}")
        status = "json_error"
        md_content = f"# ERROR: JSON Parse Failed\n\n```\n{raw_text[:2000]}\n```"
        bobot_total = 0
    except RuntimeError as e:
        safe_print(f"[SmartRPS] Semua API gagal: {e}")
        status = "all_failed"
        md_content = f"# ERROR: Semua LLM Gagal\n\n{e}"
        bobot_total = 0
    except Exception as e:
        safe_print(f"[SmartRPS] Error: {type(e).__name__}: {e}")
        status = f"error_{type(e).__name__}"
        md_content = f"# ERROR\n\n{e}"
        bobot_total = 0

    # Save files
    ts = datetime.now().strftime('%d%m%Y_%H%M')
    json_path = os.path.join(BASE_DIR, 'docs', f'RPS_StrukturData_{ts}.json')
    md_path = os.path.join(BASE_DIR, 'docs', f'RPS_StrukturData_{ts}.md')

    with open(os.path.join(BASE_DIR, 'docs', 'rps_raw_response.txt'), 'w', encoding='utf-8') as f:
        f.write(raw_text)

    if rps_data:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(rps_data, f, ensure_ascii=False, indent=2)
        print(f"[SmartRPS] JSON  -> {json_path}")

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"[SmartRPS] MD    -> {md_path}")

    # Save to SQLite
    try:
        conn = init_db(DB_PATH)
        save_to_db(conn, {
            'mata_kuliah': 'Struktur Data',
            'kode_mk': 'STI-207',
            'semester': '2',
            'prodi': 'S1 Sistem dan Teknologi Informasi',
            'provider': provider,
            'model': used_model,
            'prompt_text': prompt,
            'raw_response': raw_text,
            'json_data': json.dumps(rps_data, ensure_ascii=False),
            'md_path': md_path,
            'bobot_total': bobot_total,
            'status': status
        })
        conn.close()
        safe_print(f"[SmartRPS] SQLite -> db/custom.db (tabel: rps_generated)")
    except Exception as e:
        safe_print(f"[SmartRPS] SQLite warning: {e}")

    print()
    if status == "ok":
        safe_print(f"[SmartRPS] SELESAI! Total bobot: {bobot_total}%")
    else:
        safe_print(f"[SmartRPS] Status: {status}")
    safe_print(f"[SmartRPS] Output: docs/RPS_StrukturData_{ts}.md")


if __name__ == '__main__':
    main()
