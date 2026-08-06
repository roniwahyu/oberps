"use client";

import {
  GraduationCap,
  Sparkles,
  FileJson,
  Database,
  CheckCircle2,
  Layers,
  Wand2,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function RpsAbout() {
  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/10%),transparent_60%)]" />
          <CardContent className="relative pt-8 pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight">
                    RPS Builder OBE
                  </h2>
                  <Badge variant="secondary" className="text-[10px]">
                    v1.0
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
          </CardContent>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="border-border/60 shadow-sm">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{f.title}</h3>
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
        </CardContent>
      </Card>
    </div>
  );
}
