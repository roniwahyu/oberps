"""
generate_rps_part2.py  (v3 clean)
==================================
Lengkapi M10-M16, Rubrik, Rancangan Tugas dari rps_repaired.json
Menggunakan key rotation (3 Dahl keys) + robust JSON repair
"""
import sys, os, re, json, time, urllib.request, urllib.error
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def safe_print(*args, **kwargs):
    msg = ' '.join(str(a) for a in args)
    try:
        print(msg, **kwargs)
    except:
        print(msg.encode('ascii', errors='replace').decode('ascii'), **kwargs)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_env(path):
    env = {}
    try:
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    except: pass
    return env

ENV = load_env(os.path.join(BASE_DIR, '.env'))

DAHL_KEYS = []
for k in ['DAHL_KEY_1', 'DAHL_KEY_2', 'DAHL_KEY_3', 'DAHL_APIKEY', 'DAHL_API_KEY']:
    v = (ENV.get(k) or '').strip()
    if v and v not in DAHL_KEYS:
        DAHL_KEYS.append(v)

MODEL = 'MiniMaxAI/MiniMax-M2.7'
BASE_URL = 'https://inference.dahl.global/v1'

SYSTEM_PROMPT = (
    "Anda adalah Pakar Kurikulum OBE & SN-DIKTI Indonesia. "
    "Kembalikan HANYA JSON murni valid, dimulai { dan diakhiri }. "
    "Tidak ada teks lain. Bahasa Indonesia formal."
)

# ─── API ────────────────────────────────────────────────────────────────────
def call_api(api_key, model, prompt, timeout=180):
    url = f"{BASE_URL}/chat/completions"
    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 5000,
        "temperature": 0.2
    }).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    })
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return data['choices'][0]['message']['content']

def call_rotate(prompt, keys=DAHL_KEYS, model=MODEL, timeout=180):
    errors = []
    for idx, key in enumerate(keys):
        safe_print(f"  [Try] key_{idx+1} ({key[:16]}...)")
        try:
            r = call_api(key, model, prompt, timeout)
            safe_print(f"  [OK] key_{idx+1}")
            return r
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='replace')[:80]
            safe_print(f"  [FAIL] HTTP {e.code}: {body[:60]}")
            errors.append(f"HTTP {e.code}")
        except Exception as e:
            safe_print(f"  [FAIL] {type(e).__name__}: {e}")
            errors.append(str(e))
    raise RuntimeError(f"Semua key gagal: {errors}")

# ─── JSON repair ─────────────────────────────────────────────────────────────
def strip_think(text):
    return re.sub(r'<think>[\s\S]*?</think>', '', text, flags=re.IGNORECASE).strip()

def robust_json(text):
    text = strip_think(text)
    fence = re.search(r'```(?:json)?\s*([\s\S]*?)```', text, re.IGNORECASE)
    if fence:
        text = fence.group(1).strip()
    start = text.find('{')
    if start == -1:
        raise ValueError("No JSON found")
    text = text[start:]
    # Try 1: as-is
    try: return json.loads(text)
    except: pass
    # Try 2: add missing closing braces
    n = max(0, text.count('{') - text.count('}'))
    try: return json.loads(text + '}' * n)
    except: pass
    # Try 3: binary search cut
    for i in range(len(text)-1, max(0, len(text)-5000), -1):
        try: return json.loads(text[:i] + '}')
        except: pass
    raise ValueError("Cannot repair JSON")

# ─── Load Part 1 data ────────────────────────────────────────────────────────
with open(os.path.join(BASE_DIR, 'docs', 'rps_repaired.json'), encoding='utf-8') as f:
    rps_data = json.load(f)

safe_print(f"Part 1 loaded: {len(rps_data)} fields")

