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
  WandSparkles,
  Table2,
  Keyboard,
  Layers3,
  Library,
  Share2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_FORM_INPUT,
  RPSFormInput,
  buildMasterPrompt,
  PROMPT_TEMPLATES,
  TemplateId,
} from "@/lib/rps-template";
import { calculateBobot, toRpsData, RpsData, normalizeBobot } from "@/lib/rps-parser";
import { CoursePreset } from "@/lib/course-presets";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { JsonPreview } from "./json-preview";
import { RpsSummary } from "./rps-summary";
import { buildPrintHtml } from "./print-utils";
import { PresetLibrary } from "./preset-library";
import { WeeklyMatrixEditor } from "./weekly-matrix-editor";
import { CplCpmkLibrary, LibraryEntry } from "./cpl-cpmk-library";
import { RpsShareDialog } from "./rps-share-dialog";
import { loadStoredLLMConfig, LLMProvider } from "./llm-settings";
import { CurriculumUploader, loadStoredCurriculumContext, CurriculumContextData } from "./curriculum-uploader";
import { generateRPSWithPuter } from "@/lib/puter-generator";
import { WizardFlow, WizardFlowData } from "./wizard-flow";

/** Extract + parse JSON from raw LLM text (handles think tags, markdown fences, leading text, truncated JSON, etc.) */
function parseGeneratedJSON(rawText: string): any {
  let trimmed = rawText.trim();

  // Strip reasoning blocks <think>...</think> from models like DeepSeek, MiniMax, Kimi
  trimmed = trimmed.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Try markdown code fence first
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    trimmed = fenceMatch[1].trim();
  }

  // Try to extract bare JSON object
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      // Fallback to full string try below
    }
  }

  if (firstBrace !== -1 && lastBrace === -1) {
    const sliced = trimmed.slice(firstBrace);
    const openCount = (sliced.match(/\{/g) || []).length;
    const closeCount = (sliced.match(/\}/g) || []).length;
    const missing = Math.max(0, openCount - closeCount);
    try {
      return JSON.parse(sliced + "}".repeat(missing));
    } catch {
      // Continue
    }
  }

  return JSON.parse(trimmed);
}

