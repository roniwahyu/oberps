"use client";

import { useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Trash2,
  FileText,
  Sparkles,
  BookCheck,
  Building2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export interface CurriculumContextData {
  fileName: string;
  cplList: Array<{ code: string; text: string }>;
  plList: Array<{ code: string; title: string }>;
  courseList: Array<{ code: string; name: string; sks: string; semester: string }>;
  cpmkMappings: Array<{ mkCode: string; mkName: string; cpmkCode: string; cpmkText: string; subCpmkCode: string; subCpmkText: string; cplCode: string }>;
  rawSummary: string;
}

const STORAGE_KEY = "smartrps_curriculum_context";

export function loadStoredCurriculumContext(): CurriculumContextData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredCurriculumContext(data: CurriculumContextData | null): void {
  if (typeof window === "undefined") return;
  if (!data) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

interface CurriculumUploaderProps {
  onCurriculumLoaded?: (data: CurriculumContextData | null) => void;
}

export function CurriculumUploader({ onCurriculumLoaded }: CurriculumUploaderProps) {
  const { toast } = useToast();
  const [curriculum, setCurriculum] = useState<CurriculumContextData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loaded = loadStoredCurriculumContext();
    if (loaded) {
      setCurriculum(loaded);
      if (onCurriculumLoaded) onCurriculumLoaded(loaded);
    }
  }, [onCurriculumLoaded]);

  const processWorkbook = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });

        const cplList: Array<{ code: string; text: string }> = [];
        const plList: Array<{ code: string; title: string }> = [];
        const courseList: Array<{ code: string; name: string; sks: string; semester: string }> = [];
        const cpmkMappings: Array<{ mkCode: string; mkName: string; cpmkCode: string; cpmkText: string; subCpmkCode: string; subCpmkText: string; cplCode: string }> = [];
        const summaryLines: string[] = [];

        wb.SheetNames.forEach((sheetName) => {
          const sheet = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          if (!rows || rows.length === 0) return;

          const sNameLower = sheetName.toLowerCase();

          // Extract CPL
          if (sNameLower.includes("cpl") && !sNameLower.includes("matriks") && !sNameLower.includes("peta")) {
            rows.forEach((r) => {
              if (Array.isArray(r) && r.length >= 3) {
                const code = String(r[1] || "").trim();
                const text = String(r[2] || "").trim();
                if (code.toUpperCase().startsWith("CPL") && text.length > 10) {
                  cplList.push({ code, text });
                }
              }
            });
          }

          // Extract Profil Lulusan (PL)
          if (sNameLower.includes("profil") || sNameLower.includes("pl")) {
            rows.forEach((r) => {
              if (Array.isArray(r) && r.length >= 2) {
                const code = String(r[1] || "").trim();
                const title = String(r[2] || "").trim();
                if (code.toUpperCase().startsWith("PL") && title.length > 3) {
                  plList.push({ code, title });
                }
              }
            });
          }

          // Extract MK - CPMK - SubCPMK - CPL mappings
          if (sNameLower.includes("cpmk") || sNameLower.includes("subcpmk") || sNameLower.includes("evaluasi")) {
            rows.forEach((r) => {
              if (Array.isArray(r) && r.length >= 8) {
                const mkCode = String(r[0] || "").trim();
                const mkName = String(r[1] || "").trim();
                const cpmkCode = String(r[3] || "").trim();
                const cpmkText = String(r[4] || "").trim();
                const subCpmkCode = String(r[5] || "").trim();
                const subCpmkText = String(r[6] || "").trim();
                const cplCode = String(r[7] || "").trim();

                if (cpmkCode.startsWith("CPMK") || subCpmkCode.startsWith("Sub-CPMK")) {
                  cpmkMappings.push({
                    mkCode,
                    mkName,
                    cpmkCode,
                    cpmkText,
                    subCpmkCode,
                    subCpmkText,
                    cplCode,
                  });
                }
              }
            });
          }

          // Summary text
          const sheetText = XLSX.utils.sheet_to_txt(sheet).substring(0, 1500);
          summaryLines.push(`--- LEMBAR: ${sheetName} ---\n${sheetText}`);
        });

        const contextData: CurriculumContextData = {
          fileName: file.name,
          cplList,
          plList,
          courseList,
          cpmkMappings,
          rawSummary: summaryLines.join("\n\n").substring(0, 8000),
        };

        setCurriculum(contextData);
        saveStoredCurriculumContext(contextData);
        if (onCurriculumLoaded) onCurriculumLoaded(contextData);

        toast({
          title: "Dokumen Kurikulum Berhasil Dimuat",
          description: `Extracted ${cplList.length} CPL, ${plList.length} PL, dan ${cpmkMappings.length} pemetaan CPMK dari ${file.name}.`,
        });
      } catch (err) {
        console.error("[CurriculumUploader] error:", err);
        toast({
          title: "Gagal Memproses File Excel",
          description: "Pastikan berkas berformat .xlsx atau .xls yang valid.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [onCurriculumLoaded, toast]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processWorkbook(file);
    }
  };

  const handleClear = () => {
    setCurriculum(null);
    saveStoredCurriculumContext(null);
    if (onCurriculumLoaded) onCurriculumLoaded(null);
    toast({
      title: "Acuan Kurikulum Dihapus",
      description: "Aplikasi kembali menggunakan acuan OBE standar.",
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Acuan Kurikulum OBE (Excel / Modul Kurikulum)</span>
                {curriculum && (
                  <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-[10px] gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Aktif
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Unggah berkas <code className="font-mono text-primary">Implementasi_Modul_OBE*.xlsx</code> sebagai acuan CPL, Profil Lulusan, CPMK, &amp; Peta Kurikulum.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {curriculum ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-8 gap-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 border-red-500/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Acuan</span>
              </Button>
            ) : (
              <Label
                htmlFor="curriculum-file-input"
                className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Unggah File Excel (.xlsx)</span>
              </Label>
            )}
            <input
              id="curriculum-file-input"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </CardHeader>

      {curriculum && (
        <CardContent className="pt-1 text-xs space-y-3">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
            <BookCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <div className="font-semibold text-xs flex items-center gap-2">
                <span>Berkas Acuan: {curriculum.fileName}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] opacity-90 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {curriculum.cplList.length} CPL Terdeteksi
                </span>
                <span>&bull;</span>
                <span>{curriculum.plList.length} Profil Lulusan (PL)</span>
                <span>&bull;</span>
                <span>{curriculum.cpmkMappings.length} Pemetaan CPMK/Sub-CPMK</span>
              </div>
            </div>
          </div>

          {curriculum.cplList.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                Prinjau CPL Kurikulum Terpakai:
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1 rounded-md border border-border/60 bg-muted/40 p-2 text-[11px]">
                {curriculum.cplList.slice(0, 5).map((cpl, i) => (
                  <div key={i} className="line-clamp-1">
                    <span className="font-bold text-primary mr-1.5">{cpl.code}:</span>
                    <span>{cpl.text}</span>
                  </div>
                ))}
                {curriculum.cplList.length > 5 && (
                  <div className="text-[10px] text-muted-foreground italic pt-1">
                    + {curriculum.cplList.length - 5} CPL lainnya tersimpan sebagai acuan master prompt.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