# ─── Prompt Part 2 (singkat, tanpa context lama) ─────────────────────────────
PROMPT_P2 = (
    'Buat JSON RPS OBE Struktur Data STI-207 untuk pertemuan M10-M16 plus rancangan tugas dan rubrik. '
    'Isi SEMUA [isi] dengan konten substantif Bahasa Indonesia. Output HANYA JSON valid.\n\n'
    '{\n'
    '  "M10_KEMAMPUAN": "Mahasiswa mampu mengimplementasikan dan membandingkan AVL Tree dan Heap Tree beserta operasi self-balancing menggunakan Python",\n'
    '  "M10_MATERI": "AVL Tree: factor keseimbangan, rotasi LL/RR/LR/RL. Heap Tree: max-heap, min-heap, heapify, priority queue.",\n'
    '  "M10_INDIKATOR": "[isi: 2-3 indikator terukur]",\n'
    '  "M10_TEKNIK": "Praktikum Terbimbing + Kuis Online",\n'
    '  "M10_BOBOT": "4",\n'
    '  "M10_METODE": "Discovery Learning + Praktikum",\n'
    '  "M10_WAKTU": "TM: 2x50\', PT: 2x60\', BM: 2x60\'",\n'
    '  "M10_PENGALAMAN": "[isi: aktivitas belajar spesifik]",\n'
    '  "M10_MEDIA": "VisuAlgo, VSCode/PyCharm, E-Learning LMS",\n'
    '  "M10_REFERENSI": "Cormen, T.H. et al. (2022). Introduction to Algorithms, 4th ed. MIT Press.",\n'
    '  "M11_KEMAMPUAN": "Mahasiswa mampu mengimplementasikan representasi Graf dan menerapkan algoritma traversal BFS dan DFS untuk memecahkan masalah jalur terpendek",\n'
    '  "M11_MATERI": "Graf: weighted/unweighted, directed/undirected. Adjacency matrix dan list. BFS O(V+E). DFS O(V+E). Aplikasi: social network, routing.",\n'
    '  "M11_INDIKATOR": "[isi]",\n'
    '  "M11_TEKNIK": "Tugas Analisis + Praktikum",\n'
    '  "M11_BOBOT": "3",\n'
    '  "M11_METODE": "Case Method + Discovery Learning",\n'
    '  "M11_WAKTU": "TM: 2x50\', PT: 2x60\', BM: 2x60\'",\n'
    '  "M11_PENGALAMAN": "[isi]",\n'
    '  "M11_MEDIA": "VisuAlgo, Python NetworkX, VSCode",\n'
    '  "M11_REFERENSI": "Cormen, T.H. et al. (2022). Introduction to Algorithms, 4th ed. MIT Press.",\n'
    '  "M12_KEMAMPUAN": "Mahasiswa mampu mengimplementasikan Bubble Sort, Selection Sort, dan Insertion Sort serta menganalisis kompleksitas Big-O secara empiris",\n'
    '  "M12_MATERI": "Bubble Sort O(n^2), Selection Sort O(n^2), Insertion Sort O(n^2). Implementasi Python. Benchmarking runtime dengan dataset 100, 500, 1000 elemen.",\n'
    '  "M12_INDIKATOR": "[isi]",\n'
    '  "M12_TEKNIK": "Tugas Benchmarking + Laporan",\n'
    '  "M12_BOBOT": "4",\n'
    '  "M12_METODE": "Case Method: komparasi tiga algoritma sorting pada dataset bervariasi",\n'
    '  "M12_WAKTU": "TM: 2x50\', PT: 2x60\', BM: 2x60\'",\n'
    '  "M12_PENGALAMAN": "[isi]",\n'
    '  "M12_MEDIA": "Python, Jupyter Notebook, Matplotlib",\n'
    '  "M12_REFERENSI": "Goodrich, M.T., Tamassia, R., Goldwasser, M.H. (2013). Data Structures and Algorithms in Python. Wiley.",\n'
    '  "M13_KEMAMPUAN": "Mahasiswa mampu mengimplementasikan Merge Sort, Quick Sort, dan Heap Sort serta mengevaluasi trade-off kompleksitas dan performa nyata",\n'
    '  "M13_MATERI": "Merge Sort O(n log n), Quick Sort O(n log n) average/O(n^2) worst, Heap Sort O(n log n). Benchmarking komparatif vs sorting elementer.",\n'
    '  "M13_INDIKATOR": "[isi]",\n'
    '  "M13_TEKNIK": "Proyek Benchmarking + Presentasi Kelompok",\n'
    '  "M13_BOBOT": "3",\n'
    '  "M13_METODE": "PjBL: implementasi benchmarking tool Python + visualisasi Matplotlib",\n'
    '  "M13_WAKTU": "TM: 2x50\', PT: 2x60\', BM: 2x60\'",\n'
    '  "M13_PENGALAMAN": "[isi]",\n'
    '  "M13_MEDIA": "Python, Jupyter Notebook, GitHub, Matplotlib",\n'
    '  "M13_REFERENSI": "Cormen et al. (2022); Sedgewick, R. (2011). Algorithms, 4th ed. Addison-Wesley.",\n'
    '  "M14_KEMAMPUAN": "Mahasiswa mampu membandingkan Linear Search, Binary Search, dan Hash Search berdasarkan analisis kompleksitas Big-O pada kasus terbaik, rata-rata, dan terburuk",\n'
    '  "M14_MATERI": "Linear Search O(n), Binary Search O(log n) prasyarat sorted, Hash Search O(1) average O(n) worst. Trade-off memori vs kecepatan. Kasus nyata.",\n'
    '  "M14_INDIKATOR": "[isi]",\n'
    '  "M14_TEKNIK": "Ujian Praktikum + Studi Kasus Tertulis",\n'
    '  "M14_BOBOT": "3",\n'
    '  "M14_METODE": "Case Method: pencarian pada dataset 10.000 record mahasiswa",\n'
    '  "M14_WAKTU": "TM: 2x50\', PT: 2x60\', BM: 2x60\'",\n'
    '  "M14_PENGALAMAN": "[isi]",\n'
    '  "M14_MEDIA": "Python, VSCode, Jupyter Notebook",\n'
    '  "M14_REFERENSI": "Goodrich et al. (2013).",\n'
    '  "M15_KEMAMPUAN": "Mahasiswa mampu merancang dan mengimplementasikan Sistem Simulasi Antrean Layanan Publik menggunakan Queue, Priority Queue, dan Binary Search terintegrasi",\n'
    '  "M15_MATERI": "Proyek Terpadu Sistem Antrean Rumah Sakit: Queue FIFO, Priority Queue berbasis Heap, Binary Search untuk pencarian pasien. Evaluasi performa dan presentasi.",\n'
    '  "M15_INDIKATOR": "[isi]",\n'
    '  "M15_TEKNIK": "Presentasi Proyek Kelompok + Laporan Teknis",\n'
    '  "M15_BOBOT": "5",\n'
    '  "M15_METODE": "PjBL Fase Evaluasi: demo sistem + peer review + feedback panel dosen",\n'
    '  "M15_WAKTU": "TM: 2x50\', PT: 2x60\', BM: 2x60\'",\n'
    '  "M15_PENGALAMAN": "[isi]",\n'
    '  "M15_MEDIA": "Python, GitHub, Proyektor, E-Learning LMS",\n'
    '  "M15_REFERENSI": "Miller, B.N., Ranum, D.L. (2011). Problem Solving with Algorithms and Data Structures using Python. Franklin Beedle.",\n'
    '  "M16_KEMAMPUAN": "EVALUASI AKHIR SEMESTER (UAS)",\n'
    '  "M16_MATERI": "Materi Pertemuan 9-15: Tree (BST, AVL, Heap), Graf (BFS/DFS), Sorting (elementer + lanjut), Searching, Proyek Sistem Antrean",\n'
    '  "M16_INDIKATOR": "Ketepatan implementasi algoritma kompleks dalam batas waktu, analisis Big-O yang akurat, dan kualitas presentasi proyek akhir",\n'
    '  "M16_TEKNIK": "Ujian Praktikum Coding (60 menit) + Presentasi Proyek Kelompok (40 menit)",\n'
    '  "M16_BOBOT": "25",\n'
    '  "M16_METODE": "Ujian Akhir Semester (UAS) + Sidang Proyek",\n'
    '  "M16_WAKTU": "TM: 1x100\'",\n'
    '  "M16_PENGALAMAN": "Mahasiswa mengerjakan soal UAS berupa implementasi algoritma Tree/Graph/Sorting dan mempresentasikan proyek Sistem Antrean kepada panel dosen",\n'
    '  "M16_MEDIA": "Laboratorium Komputer, Proyektor, E-Learning LMS, Zoom",\n'
    '  "M16_REFERENSI": "-",\n'
    '  "RANCANGAN_TUGAS": "JUDUL: Sistem Simulasi Antrean Layanan Publik Berbasis Struktur Data\\nJENIS: Tugas Proyek Kelompok (3-4 mahasiswa)\\nDRIVING QUESTION: Bagaimana memilih dan mengimplementasikan struktur data yang paling efisien untuk mensimulasikan antrean layanan (rumah sakit/bank) dengan kapasitas dinamis dan fitur prioritas darurat?\\nDESKRIPSI: Mahasiswa mengembangkan program Python yang mensimulasikan sistem antrean layanan publik (misalnya rumah sakit atau loket pelayanan), mengintegrasikan Queue FIFO untuk pasien reguler, Priority Queue berbasis Heap untuk pasien darurat, dan Binary Search untuk pencarian rekam medis. Program harus menyertakan visualisasi data dan laporan analisis kompleksitas.\\nBENTUK LUARAN: (1) Source code Python terdokumentasi (GitHub), (2) Laporan analisis Big-O (min. 10 halaman), (3) Slide presentasi (10-12 slide), (4) Demo running program\\nMETODE: Project-Based Learning dengan pendekatan kolaboratif - perencanaan di M12, implementasi di M13, evaluasi dan presentasi di M15\\nJADWAL: Fase 1 - Perencanaan (M12): desain sistem dan pembagian tugas; Fase 2 - Implementasi (M13-M14): coding dan testing; Fase 3 - Evaluasi (M15): demo, presentasi, dan pengumpulan laporan\\nKRITERIA PENILAIAN: Fungsionalitas program (40%), Analisis kompleksitas (30%), Laporan & dokumentasi kode (20%), Presentasi & komunikasi (10%)\\nREFERENSI: Miller & Ranum (2011); Goodrich et al. (2013); Cormen et al. (2022)",\n'
    '  "RUBRIK_PENILAIAN": "RUBRIK ANALITIK PENILAIAN MK STRUKTUR DATA\\n\\nKRITERIA 1: Ketajaman Analisis Kompleksitas Algoritma (Bobot 30%)\\nSangat Baik (81-100): Mahasiswa menganalisis Big-O secara tepat untuk semua kasus (best/average/worst) pada seluruh struktur data dan algoritma, didukung bukti empiris benchmarking kode nyata dengan visualisasi grafik performa.\\nBaik (61-80): Mahasiswa menganalisis Big-O dengan benar untuk sebagian besar kasus, menyertakan perbandingan empiris meskipun belum lengkap untuk semua skenario data.\\nCukup (41-60): Mahasiswa mampu menyebut notasi Big-O dengan benar namun analisis terbatas pada kasus umum saja, tanpa bukti empiris yang kuat.\\nKurang (<40): Mahasiswa tidak dapat menentukan kompleksitas Big-O secara akurat, atau hanya menghafal tanpa memahami implikasinya.\\n\\nKRITERIA 2: Kebenaran dan Efisiensi Implementasi Kode (Bobot 30%)\\nSangat Baik (81-100): Implementasi seluruh operasi struktur data berjalan benar tanpa bug, menggunakan pendekatan efisien sesuai teori, kode terstruktur dengan penamaan variabel deskriptif dan komentar yang memadai.\\nBaik (61-80): Implementasi sebagian besar operasi berjalan benar dengan kesalahan minor yang tidak mempengaruhi fungsionalitas utama, struktur kode cukup baik.\\nCukup (41-60): Implementasi dapat berjalan untuk kasus umum namun mengalami error pada edge case, atau menggunakan pendekatan yang kurang efisien.\\nKurang (<40): Implementasi tidak dapat berjalan dengan benar untuk sebagian besar kasus uji, atau kode tidak terstruktur dan sulit dibaca.\\n\\nKRITERIA 3: Kualitas Dokumentasi dan Komunikasi Teknis (Bobot 20%)\\nSangat Baik (81-100): Laporan/dokumentasi kode sangat lengkap dan terstruktur: mencakup deskripsi algoritma, pseudocode, analisis Big-O, hasil benchmarking, dan kesimpulan perbandingan yang argumentatif dan akurat.\\nBaik (61-80): Dokumentasi cukup lengkap mencakup deskripsi algoritma dan analisis, namun beberapa bagian kurang detail atau argumen kurang kuat.\\nCukup (41-60): Dokumentasi ada namun hanya mencakup deskripsi dasar tanpa analisis mendalam, atau presentasi kurang terstruktur.\\nKurang (<40): Dokumentasi sangat minim atau tidak relevan dengan implementasi yang dibuat.\\n\\nKRITERIA 4: Kolaborasi Tim dan Inisiatif Problem Solving (Bobot 20%)\\nSangat Baik (81-100): Semua anggota tim berkontribusi aktif dan merata (dibuktikan commit history GitHub), tim mampu mengidentifikasi masalah secara mandiri dan mengajukan solusi kreatif di luar spesifikasi dasar.\\nBaik (61-80): Kontribusi cukup merata antar anggota, tim aktif berdiskusi dan mencari solusi meskipun masih bergantung pada panduan dosen untuk beberapa keputusan teknis.\\nCukup (41-60): Pembagian tugas tidak merata atau hanya beberapa anggota yang aktif berkontribusi, problem solving terbatas pada panduan yang diberikan.\\nKurang (<40): Tim tidak menunjukkan kolaborasi efektif, satu orang mendominasi atau kontribusi anggota tidak teridentifikasi."\n'
    '}'
)

