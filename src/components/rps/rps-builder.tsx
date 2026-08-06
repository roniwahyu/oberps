"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Save,
  Loader2,
  RotateCcw,
  Wand2,
  FileText,
  Code2,
  LayoutDashboard,
  Printer,
  CheckCircle2,
  XCircle,
  BookMarked,
  Pencil,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_FORM_INPUT,
  RPSFormInput,
  buildMasterPrompt,
} from "@/lib/rps-template";
import { calculateBobot, toRpsData, RpsData } from "@/lib/rps-parser";
import { CoursePreset } from "@/lib/course-presets";
import { JsonPreview } from "./json-preview";
import { RpsSummary } from "./rps-summary";
import { buildPrintHtml } from "./print-utils";
import { PresetLibrary } from "./preset-library";

export interface RpsLoadRequest {
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string;
  jsonData: unknown;
  promptText: string;
  nonce: number;
}

interface RpsBuilderProps {
  onSaved?: () => void;
  loadRequest?: RpsLoadRequest | null;
}

const SEMESTER_OPTIONS = Array.from({ length: 14 }, (_, i) => String(i + 1));
const SKS_OPTIONS = ["1", "2", "3", "4", "5", "6"];

const PROGRAM_STUDI_PRESETS = [
  "S1 Teknik Informatika",
  "S1 Sistem Informasi",
  "S1 Ilmu Komputer",
  "S1 Teknik Elektro",
  "S1 Teknik Mesin",
  "S1 Manajemen",
  "S1 Akuntansi",
  "D3 Teknik Informatika",
  "S1 Pendidikan Teknologi Informasi",
];

type ViewMode = "summary" | "json";

