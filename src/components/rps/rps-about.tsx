"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Sparkles,
  FileJson,
  Database,
  CheckCircle2,
  Layers,
  Wand2,
  ShieldCheck,
  Moon,
  BookMarked,
  Pencil,
  Keyboard,
  Table2,
  PackageOpen,
  Printer,
  WandSparkles,
  BookOpen,
  TrendingUp,
  Upload,
  GitCompareArrows,
  Layers3,
  CheckSquare,
  CopyPlus,
  Library,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const FEATURES = [
  {
    icon: Wand2,
    title: "Master Prompt Otomatis",
    desc: "Template prompt OBE dengan placeholder Mata Kuliah, SKS, Semester, dan Program Studi yang otomatis terisi sesuai form input.",
  },
  {
    icon: Sparkles,
    title: "Generate AI Berbasis OBE",
    desc: "Memanfaatkan LLM untuk menyusun CPL, CPMK, taksonomi Bloom, matriks mingguan M1–M16, rancangan tugas, dan rubrik penilaian.",
  },
  {
    icon: FileJson,
    title: "JSON Preview & Download",
    desc: "Hasil RPS ditampilkan dalam format JSON dengan syntax highlighting, serta dapat disalin ke clipboard atau diunduh sebagai file .json.",
  },
  {
    icon: Database,
    title: "Simpan ke Database Lokal",
    desc: "Setiap RPS yang sudah dibuat dapat disimpan ke database lokal (SQLite) untuk digunakan kembali di kemudian hari.",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    desc: "Tema terang/gelap dengan toggle mudah di header. Mendukung preferensi sistem otomatis (Terang, Gelap, Sistem).",
  },
  {
    icon: BookMarked,
    title: "Pustaka Mata Kuliah",
    desc: "12 preset mata kuliah siap pakai (RPL, PBO, Basis Data, Jaringan, AI, ML, dll.) untuk mengisi form dengan satu klik.",
  },
  {
    icon: Pencil,
    title: "Editor JSON & Matriks",
    desc: "Edit JSON mentah langsung dengan validasi real-time, atau edit matriks mingguan M1–M16 secara inline melalui tabel.",
  },
  {
    icon: Keyboard,
    title: "Pintasan Keyboard",
    desc: "Ctrl+Enter (generate), Ctrl+S (simpan), Ctrl+K (preset), Ctrl+P (cetak), Ctrl+Shift+V (toggle view), Ctrl+Shift+R (reset).",
  },
  {
    icon: WandSparkles,
    title: "Normalisasi Bobot",
    desc: "Tombol Fix Bobot menormalisasi nilai bobot M1–M16 agar total tepat 100% secara proporsional.",
  },
  {
    icon: PackageOpen,
    title: "Ekspor Batch & Individual",
    desc: "Unduh satu RPS sebagai JSON, atau ekspor semua RPS tersimpan sekaligus dalam satu file.",
  },
  {
    icon: Upload,
    title: "Impor dari JSON",
    desc: "Unggah file JSON berisi RPS (satu atau batch) untuk diimpor ke database. Pratinjau otomatis sebelum impor.",
  },
  {
    icon: GitCompareArrows,
    title: "Bandingkan RPS",
    desc: "Pilih dua RPS tersimpan untuk melihat perbedaan field-nya secara side-by-side dengan status tambah/hapus/ubah.",
  },
  {
    icon: Layers3,
    title: "Template Prompt",
    desc: "4 varian template: Standar, Ringkas, Detail, dan Berbasis Proyek — sesuaikan gaya RPS dengan kebutuhan.",
  },
  {
    icon: Pencil,
    title: "Edit Metadata RPS",
    desc: "Perbarui mata kuliah, SKS, semester, prodi, dan deskripsi dari RPS yang sudah tersimpan tanpa generate ulang.",
  },
  {
    icon: CheckSquare,
    title: "Batch Delete",
    desc: "Mode pilih multiple RPS untuk menghapus beberapa sekaligus dengan konfirmasi.",
  },
  {
    icon: CopyPlus,
    title: "Duplikasi RPS",
    desc: "Buat salinan RPS tersimpan sebagai record baru dengan satu klik — berguna untuk varian mata kuliah.",
  },
  {
    icon: Library,
    title: "Pustaka CPL/CPMK",
    desc: "Ekstrak CPL & CPMK dari RPS tersimpan dan terapkan ulang ke Builder untuk mata kuliah baru.",
  },
  {
    icon: Printer,
    title: "Cetak / Export PDF",
    desc: "Generate dokumen RPS siap cetak (A4) dengan 11 section terstruktur, badge bobot, dan styling profesional.",
  },
  {
    icon: Table2,
    title: "Ringkasan Terformat",
    desc: "Tampilan ringkasan RPS yang terparse: CPL, CPMK, taksonomi, matriks mingguan, materi, referensi, rubrik penilaian.",
  },
];

const RULES = [
  "Output WAJIB dalam format JSON murni (tanpa markdown / penjelasan).",
  "Penamaan CPL_PRODI diawali dengan CPL-1, CPL-2, CPL-3, CPL-4 (bukan 1., 2., 3., 4.).",
  "Pada array TAKSONOMI, kolom TAK_CPMK wajib berisi deskripsi lengkap rumusan CPMK (contoh: “M1: Mahasiswa mampu menganalisis...”).",
  "Total bobot persentase pada matriks M1 hingga M16 harus berjumlah tepat 100.",
  "Struktur JSON mengikuti template yang disediakan (boleh menambah/mengurangi isi array TAKSONOMI).",
];