safe_print(f"Prompt Part 2: {len(PROMPT_P2)} chars")
safe_print("Mengirim ke LLM dengan key rotation...")

t0 = time.time()
raw = ""
part2 = {}

try:
    raw = call_rotate(PROMPT_P2, DAHL_KEYS, MODEL, timeout=180)
    elapsed = time.time() - t0
    safe_print(f"Respon: {elapsed:.1f}s | {len(raw)} chars")

    with open(os.path.join(BASE_DIR, 'docs', 'rps_raw_part2.txt'), 'w', encoding='utf-8') as f:
        f.write(raw)

    part2 = robust_json(raw)
    safe_print(f"Part 2 parsed: {len(part2)} fields")

except Exception as e:
    safe_print(f"LLM Error: {type(e).__name__}: {e}")
    safe_print("Menggunakan data default Part 2...")
    # Fallback: gunakan data dari prompt sebagai default
    part2 = {
        "M10_KEMAMPUAN": "Mahasiswa mampu mengimplementasikan AVL Tree dan Heap Tree beserta operasi self-balancing-nya secara akurat",
        "M10_MATERI": "AVL Tree: rotasi LL/RR/LR/RL, height balancing. Heap Tree: max-heap, min-heap, heapify, priority queue.",
        "M10_INDIKATOR": "Ketepatan implementasi rotasi AVL; Kebenaran operasi insert/delete heap",
        "M10_TEKNIK": "Praktikum Terbimbing + Kuis Online", "M10_BOBOT": "4",
        "M10_METODE": "Discovery Learning + Praktikum",
        "M10_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'",
        "M10_PENGALAMAN": "Mahasiswa mengimplementasikan AVL Tree dengan rotasi menggunakan VisuAlgo sebagai panduan visual, kemudian menulis kode Python dari scratch",
        "M10_MEDIA": "VisuAlgo, VSCode, E-Learning LMS", "M10_REFERENSI": "Cormen et al. (2022)",
        "M11_KEMAMPUAN": "Mahasiswa mampu mengimplementasikan representasi Graf dan menerapkan BFS/DFS untuk memecahkan masalah jalur terpendek",
        "M11_MATERI": "Graf: adjacency matrix & list, weighted/unweighted. BFS O(V+E). DFS O(V+E). Aplikasi: social network, routing.",
        "M11_INDIKATOR": "Kebenaran implementasi BFS/DFS; Ketepatan analisis kompleksitas",
        "M11_TEKNIK": "Tugas Analisis + Praktikum", "M11_BOBOT": "3",
        "M11_METODE": "Case Method + Discovery Learning",
        "M11_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'",
        "M11_PENGALAMAN": "Mahasiswa menganalisis social network sederhana menggunakan BFS untuk menemukan jalur terpendek antar pengguna",
        "M11_MEDIA": "VisuAlgo, Python NetworkX, VSCode", "M11_REFERENSI": "Cormen et al. (2022)",
        "M12_KEMAMPUAN": "Mahasiswa mampu mengimplementasikan Bubble Sort, Selection Sort, Insertion Sort dan menganalisis kompleksitas Big-O secara empiris",
        "M12_MATERI": "Bubble Sort O(n^2), Selection Sort O(n^2), Insertion Sort O(n^2). Benchmarking runtime dengan dataset 100-1000 elemen.",
        "M12_INDIKATOR": "Kebenaran implementasi; Keakuratan analisis Big-O; Kualitas laporan benchmarking",
        "M12_TEKNIK": "Tugas Benchmarking + Laporan Singkat", "M12_BOBOT": "4",
        "M12_METODE": "Case Method: komparasi tiga algoritma sorting",
        "M12_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'",
        "M12_PENGALAMAN": "Mahasiswa membuat program benchmarking Python untuk membandingkan runtime ketiga sorting algoritma dan memvisualisasikan hasilnya dengan Matplotlib",
        "M12_MEDIA": "Python, Jupyter Notebook, Matplotlib", "M12_REFERENSI": "Goodrich et al. (2013)",
        "M13_KEMAMPUAN": "Mahasiswa mampu mengimplementasikan Merge Sort, Quick Sort, Heap Sort dan mengevaluasi trade-off kompleksitas dan performa",
        "M13_MATERI": "Merge Sort O(n log n), Quick Sort O(n log n) avg/O(n^2) worst, Heap Sort O(n log n). Perbandingan empiris vs sorting elementer.",
        "M13_INDIKATOR": "Kebenaran implementasi divide & conquer; Analisis best/average/worst case; Visualisasi komparasi performa",
        "M13_TEKNIK": "Proyek Benchmarking + Presentasi", "M13_BOBOT": "3",
        "M13_METODE": "PjBL: benchmarking tool Python + Matplotlib",
        "M13_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'",
        "M13_PENGALAMAN": "Mahasiswa mengembangkan benchmarking tool yang membandingkan 6 algoritma sorting (3 elementer + 3 lanjut) pada dataset hingga 100.000 elemen",
        "M13_MEDIA": "Python, Jupyter Notebook, GitHub, Matplotlib", "M13_REFERENSI": "Cormen et al. (2022); Sedgewick (2011)",
        "M14_KEMAMPUAN": "Mahasiswa mampu membandingkan Linear, Binary, Hash Search berdasarkan analisis Big-O kasus terbaik/rata-rata/terburuk",
        "M14_MATERI": "Linear Search O(n), Binary Search O(log n), Hash Search O(1) avg O(n) worst. Trade-off memori vs kecepatan.",
        "M14_INDIKATOR": "Kebenaran implementasi ketiga searching; Analisis Big-O tiga kasus; Justifikasi pemilihan algoritma untuk kasus nyata",
        "M14_TEKNIK": "Ujian Praktikum + Studi Kasus", "M14_BOBOT": "3",
        "M14_METODE": "Case Method: pencarian pada dataset 10.000 record",
        "M14_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'",
        "M14_PENGALAMAN": "Mahasiswa menganalisis dan mengimplementasikan ketiga algoritma searching pada dataset rekam mahasiswa, kemudian menjustifikasi pilihan algoritma terbaik berdasarkan skenario penggunaan",
        "M14_MEDIA": "Python, VSCode, Jupyter Notebook", "M14_REFERENSI": "Goodrich et al. (2013)",
        "M15_KEMAMPUAN": "Mahasiswa mampu merancang dan mengimplementasikan Sistem Simulasi Antrean Layanan Publik menggunakan Queue, Priority Queue, dan Binary Search terintegrasi",
        "M15_MATERI": "Proyek Terpadu: Simulasi Antrean Rumah Sakit. Queue FIFO (reguler) + Priority Queue/Heap (darurat) + Binary Search (pencarian pasien). Demo + evaluasi performa.",
        "M15_INDIKATOR": "Fungsionalitas sistem lengkap dan benar; Analisis kompleksitas terintegrasi; Kualitas presentasi dan laporan teknis",
        "M15_TEKNIK": "Presentasi Proyek + Laporan Teknis", "M15_BOBOT": "5",
        "M15_METODE": "PjBL Fase Evaluasi: demo + peer review + feedback dosen",
        "M15_WAKTU": "TM: 2x50', PT: 2x60', BM: 2x60'",
        "M15_PENGALAMAN": "Setiap kelompok mempresentasikan proyek Sistem Antrean selama 15 menit (demo + analisis), menerima feedback dari peer dan dosen, lalu mengumpulkan laporan final",
        "M15_MEDIA": "Python, GitHub, Proyektor, E-Learning LMS", "M15_REFERENSI": "Miller & Ranum (2011)",
        "M16_KEMAMPUAN": "EVALUASI AKHIR SEMESTER (UAS)",
        "M16_MATERI": "Materi M9-M15: BST, AVL Tree, Heap, Graf (BFS/DFS), Sorting (6 algoritma), Searching (3 metode), Proyek Sistem Antrean",
        "M16_INDIKATOR": "Ketepatan implementasi algoritma kompleks dalam batas waktu; analisis Big-O yang akurat; kualitas presentasi dan dokumentasi proyek akhir",
        "M16_TEKNIK": "Ujian Praktikum Coding (60 menit) + Presentasi Proyek Kelompok (40 menit)",
        "M16_BOBOT": "25",
        "M16_METODE": "Ujian Akhir Semester + Sidang Proyek",
        "M16_WAKTU": "TM: 1x100'",
        "M16_PENGALAMAN": "Mahasiswa mengerjakan soal UAS implementasi algoritma dan mempresentasikan proyek Sistem Antrean kepada panel dosen",
        "M16_MEDIA": "Laboratorium Komputer, Proyektor, E-Learning LMS", "M16_REFERENSI": "-",
        "RANCANGAN_TUGAS": (
            "JUDUL: Sistem Simulasi Antrean Layanan Publik Berbasis Struktur Data\n"
            "JENIS: Tugas Proyek Kelompok (3-4 mahasiswa)\n"
            "DRIVING QUESTION: Bagaimana memilih dan mengimplementasikan struktur data yang paling efisien untuk mensimulasikan antrean layanan publik dengan kapasitas dinamis dan fitur prioritas darurat?\n"
            "DESKRIPSI: Mahasiswa mengembangkan program Python yang mensimulasikan sistem antrean layanan publik, mengintegrasikan Queue FIFO (pasien reguler), Priority Queue berbasis Heap (pasien darurat), dan Binary Search (pencarian rekam medis). Program menyertakan visualisasi data dan laporan analisis kompleksitas.\n"
            "BENTUK LUARAN: (1) Source code Python terdokumentasi di GitHub, (2) Laporan analisis Big-O (min. 10 halaman), (3) Slide presentasi (10-12 slide), (4) Demo running program\n"
            "METODE: Project-Based Learning kolaboratif\n"
            "JADWAL:\n"
            "  Fase 1 - Perencanaan (M12): desain arsitektur sistem, pembagian tugas, setup GitHub\n"
            "  Fase 2 - Implementasi (M13-M14): coding, unit testing, benchmarking\n"
            "  Fase 3 - Evaluasi (M15): demo, presentasi, pengumpulan laporan\n"
            "KRITERIA PENILAIAN: Fungsionalitas (40%), Analisis kompleksitas (30%), Laporan & dokumentasi (20%), Presentasi (10%)\n"
            "REFERENSI: Miller & Ranum (2011); Goodrich et al. (2013); Cormen et al. (2022)"
        ),
        "RUBRIK_PENILAIAN": (
            "RUBRIK ANALITIK PENILAIAN MK STRUKTUR DATA (STI-207)\n\n"
            "KRITERIA 1: Ketajaman Analisis Kompleksitas Algoritma (Bobot 30%)\n"
            "Sangat Baik (81-100): Menganalisis Big-O akurat untuk semua kasus (best/average/worst), didukung bukti empiris benchmarking dengan visualisasi grafik performa.\n"
            "Baik (61-80): Analisis Big-O benar untuk sebagian besar kasus, ada perbandingan empiris meskipun belum lengkap.\n"
            "Cukup (41-60): Mampu menyebut notasi Big-O namun analisis terbatas kasus umum saja, tanpa bukti empiris kuat.\n"
            "Kurang (<40): Tidak dapat menentukan Big-O secara akurat atau hanya menghafal tanpa memahami implikasinya.\n\n"
            "KRITERIA 2: Kebenaran dan Efisiensi Implementasi Kode (Bobot 30%)\n"
            "Sangat Baik (81-100): Semua operasi SD berjalan benar, efisien sesuai teori, kode terstruktur dengan penamaan deskriptif dan komentar memadai.\n"
            "Baik (61-80): Sebagian besar operasi benar dengan kesalahan minor tidak mempengaruhi fungsionalitas utama.\n"
            "Cukup (41-60): Berjalan untuk kasus umum namun error pada edge case, atau pendekatan kurang efisien.\n"
            "Kurang (<40): Tidak berjalan benar untuk sebagian besar kasus uji, atau kode tidak terstruktur.\n\n"
            "KRITERIA 3: Kualitas Dokumentasi dan Komunikasi Teknis (Bobot 20%)\n"
            "Sangat Baik (81-100): Laporan sangat lengkap: deskripsi algoritma, pseudocode, analisis Big-O, hasil benchmarking, kesimpulan perbandingan argumentatif.\n"
            "Baik (61-80): Dokumentasi cukup lengkap namun beberapa bagian kurang detail.\n"
            "Cukup (41-60): Dokumentasi ada tapi hanya deskripsi dasar tanpa analisis mendalam.\n"
            "Kurang (<40): Dokumentasi sangat minim atau tidak relevan.\n\n"
            "KRITERIA 4: Kolaborasi Tim dan Inisiatif Problem Solving (Bobot 20%)\n"
            "Sangat Baik (81-100): Semua anggota berkontribusi merata (dibuktikan commit history GitHub), tim mengajukan solusi kreatif di luar spesifikasi dasar.\n"
            "Baik (61-80): Kontribusi cukup merata, tim aktif berdiskusi meski masih bergantung panduan dosen untuk keputusan teknis.\n"
            "Cukup (41-60): Pembagian tugas tidak merata atau beberapa anggota pasif.\n"
            "Kurang (<40): Tidak ada kolaborasi efektif, kontribusi anggota tidak teridentifikasi."
        )
    }
    safe_print(f"Data default Part 2: {len(part2)} fields")

