"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, Save, Loader2, RotateCcw, Wand2, FileText } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_FORM_INPUT,
  RPSFormInput,
  buildMasterPrompt,
} from "@/lib/rps-template";
import { JsonPreview } from "./json-preview";

interface RpsBuilderProps {
  onSaved?: () => void;
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

export function RpsBuilder({ onSaved }: RpsBuilderProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<RPSFormInput>(DEFAULT_FORM_INPUT);
  const [deskripsi, setDeskripsi] = useState("");
  const [generatedData, setGeneratedData] = useState<unknown>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const livePrompt = useMemo(() => buildMasterPrompt(form), [form]);

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
    toast({ title: "Direset", description: "Form dan preview telah dibersihkan." });
  }, [toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

      {/* RIGHT: JSON Preview / Empty state */}
      <div className="lg:col-span-7 space-y-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Hasil JSON
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {generatedData
                    ? "Hasil generate RPS siap untuk disimpan atau diunduh."
                    : "Hasil JSON akan muncul di sini setelah generate."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {generatedData && (
                  <>
                    <Badge variant="outline" className="text-[10px]">
                      OBE Curriculum
                    </Badge>
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
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {generatedData ? (
              <JsonPreview
                data={generatedData}
                filename={`RPS_${form.mataKuliah.replace(/\s+/g, "_")}.json`}
                maxHeight="70vh"
              />
            ) : (
              <EmptyState isGenerating={isGenerating} />
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
                    <li>Periksa total bobot M1–M16 = 100 sebelum disimpan.</li>
                    <li>Gunakan tombol <span className="font-mono">Salin</span> untuk menyalin JSON ke clipboard.</li>
                    <li>Gunakan tombol <span className="font-mono">Unduh</span> untuk menyimpan sebagai file .json.</li>
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

function EmptyState({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-lg border border-dashed border-border/60 bg-muted/20">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {isGenerating ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Sparkles className="h-8 w-8" />
          )}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">
        {isGenerating ? "Sedang men-generate RPS..." : "Belum ada hasil JSON"}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {isGenerating
          ? "AI sedang menyusun RPS berbasis OBE. Mohon tunggu sebentar."
          : "Isi form di samping lalu klik tombol “Generate RPS dengan AI” untuk membuat JSON RPS."}
      </p>
      {isGenerating && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
        </div>
      )}
    </div>
  );
}