const FLOW = [
  { step: "1", title: "Isi Form", desc: "Masukkan Mata Kuliah, SKS, Semester, dan Program Studi." },
  { step: "2", title: "Lihat Master Prompt", desc: "Prompt otomatis diperbarui sesuai input form." },
  { step: "3", title: "Generate AI", desc: "Klik tombol generate, AI menyusun RPS berbasis OBE." },
  { step: "4", title: "Preview & Simpan", desc: "Lihat hasil JSON, unduh, atau simpan ke database." },
];

const SHORTCUTS = [
  { keys: ["Ctrl", "Enter"], action: "Generate RPS" },
  { keys: ["Ctrl", "S"], action: "Simpan RPS" },
  { keys: ["Ctrl", "K"], action: "Buka Pustaka Preset" },
  { keys: ["Ctrl", "P"], action: "Cetak / PDF" },
  { keys: ["Ctrl", "Shift", "V"], action: "Toggle Ringkasan/JSON" },
  { keys: ["Ctrl", "Shift", "R"], action: "Reset form" },
];

interface SavedRpsLike {
  id: string;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string | null;
  jsonData: string;
  createdAt: string;
}

export function RpsAbout() {
  const [stats, setStats] = useState({
    total: 0,
    totalSks: 0,
    prodiCount: 0,
    validBobot: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/rps", { cache: "no-store" });
        const json = await res.json();
        if (cancelled || !json.success) return;
        const items = json.data as SavedRpsLike[];
        const total = items.length;
        const totalSks = items.reduce(
          (s, it) => s + (parseInt(it.sks, 10) || 0),
          0
        );
        const prodiCount = new Set(items.map((i) => i.programStudi)).size;
        let validBobot = 0;
        for (const it of items) {
          try {
            const d = JSON.parse(it.jsonData);
            const bobotVals: number[] = [];
            for (let i = 1; i <= 16; i++) {
              const v = parseFloat(String(d[`M${i}_BOBOT`] || ""));
              if (!isNaN(v)) bobotVals.push(v);
            }
            const t = bobotVals.reduce((a, b) => a + b, 0);
            if (Math.abs(t - 100) < 0.01) validBobot++;
          } catch {
            // skip
          }
        }
        if (!cancelled) {
          setStats({ total, totalSks, prodiCount, validBobot });
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/12%),transparent_60%)]" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          <CardContent className="relative pt-8 pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight">
                    SmartRPS Builder
                  </h2>
                  <Badge variant="secondary" className="text-[10px]">
                    v1.6
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    OBE
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Alat pembuat Rencana Pembelajaran Semester (RPS) berbasis
                  Outcome-Based Education (OBE) yang menggunakan template master
                  prompt dan AI untuk menghasilkan struktur JSON lengkap sesuai
                  standar kurikulum perguruan tinggi.
                </p>
              </div>
            </div>

            {/* Live Stats */}
            {stats.total > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <LiveStat
                  icon={BookOpen}
                  label="Total RPS"
                  value={String(stats.total)}
                  color="text-primary"
                />
                <LiveStat
                  icon={Layers}
                  label="Total SKS"
                  value={String(stats.totalSks)}
                  color="text-emerald-600 dark:text-emerald-400"
                />
                <LiveStat
                  icon={GraduationCap}
                  label="Program Studi"
                  value={String(stats.prodiCount)}
                  color="text-amber-600 dark:text-amber-400"
                />
                <LiveStat
                  icon={TrendingUp}
                  label="Bobot Valid"
                  value={`${stats.validBobot}/${stats.total}`}
                  color="text-sky-600 dark:text-sky-400"
                />
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Features */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Fitur Lengkap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-semibold">{f.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Flow */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Alur Penggunaan
          </CardTitle>
          <CardDescription className="text-xs">
            Empat langkah mudah untuk membuat RPS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FLOW.map((f, idx) => (
              <div
                key={f.step}
                className="relative rounded-lg border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {f.step}
                  </span>
                  {idx < FLOW.length - 1 && (
                    <span className="hidden lg:block text-muted-foreground/40">
                      →
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-medium">{f.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-primary" />
            Pintasan Keyboard
          </CardTitle>
          <CardDescription className="text-xs">
            Bekerja lebih cepat dengan pintasan keyboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SHORTCUTS.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-3 py-2"
              >
                <span className="text-sm text-foreground/90">{s.action}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, j) => (
                    <span key={j} className="flex items-center gap-1">
                      {j > 0 && (
                        <span className="text-muted-foreground text-[10px]">+</span>
                      )}
                      <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-background font-mono text-[10px] font-medium shadow-sm">
                        {k}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Aturan Mutlak Master Prompt
          </CardTitle>
          <CardDescription className="text-xs">
            Aturan yang dipatuhi oleh AI saat membuat RPS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {RULES.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                <span className="text-foreground/90 leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Database className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Data disimpan di database lokal SQLite. Semua pemrosesan AI
              dilakukan di server.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LiveStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/60 backdrop-blur-sm p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-muted/50 ${color}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold leading-tight">{value}</p>
    </div>
  );
}