export function RpsBuilder({ onSaved, loadRequest }: RpsBuilderProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<RPSFormInput>(DEFAULT_FORM_INPUT);
  const [deskripsi, setDeskripsi] = useState("");
  const [generatedData, setGeneratedData] = useState<unknown>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [presetOpen, setPresetOpen] = useState(false);
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [jsonEditText, setJsonEditText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatusText, setGenStatusText] = useState("");

  // Simulated progress during generation
  useEffect(() => {
    if (!isGenerating) {
      setGenProgress(0);
      setGenStatusText("");
      return;
    }
    const steps = [
      { p: 15, t: "Menganalisis mata kuliah..." },
      { p: 35, t: "Menyusun CPL & CPMK..." },
      { p: 55, t: "Membuat matriks taksonomi Bloom..." },
      { p: 75, t: "Mengisi rencana mingguan M1-M16..." },
      { p: 90, t: "Menyusun rubrik penilaian..." },
    ];
    let idx = 0;
    setGenProgress(5);
    setGenStatusText("Memanggil AI...");
    const interval = setInterval(() => {
      if (idx < steps.length) {
        setGenProgress(steps[idx].p);
        setGenStatusText(steps[idx].t);
        idx++;
      }
    }, 11000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSelectPreset = useCallback((preset: CoursePreset) => {
    setForm({
      mataKuliah: preset.mataKuliah,
      sks: preset.sks,
      semester: preset.semester,
      programStudi: preset.programStudi,
    });
    setDeskripsi(preset.deskripsi);
    toast({
      title: "Preset dimuat",
      description: `Form diisi dengan ${preset.mataKuliah}.`,
    });
  }, [toast]);

  // Load data from a saved RPS (duplicate / edit)
  useEffect(() => {
    if (!loadRequest || loadRequest.nonce === 0) return;
    setForm({
      mataKuliah: loadRequest.mataKuliah,
      sks: loadRequest.sks,
      semester: loadRequest.semester,
      programStudi: loadRequest.programStudi,
    });
    setDeskripsi(loadRequest.deskripsi);
    setGeneratedData(loadRequest.jsonData);
    setGeneratedPrompt(loadRequest.promptText);
    setViewMode("summary");
  }, [loadRequest]);

  const livePrompt = useMemo(() => buildMasterPrompt(form), [form]);

  const rpsData: RpsData | null = useMemo(
    () => toRpsData(generatedData),
    [generatedData]
  );

  const bobot = useMemo(
    () => (rpsData ? calculateBobot(rpsData) : null),
    [rpsData]
  );

  const handleGenerate = useCallback(async () => {
    if (!form.mataKuliah.trim() || !form.sks || !form.semester || !form.programStudi.trim()) {
      toast({
        title: "Form belum lengkap",
        description: "Mohon isi Mata Kuliah, SKS, Semester, dan Program Studi.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedData(null);

    try {
      const res = await fetch("/api/rps/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Gagal generate RPS.");
      }

      setGeneratedData(json.data);
      setGeneratedPrompt(json.prompt);
      setViewMode("summary");
      toast({
        title: "RPS berhasil dibuat!",
        description: `RPS untuk ${form.mataKuliah} telah digenerate oleh AI.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Gagal generate",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [form, toast]);

  const handleSave = useCallback(async () => {
    if (!generatedData) {
      toast({
        title: "Belum ada data",
        description: "Generate RPS terlebih dahulu sebelum menyimpan.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/rps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mataKuliah: form.mataKuliah,
          sks: form.sks,
          semester: form.semester,
          programStudi: form.programStudi,
          deskripsi,
          promptText: generatedPrompt || livePrompt,
          jsonData: generatedData,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Gagal menyimpan RPS.");
      }
      toast({
        title: "Tersimpan!",
        description: `RPS "${form.mataKuliah}" berhasil disimpan ke database.`,
      });
      onSaved?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Gagal menyimpan",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [generatedData, form, deskripsi, generatedPrompt, livePrompt, toast, onSaved]);

  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM_INPUT);
    setDeskripsi("");
    setGeneratedData(null);
    setGeneratedPrompt("");
    setIsEditingJson(false);
    setJsonError(null);
    toast({ title: "Direset", description: "Form dan preview telah dibersihkan." });
  }, [toast]);

  const handleStartEditJson = useCallback(() => {
    if (!generatedData) return;
    setJsonEditText(JSON.stringify(generatedData, null, 2));
    setJsonError(null);
    setIsEditingJson(true);
  }, [generatedData]);

  const handleCancelEditJson = useCallback(() => {
    setIsEditingJson(false);
    setJsonError(null);
  }, []);

  const handleSaveEditJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonEditText);
      setGeneratedData(parsed);
      setIsEditingJson(false);
      setJsonError(null);
      toast({
        title: "JSON diperbarui",
        description: "Perubahan JSON telah disimpan (lokal).",
      });
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "JSON tidak valid");
    }
  }, [jsonEditText, toast]);

  const handlePrint = useCallback(() => {
    if (!rpsData) return;
    const html = buildPrintHtml({
      data: rpsData,
      mataKuliah: form.mataKuliah,
      sks: form.sks,
      semester: form.semester,
      programStudi: form.programStudi,
      deskripsi,
    });
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      toast({
        title: "Popup diblokir",
        description: "Izinkan popup untuk mencetak RPS.",
        variant: "destructive",
      });
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 400);
  }, [rpsData, form, deskripsi, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <PresetLibrary
        open={presetOpen}
        onOpenChange={setPresetOpen}
        onSelect={handleSelectPreset}
      />
      {/* LEFT: Form + Prompt Preview */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Input Mata Kuliah</CardTitle>
                  <CardDescription className="text-xs">
                    Isi data berikut, master prompt akan diperbarui otomatis.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetOpen(true)}
                  className="h-8 text-xs"
                >
                  <BookMarked className="h-3.5 w-3.5 mr-1.5" />
                  Preset
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mataKuliah" className="text-sm font-medium">
                Mata Kuliah <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mataKuliah"
                placeholder="contoh: Rekayasa Perangkat Lunak"
                value={form.mataKuliah}
                onChange={(e) =>
                  setForm((s) => ({ ...s, mataKuliah: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sks" className="text-sm font-medium">
                  SKS <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.sks}
                  onValueChange={(v) => setForm((s) => ({ ...s, sks: v }))}
                >
                  <SelectTrigger id="sks" className="w-full">
                    <SelectValue placeholder="Pilih SKS" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} SKS
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester" className="text-sm font-medium">
                  Semester <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.semester}
                  onValueChange={(v) => setForm((s) => ({ ...s, semester: v }))}
                >
                  <SelectTrigger id="semester" className="w-full">
                    <SelectValue placeholder="Pilih Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="programStudi" className="text-sm font-medium">
                Program Studi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="programStudi"
                list="programStudiList"
                placeholder="contoh: S1 Teknik Informatika"
                value={form.programStudi}
                onChange={(e) =>
                  setForm((s) => ({ ...s, programStudi: e.target.value }))
                }
              />
              <datalist id="programStudiList">
                {PROGRAM_STUDI_PRESETS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deskripsi" className="text-sm font-medium">
                Deskripsi Mata Kuliah{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (opsional)
                </span>
              </Label>
              <Textarea
                id="deskripsi"
                placeholder="Deskripsi singkat mata kuliah..."
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-11 text-sm font-medium shadow-sm"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sedang men-generate...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate RPS dengan AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Master Prompt Preview */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Master Prompt</CardTitle>
              </div>
              <Badge variant="secondary" className="text-[10px] font-normal">
                Auto-fill
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Template prompt dengan placeholder otomatis diganti sesuai input form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 w-full rounded-md border border-border/50 bg-muted/30">
              <pre className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap p-3 text-foreground/80">
                {livePrompt}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Summary / JSON Preview / Empty state */}
      <div className="lg:col-span-7 space-y-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Hasil RPS
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {generatedData
                    ? "Hasil generate RPS siap untuk disimpan, diunduh, atau dicetak."
                    : "Hasil RPS akan muncul di sini setelah generate."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {generatedData && bobot && (
                  <Badge
                    variant={bobot.isValid ? "default" : "secondary"}
                    className={`text-[10px] font-mono ${bobot.isValid ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                    title={`Total bobot M1-M16: ${bobot.total}%`}
                  >
                    {bobot.isValid ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    Bobot: {bobot.total}%
                  </Badge>
                )}
                {generatedData && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="h-8"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                )}
              </div>
            </div>

            {/* View mode toggle */}
            {generatedData && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <div className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 p-0.5">
                  <ViewToggleBtn
                    active={viewMode === "summary"}
                    onClick={() => setViewMode("summary")}
                    icon={LayoutDashboard}
                    label="Ringkasan"
                  />
                  <ViewToggleBtn
                    active={viewMode === "json"}
                    onClick={() => setViewMode("json")}
                    icon={Code2}
                    label="JSON"
                  />
                </div>
                {viewMode === "json" && !isEditingJson && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEditJson}
                    className="h-8 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit JSON
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="h-8 ml-auto text-xs"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  Cetak / PDF
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!generatedData ? (
              <EmptyState
                isGenerating={isGenerating}
                progress={genProgress}
                statusText={genStatusText}
              />
            ) : viewMode === "json" && isEditingJson ? (
              <JsonEditor
                value={jsonEditText}
                onChange={setJsonEditText}
                error={jsonError}
                onSave={handleSaveEditJson}
                onCancel={handleCancelEditJson}
              />
            ) : viewMode === "json" ? (
              <JsonPreview
                data={generatedData}
                filename={`RPS_${form.mataKuliah.replace(/\s+/g, "_")}.json`}
                maxHeight="70vh"
              />
            ) : (
              <ScrollArea className="h-[70vh] w-full pr-3 -mr-3">
                <RpsSummary
                  data={rpsData!}
                  mataKuliah={form.mataKuliah}
                  sks={form.sks}
                  semester={form.semester}
                  programStudi={form.programStudi}
                />
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {generatedData && (
          <Card className="border-border/60 shadow-sm bg-muted/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Tips:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>Gunakan tab <span className="font-mono">Ringkasan</span> untuk melihat tampilan terformat RPS.</li>
                    <li>Gunakan tab <span className="font-mono">JSON</span> untuk melihat & menyalin data mentah JSON.</li>
                    <li>Periksa badge bobot — total M1–M16 harus = 100%.</li>
                    <li>Klik <span className="font-mono">Cetak / PDF</span> untuk mencetak atau menyimpan sebagai PDF.</li>
                    <li>Klik <span className="font-mono">Simpan</span> untuk menyimpan ke database lokal.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ViewToggleBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function EmptyState({
  isGenerating,
  progress,
  statusText,
}: {
  isGenerating: boolean;
  progress: number;
  statusText: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-lg border border-dashed border-border/60 bg-muted/20 relative overflow-hidden">
      {isGenerating && (
        <div className="absolute inset-0 bg-grid opacity-30" />
      )}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          {isGenerating ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Sparkles className="h-8 w-8" />
          )}
        </motion.div>
      </div>
      <h3 className="text-base font-semibold text-foreground relative">
        {isGenerating ? "Sedang men-generate RPS..." : "Belum ada hasil RPS"}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm relative">
        {isGenerating
          ? statusText || "AI sedang menyusun RPS berbasis OBE. Mohon tunggu sebentar."
          : "Isi form di samping lalu klik tombol “Generate RPS dengan AI” untuk membuat RPS."}
      </p>
      {isGenerating && (
        <div className="mt-5 w-full max-w-xs relative space-y-2">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
            </span>
            <span className="font-mono">{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function JsonEditor({
  value,
  onChange,
  error,
  onSave,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Edit JSON Manual</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 text-xs">
            <X className="h-3 w-3 mr-1" />
            Batal
          </Button>
          <Button size="sm" onClick={onSave} className="h-7 text-xs">
            <Check className="h-3 w-3 mr-1" />
            Simpan Perubahan
          </Button>
        </div>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full h-[60vh] rounded-md border bg-[#282c34] text-zinc-100 font-mono text-[12.5px] leading-relaxed p-4 outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          style={{ tabSize: 2 }}
        />
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Error parsing JSON
          </p>
          <p className="text-[11px] text-destructive/80 mt-1 font-mono break-all">{error}</p>
        </div>
      ) : (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            JSON valid &mdash; klik “Simpan Perubahan” untuk menerapkan.
          </p>
        </div>
      )}
    </div>
  );
}