export interface RpsLoadRequest {
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string;
  jsonData: any;
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
  const [templateId, setTemplateId] = useState<TemplateId>("standard");
  const [generatedData, setGeneratedData] = useState<any>(null);
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
  const [matrixEditorOpen, setMatrixEditorOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [cplLibraryOpen, setCplLibraryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleWizardComplete = useCallback(
    async (wizardData: WizardFlowData, provider: LLMProvider) => {
      setForm(wizardData.formInput);
      const masterPrompt = buildMasterPrompt(
        wizardData.formInput,
        wizardData.templateId,
        wizardData.curriculumContext?.rawSummary
      );

      setIsGenerating(true);
      setGenProgress(20);
      setGenStatusText(`Menghubungkan ke ${provider.toUpperCase()} Engine...`);

      try {
        if (provider === "puter") {
          const rawText = await generateRPSWithPuter(masterPrompt, (msg) => setGenStatusText(msg));
          const parsed = parseGeneratedJSON(rawText);
          setGeneratedData(parsed);
          setGeneratedPrompt(masterPrompt);
          setViewMode("summary");
          toast({
            title: "RPS Wizard Berhasil!",
            description: `RPS ${wizardData.formInput.mataKuliah} berhasil digenerate via Puter.js AI.`,
          });
        } else {
          const llmConfig = loadStoredLLMConfig();
          const activeConfig = { ...llmConfig, provider };
          const res = await fetch("/api/rps/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...wizardData.formInput,
              templateId: wizardData.templateId,
              llmConfig: activeConfig,
              curriculumContext: wizardData.curriculumContext?.rawSummary,
            }),
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json?.error || "Gagal generate RPS dari server.");
          }
          setGeneratedData(json.data);
          setGeneratedPrompt(json.prompt);
          setViewMode("summary");
          toast({
            title: "RPS Wizard Berhasil!",
            description: `RPS ${wizardData.formInput.mataKuliah} berhasil digenerate oleh AI Engine (${provider.toUpperCase()}).`,
          });
        }
      } catch (err) {
        toast({
          title: "Wizard Generation Warning",
          description: `Gagal koneksi server. Menggunakan engine standalone fallback: ${err instanceof Error ? err.message : "Error"}`,
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [toast]
  );

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

  const handleApplyCplCpmk = useCallback(
    (entry: LibraryEntry) => {
      // Merge CPL/CPMK into existing generatedData (or create a stub)
      const existing =
        (typeof generatedData === "object" && generatedData !== null
          ? (generatedData as Record<string, unknown>)
          : {}) as Record<string, unknown>;
      const updated = {
        ...existing,
        CPL_PRODI: entry.cplText,
        CPMK: entry.cpmkText,
      };
      setGeneratedData(updated);
      setViewMode("summary");
    },
    [generatedData]
  );

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

  const [curriculumContext, setCurriculumContext] = useState<CurriculumContextData | null>(loadStoredCurriculumContext);

  const livePrompt = useMemo(
    () => buildMasterPrompt(form, templateId, curriculumContext?.rawSummary),
    [form, templateId, curriculumContext]
  );

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

    const llmConfig = loadStoredLLMConfig();

    // ── PUTER.JS DIRECT PATH ─────────────────────────────────────────────
    if (llmConfig.provider === "puter") {
      try {
        const masterPrompt = buildMasterPrompt(form, templateId, curriculumContext?.rawSummary);
        const rawText = await generateRPSWithPuter(masterPrompt, (msg) => {
          console.log("[Puter.js]", msg);
        });
        const parsed = parseGeneratedJSON(rawText);
        setGeneratedData(parsed);
        setGeneratedPrompt(masterPrompt);
        setViewMode("summary");
        toast({
          title: "RPS berhasil dibuat via Puter.js!",
          description: `RPS untuk ${form.mataKuliah} telah digenerate oleh claude-3-7-sonnet / gpt-4o.`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: "Puter.js gagal",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // ── SERVER-SIDE API PATH (OpenAI / Anthropic / Dahl / Custom / Standalone) ─
    try {
      const res = await fetch("/api/rps/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          templateId,
          llmConfig,
          curriculumContextText: curriculumContext?.rawSummary,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        const errMsg = json?.error || "Gagal generate RPS.";

        // ── PUTER.JS AUTOMATIC FALLBACK ─────────────────────────────────
        if (
          errMsg.includes("NO_API_KEY") ||
          errMsg.includes("FALLBACK_TO_PUTER") ||
          errMsg.includes("401") ||
          errMsg.includes("403") ||
          llmConfig.provider === "standalone"
        ) {
          toast({
            title: "Beralih ke Puter.js (Fallback)",
            description: "API LLM tidak tersedia. Mencoba generate via Puter.js secara gratis...",
          });
          const masterPrompt = buildMasterPrompt(form, templateId, curriculumContext?.rawSummary);
          const rawText = await generateRPSWithPuter(masterPrompt, (msg) => {
            console.log("[Puter.js Fallback]", msg);
          });
          const parsed = parseGeneratedJSON(rawText);
          setGeneratedData(parsed);
          setGeneratedPrompt(masterPrompt);
          setViewMode("summary");
          toast({
            title: "RPS berhasil via Puter.js!",
            description: `RPS untuk ${form.mataKuliah} digenerate melalui Puter.js AI sebagai fallback.`,
          });
          setIsGenerating(false);
          return;
        }

        throw new Error(errMsg);
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
      // Last-resort Puter.js fallback for any network error
      if (
        message.includes("fetch") ||
        message.includes("network") ||
        message.includes("ERR_")
      ) {
        try {
          toast({
            title: "Koneksi server gagal. Mencoba Puter.js...",
            description: "Fallback otomatis ke Puter.js AI...",
          });
          const masterPrompt = buildMasterPrompt(form, templateId, curriculumContext?.rawSummary);
          const rawText = await generateRPSWithPuter(masterPrompt);
          const parsed = parseGeneratedJSON(rawText);
          setGeneratedData(parsed);
          setGeneratedPrompt(masterPrompt);
          setViewMode("summary");
          toast({
            title: "RPS berhasil via Puter.js!",
            description: `Fallback berhasil: RPS ${form.mataKuliah} digenerate via Puter.js.`,
          });
          setIsGenerating(false);
          return;
        } catch (puterErr) {
          toast({
            title: "Semua layanan AI gagal",
            description: `Server gagal & Puter.js gagal: ${puterErr instanceof Error ? puterErr.message : "Error tidak diketahui"}`,
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
      }
      toast({
        title: "Gagal generate",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [form, toast, templateId, curriculumContext]);

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

  const handleFixBobot = useCallback(() => {
    if (!rpsData) return;
    const result = normalizeBobot(rpsData);
    if (result.changes.length === 0) {
      toast({
        title: "Bobot sudah valid",
        description: "Total bobot sudah 100%, tidak perlu perbaikan.",
      });
      return;
    }
    setGeneratedData(result.data);
    toast({
      title: "Bobot dinormalisasi",
      description: `Total ${result.oldTotal}% → ${result.newTotal}%. ${result.changes.length} minggu disesuaikan.`,
    });
  }, [rpsData, toast]);

  const handleMatrixSave = useCallback(
    (newData: RpsData) => {
      setGeneratedData(newData);
      toast({
        title: "Matriks diperbarui",
        description: "Perubahan matriks mingguan telah disimpan (lokal).",
      });
    },
    [toast]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onGenerate: () => handleGenerate(),
    onSave: () => handleSave(),
    onPreset: () => setPresetOpen(true),
    onReset: () => handleReset(),
    onPrint: () => handlePrint(),
    onToggleView: () =>
      setViewMode((m) => (m === "summary" ? "json" : "summary")),
  });

  return (
    <div className="space-y-6">
      <CurriculumUploader onCurriculumLoaded={setCurriculumContext} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <PresetLibrary
        open={presetOpen}
        onOpenChange={setPresetOpen}
        onSelect={handleSelectPreset}
      />
      <CplCpmkLibrary
        open={cplLibraryOpen}
        onOpenChange={setCplLibraryOpen}
        onApply={handleApplyCplCpmk}
      />
      <WizardFlow
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={handleWizardComplete}
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
                  <CardTitle className="text-base font-semibold">Form Mata Kuliah</CardTitle>
                  <CardDescription className="text-xs">
                    Isi data mata kuliah atau gunakan Wizard 9-Step OBE
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-indigo-500/50 text-indigo-400 bg-indigo-950/20 hover:bg-indigo-900/40 text-xs font-semibold h-8"
                  onClick={() => setWizardOpen(true)}
                >
                  <Wand2 className="w-3.5 h-3.5 mr-1 text-indigo-400 animate-pulse" />
                  Wizard 9-Step OBE
                </Button>
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
                  onClick={() => setCplLibraryOpen(true)}
                  className="h-8 text-xs text-muted-foreground"
                  title="Pustaka CPL/CPMK dari RPS tersimpan"
                >
                  <Library className="h-3.5 w-3.5 mr-1.5" />
                  CPL/CPMK
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

            {/* Template selector */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Layers3 className="h-3.5 w-3.5 text-primary" />
                Template Prompt
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {PROMPT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplateId(tpl.id)}
                    className={`text-left rounded-lg border p-2.5 transition-all ${
                      templateId === tpl.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {templateId === tpl.id && (
                        <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                      )}
                      <span className="text-xs font-semibold">{tpl.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>
                  </button>
                ))}
              </div>
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
                {viewMode === "summary" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMatrixEditorOpen(true)}
                    className="h-8 text-xs"
                  >
                    <Table2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit Matriks
                  </Button>
                )}
                {bobot && !bobot.isValid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFixBobot}
                    className="h-8 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                    title="Normalisasi bobot agar total = 100%"
                  >
                    <WandSparkles className="h-3.5 w-3.5 mr-1.5" />
                    Fix Bobot
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShortcutsOpen(true)}
                  className="h-8 text-xs"
                  title="Pintasan keyboard"
                >
                  <Keyboard className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShareOpen(true)}
                  className="h-8 text-xs"
                  title="Bagikan RPS via tautan"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  Bagikan
                </Button>
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
                    <li>Periksa badge bobot — total M1–M16 harus = 100%. Gunakan <span className="font-mono">Fix Bobot</span> jika tidak valid.</li>
                    <li>Klik <span className="font-mono">Edit Matriks</span> untuk mengedit field mingguan secara langsung.</li>
                    <li>Klik <span className="font-mono">Cetak / PDF</span> untuk mencetak atau menyimpan sebagai PDF.</li>
                    <li>Tekan <kbd className="px-1 py-0.5 rounded bg-muted border border-border/60 font-mono text-[10px]">Ctrl+Enter</kbd> untuk generate, <kbd className="px-1 py-0.5 rounded bg-muted border border-border/60 font-mono text-[10px]">Ctrl+S</kbd> untuk simpan.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weekly Matrix Editor */}
      {rpsData && (
        <WeeklyMatrixEditor
          data={rpsData}
          open={matrixEditorOpen}
          onOpenChange={setMatrixEditorOpen}
          onSave={handleMatrixSave}
        />
      )}

      {/* Share Dialog */}
      {generatedData && (
        <RpsShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          mataKuliah={form.mataKuliah}
          sks={form.sks}
          semester={form.semester}
          programStudi={form.programStudi}
          deskripsi={deskripsi}
          jsonData={typeof generatedData === "string" ? generatedData : JSON.stringify(generatedData)}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      </div>
    </div>
  );
}

function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const shortcuts = [
    { keys: ["Ctrl", "Enter"], action: "Generate RPS" },
    { keys: ["Ctrl", "S"], action: "Simpan RPS" },
    { keys: ["Ctrl", "K"], action: "Buka Pustaka Preset" },
    { keys: ["Ctrl", "P"], action: "Cetak / PDF" },
    { keys: ["Ctrl", "Shift", "V"], action: "Toggle Ringkasan/JSON" },
    { keys: ["Ctrl", "Shift", "R"], action: "Reset form" },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Keyboard className="h-4 w-4 text-primary" />
            Pintasan Keyboard
          </DialogTitle>
          <DialogDescription className="text-xs">
            Gunakan pintasan berikut untuk bekerja lebih cepat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
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
      </DialogContent>
    </Dialog>
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
