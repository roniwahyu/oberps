"use client";

import {
  BookOpen,
  Target,
  Layers3,
  CalendarRange,
  ListChecks,
  Award,
  FileBarChart2,
  Library,
  Monitor,
  Users,
  GitBranch,
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RpsData,
  ParsedCplItem,
  ParsedCpmkItem,
  WeeklyMatrixRow,
  RubrikTier,
  parseCplProdi,
  parseCpmk,
  parseWeeklyMatrix,
  calculateBobot,
  parseNumberedList,
  parseRubrik,
} from "@/lib/rps-parser";

interface RpsSummaryProps {
  data: RpsData;
  mataKuliah?: string;
  sks?: string;
  semester?: string;
  programStudi?: string;
}

export function RpsSummary({
  data,
  mataKuliah,
  sks,
  semester,
  programStudi,
}: RpsSummaryProps) {
  const cplList = parseCplProdi(data.CPL_PRODI);
  const cpmkList = parseCpmk(data.CPMK);
  const matrix = parseWeeklyMatrix(data);
  const bobot = calculateBobot(data);
  const materiPokok = parseNumberedList(data.MATERI_POKOK);
  const refUtama = parseNumberedList(data.REFERENSI_UTAMA);
  const refPendukung = parseNumberedList(data.REFERENSI_PENDUKUNG);
  const rubrik = parseRubrik(data.RUBRIK_PENILAIAN);

  return (
    <div className="space-y-4">
      {/* Bobot validation banner */}
      <BobotBanner bobot={bobot} />

      {/* Course info header */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/8%),transparent_70%)]" />
          <CardContent className="relative pt-5 pb-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold tracking-tight">
                  {mataKuliah || "Mata Kuliah"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {sks && (
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      <Layers3 className="h-3 w-3 mr-1" />
                      {sks} SKS
                    </Badge>
                  )}
                  {semester && (
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      <CalendarRange className="h-3 w-3 mr-1" />
                      Semester {semester}
                    </Badge>
                  )}
                  {programStudi && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {programStudi}
                    </Badge>
                  )}
                </div>
                {data.DESKRIPSI && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {data.DESKRIPSI}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* CPL */}
      {cplList.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Capaian Pembelajaran Lulusan (CPL)
            </CardTitle>
            <CardDescription className="text-xs">
              CPL Prodi yang menjadi target pencapaian mata kuliah ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cplList.map((cpl, i) => (
              <CplRow key={i} cpl={cpl} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* CPMK */}
      {cpmkList.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              Capaian Pembelajaran Mata Kuliah (CPMK)
            </CardTitle>
            <CardDescription className="text-xs">
              Kemampuan yang diharapkan dikuasai mahasiswa setelah menempuh mata kuliah ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cpmkList.map((cpmk, i) => (
              <CpmkRow key={i} cpmk={cpmk} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAKSONOMI */}
      {data.TAKSONOMI && data.TAKSONOMI.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-primary" />
              Matriks Taksonomi Bloom
            </CardTitle>
            <CardDescription className="text-xs">
              Pemetaan CPMK ke CPL dengan aspek dan level taksonomi Bloom.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[80px] pl-4">Kode CPL</TableHead>
                    <TableHead className="min-w-[280px]">Rumusan CPMK</TableHead>
                    <TableHead className="w-[140px]">Aspek</TableHead>
                    <TableHead className="w-[80px] pr-4">Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.TAKSONOMI.map((tak, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-4">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {tak.TAK_KODE || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs leading-relaxed">
                        {tak.TAK_CPMK || "-"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {tak.TAK_ASPEK || "-"}
                      </TableCell>
                      <TableCell className="pr-4">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono"
                        >
                          {tak.TAK_LVL || "-"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Weekly Matrix */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-primary" />
                Rencana Pembelajaran Mingguan (M1–M16)
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Rincian kegiatan per pertemuan.
              </CardDescription>
            </div>
            <BobotBadge bobot={bobot} />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[60px] pl-4">Mgg</TableHead>
                  <TableHead className="min-w-[200px]">Sub-CPMK / Kegiatan</TableHead>
                  <TableHead className="min-w-[200px]">Materi</TableHead>
                  <TableHead className="w-[90px]">Bobot</TableHead>
                  <TableHead className="min-w-[140px] pr-4">Metode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrix.map((row) => (
                  <MatrixRow key={row.week} row={row} />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Materi Pokok + Referensi grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materiPokok.length > 0 && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                Materi Pokok
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1.5 text-sm">
                {materiPokok.map((m, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90 leading-relaxed">{m}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Library className="h-4 w-4 text-primary" />
              Referensi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {refUtama.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                  Referensi Utama
                </p>
                <ol className="space-y-1 text-xs">
                  {refUtama.map((r, i) => (
                    <li key={i} className="flex gap-1.5 text-foreground/90 leading-relaxed">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {refPendukung.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                  Referensi Pendukung
                </p>
                <ol className="space-y-1 text-xs">
                  {refPendukung.map((r, i) => (
                    <li key={i} className="flex gap-1.5 text-foreground/90 leading-relaxed">
                      <span className="text-muted-foreground font-bold">{i + 1}.</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Supporting info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard
          icon={Monitor}
          title="Media Pembelajaran"
          items={[
            data.MEDIA_LUNAK && `Lunak: ${data.MEDIA_LUNAK}`,
            data.MEDIA_KERAS && `Keras: ${data.MEDIA_KERAS}`,
          ].filter(Boolean) as string[]}
        />
        <InfoCard
          icon={Users}
          title="Team Teaching"
          items={data.TEAM_TEACHING ? [data.TEAM_TEACHING] : []}
        />
        <InfoCard
          icon={GitBranch}
          title="MK Syarat"
          items={data.MK_SYARAT ? [data.MK_SYARAT] : []}
        />
      </div>

      {/* RISPKM Integration */}
      {data.INTEGRASI_RISPKM && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              Integrasi RISPKM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {data.INTEGRASI_RISPKM}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rancangan Tugas */}
      {data.RANCANGAN_TUGAS && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileBarChart2 className="h-4 w-4 text-primary" />
              Rancangan Tugas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">
              {data.RANCANGAN_TUGAS}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Rubrik Penilaian */}
      {rubrik.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Rubrik Penilaian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rubrik.map((tier, i) => (
              <RubrikRow key={i} tier={tier} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BobotBanner({
  bobot,
}: {
  bobot: { total: number; filledWeeks: number; isValid: boolean };
}) {
  const isValid = bobot.isValid;
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        isValid
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
      }`}
    >
      {isValid ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {isValid
            ? "Total bobot valid (100%)"
            : `Total bobot ${bobot.total}% — belum mencapai 100%`}
        </p>
        <p className="text-xs text-muted-foreground">
          {bobot.filledWeeks} dari 16 minggu memiliki nilai bobot.
        </p>
      </div>
      <Badge
        variant={isValid ? "default" : "secondary"}
        className={`text-xs font-mono ${isValid ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
      >
        {bobot.total}%
      </Badge>
    </div>
  );
}

function BobotBadge({
  bobot,
}: {
  bobot: { total: number; isValid: boolean };
}) {
  return (
    <Badge
      variant={bobot.isValid ? "default" : "secondary"}
      className={`text-[10px] font-mono ${bobot.isValid ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
    >
      {bobot.isValid ? (
        <CheckCircle2 className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      Total: {bobot.total}%
    </Badge>
  );
}

function CplRow({ cpl }: { cpl: ParsedCplItem }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
      <Badge variant="outline" className="text-[10px] font-mono mt-0.5 shrink-0">
        {cpl.code}
      </Badge>
      <div className="min-w-0">
        {cpl.label && (
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold mr-1.5">
            {cpl.label}
          </span>
        )}
        <span className="text-sm text-foreground/90 leading-relaxed">
          {cpl.description}
        </span>
      </div>
    </div>
  );
}

function CpmkRow({ cpmk }: { cpmk: ParsedCpmkItem }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
      <Badge className="text-[10px] font-mono mt-0.5 shrink-0 bg-primary/15 text-primary hover:bg-primary/15">
        {cpmk.code}
      </Badge>
      <span className="text-sm text-foreground/90 leading-relaxed">
        {cpmk.description}
      </span>
    </div>
  );
}

function MatrixRow({ row }: { row: WeeklyMatrixRow }) {
  if (row.isEmpty) {
    return (
      <TableRow className="opacity-40">
        <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
          M{row.week}
        </TableCell>
        <TableCell colSpan={4} className="text-xs text-muted-foreground italic pr-4">
          — belum diisi —
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      className={
        row.isUts || row.isUas
          ? "bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted/30"
      }
    >
      <TableCell className="pl-4 font-mono text-xs font-medium">
        <div className="flex items-center gap-1.5">
          M{row.week}
          {(row.isUts || row.isUas) && (
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${row.isUts ? "bg-amber-500" : "bg-rose-500"}`}
              title={row.isUts ? "UTS" : "UAS"}
            />
          )}
        </div>
      </TableCell>
      <TableCell className="text-xs leading-relaxed">
        {row.kemampuan || "-"}
      </TableCell>
      <TableCell className="text-xs leading-relaxed text-muted-foreground">
        {row.materi || "-"}
      </TableCell>
      <TableCell className="text-xs">
        {row.bobot ? (
          <Badge variant="outline" className="text-[10px] font-mono">
            {row.bobot}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-xs leading-relaxed text-muted-foreground pr-4">
        {row.metode || "-"}
      </TableCell>
    </TableRow>
  );
}

function RubrikRow({ tier }: { tier: RubrikTier }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
      <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[70px]">
        <span className="text-xs font-semibold text-foreground">{tier.label}</span>
        {tier.range && (
          <Badge variant="secondary" className="text-[10px] font-mono">
            {tier.range}
          </Badge>
        )}
      </div>
      <Separator orientation="vertical" className="h-auto" />
      <span className="text-sm text-foreground/90 leading-relaxed flex-1">
        {tier.description}
      </span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {items.map((item, i) => (
            <p key={i} className="text-sm text-foreground/90 leading-relaxed">
              {item}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