# Merge
rps_data.update(part2)
safe_print(f"Total setelah merge: {len(rps_data)} fields")

# Save merged JSON
merged_path = os.path.join(BASE_DIR, 'docs', 'rps_merged.json')
with open(merged_path, 'w', encoding='utf-8') as f:
    json.dump(rps_data, f, ensure_ascii=False, indent=2)
safe_print(f"Merged JSON: {merged_path}")

# ─── Generate Markdown ────────────────────────────────────────────────────────
def g(key):
    """Get value case-insensitive from merged data"""
    return (rps_data.get(key) or rps_data.get(key.lower()) or
            rps_data.get(key.title()) or '')

ts = datetime.now().strftime('%d%m%Y_%H%M')
md_path = os.path.join(BASE_DIR, 'docs', f'RPS_StrukturData_FINAL_{ts}.md')

md = []
md.append("# RENCANA PEMBELAJARAN SEMESTER (RPS)")
md.append("## Mata Kuliah: Struktur Data (STI-207)")
md.append("")
md.append(f"> **SmartRPS Builder** — God-Tier Master Prompt (Distilasi 18 Prompt OBE PDF)  ")
md.append(f"> Kurikulum: S1 Sistem dan Teknologi Informasi — Universitas Widya Gama Malang  ")
md.append(f"> Referensi: `Implementasi_Modul_OBE_S1_SISTEKIN_UWG_2025.xlsx`  ")
md.append(f"> Generated: {datetime.now().strftime('%d %B %Y %H:%M')} — Model: {MODEL}")
md.append("")
md.append("---")
md.append("")
md.append("## A. IDENTITAS MATA KULIAH")
md.append("")
md.append("| Komponen | Keterangan |")
md.append("|:---|:---|")
md.append("| **Nama Mata Kuliah** | Struktur Data |")
md.append("| **Kode MK** | STI-207 |")
md.append("| **Bobot SKS** | 3 SKS (2 SKS Teori + 1 SKS Praktikum) |")
md.append("| **Semester** | II (Genap) |")
md.append("| **Program Studi** | S1 Sistem dan Teknologi Informasi |")
md.append("| **Jenjang** | Strata 1 (S1) — Universitas Widya Gama Malang |")
mk_syarat = g('MK_SYARAT') or g('Mk_Syarat') or 'STI-102 Algoritma dan Pemrograman'
team = g('TEAM_TEACHING') or g('Team_Teaching') or 'Tim Dosen Struktur Data'
md.append(f"| **MK Prasyarat** | {mk_syarat} |")
md.append(f"| **Team Teaching** | {team} |")
md.append("")
md.append("---")
md.append("")
md.append("## B. CPL PRODI YANG DIBEBANKAN")
md.append("")
cpl = g('CPL_PRODI') or g('CPL_Prodi') or '-'
md.append(cpl)
md.append("")
md.append("---")
md.append("")
md.append("## C. CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK)")
md.append("")
cpmk = g('CPMK') or '-'
md.append(cpmk)
md.append("")
md.append("---")
md.append("")
md.append("## D. PEMETAAN CPL — CPMK — TAKSONOMI BLOOM")
md.append("")
md.append("| Kode CPL | Rumusan CPMK | Aspek | Level |")
md.append("|:---|:---|:---|:---|")

taksonomi = (g('TAKSONOMI') or g('Taksonomi') or [])
if isinstance(taksonomi, list):
    for t in taksonomi:
        md.append(f"| {t.get('TAK_KODE','')} | {t.get('TAK_CPMK','')} | {t.get('TAK_ASPEK','')} | **{t.get('TAK_LVL','')}** |")

md.append("")
md.append("---")
md.append("")
md.append("## E. DESKRIPSI MATA KULIAH")
md.append("")
md.append(g('DESKRIPSI') or g('Deskripsi') or '-')
md.append("")
md.append("---")
md.append("")
md.append("## F. MATERI POKOK")
md.append("")
md.append(g('MATERI_POKOK') or g('Materi_Pokok') or '-')
md.append("")
md.append("---")
md.append("")
md.append("## G. REFERENSI PEMBELAJARAN")
md.append("")
md.append("**Referensi Utama:**")
md.append(g('REFERENSI_UTAMA') or g('Referensi_Utama') or '-')
md.append("")
md.append("**Referensi Pendukung:**")
md.append(g('REFERENSI_PENDUKUNG') or g('Referensi_Pendukung') or '-')
md.append("")
md.append("---")
md.append("")
md.append("## H. MEDIA PEMBELAJARAN")
md.append("")
md.append("| Media Lunak | Media Keras |")
md.append("|:---|:---|")
media_lk = g('MEDIA_LUNAK') or g('Media_Lunak') or '-'
media_kr = g('MEDIA_KERAS') or g('Media_Keras') or '-'
md.append(f"| {media_lk} | {media_kr} |")
md.append("")
md.append("---")
md.append("")
md.append("## I. MATRIKS RENCANA PEMBELAJARAN 16 MINGGU")
md.append("")
md.append("| Mgg | Kemampuan Akhir (Sub-CPMK) | Bahan Kajian | Metode | Waktu | Indikator | Teknik | Bobot |")
md.append("|:---:|:---|:---|:---|:---|:---|:---|:---:|")

total_bobot = 0
for i in range(1, 17):
    def mf(field):
        return (rps_data.get(f'M{i}_{field}') or rps_data.get(f'M{i}_{field.lower()}') or
                rps_data.get(f'm{i}_{field.lower()}') or '')
    k   = mf('KEMAMPUAN')
    m   = mf('MATERI')
    met = mf('METODE')
    w   = mf('WAKTU')
    ind = mf('INDIKATOR')
    tek = mf('TEKNIK')
    b   = mf('BOBOT')
    try: total_bobot += int(b)
    except: pass
    is_eval = any(x in str(k) for x in ['UTS', 'UAS', 'EVALUASI'])
    if is_eval:
        md.append(f"| **{i}** | **{k}** | {m} | {met} | {w} | {ind} | {tek} | **{b}%** |")
    else:
        md.append(f"| {i} | {k} | {m} | {met} | {w} | {ind} | {tek} | {b}% |")

valid = "VALID (= 100%)" if total_bobot == 100 else f"PERIKSA! (= {total_bobot}%, harus 100%)"
md.append("")
md.append(f"> **Total Bobot: {total_bobot}%** — {valid}")
md.append("")
md.append("---")
md.append("")
md.append("## J. RANCANGAN TUGAS MAHASISWA")
md.append("")
rt = g('RANCANGAN_TUGAS') or g('Rancangan_Tugas') or '-'
md.append(rt.replace('\\n', '\n'))
md.append("")
md.append("---")
md.append("")
md.append("## K. RUBRIK PENILAIAN ANALITIK")
md.append("")
rp = g('RUBRIK_PENILAIAN') or g('Rubrik_Penilaian') or '-'
md.append(rp.replace('\\n', '\n'))
md.append("")
md.append("---")
md.append("")
md.append("## L. INTEGRASI PENELITIAN & PENGABDIAN MASYARAKAT")
md.append("")
ri = g('INTEGRASI_RISPKM') or g('Integrasi_Rispkm') or (
    "Mata kuliah ini mendukung penelitian bidang algoritmika dan rekayasa perangkat lunak. "
    "Topik struktur data dapat diintegrasikan dengan pengabdian masyarakat berupa pembuatan "
    "sistem informasi berbasis efisiensi algoritma untuk lembaga pendidikan atau layanan publik lokal."
)
md.append(ri)
md.append("")
md.append("---")
md.append("")
md.append(f"*Dihasilkan SmartRPS Builder — God-Tier Master Prompt (Distilasi 18 Prompt OBE)*  ")
md.append(f"*Model: {MODEL} | Provider: Dahl Global | Generated: {datetime.now().strftime('%d/%m/%Y %H:%M')}*  ")
md.append(f"*Total Bobot: {total_bobot}% | Total Fields: {len(rps_data)}*")

with open(md_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(md))

safe_print("")
safe_print("=" * 50)
safe_print(f"SELESAI! RPS FINAL berhasil dibuat.")
safe_print(f"Markdown : {md_path}")
safe_print(f"JSON     : {merged_path}")
safe_print(f"Total bobot : {total_bobot}%")
safe_print(f"Total fields: {len(rps_data)}")
safe_print("=" * 50)
