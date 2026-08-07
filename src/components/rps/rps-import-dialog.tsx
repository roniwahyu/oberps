"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileJson,
  CheckCircle2,
  XCircle,
  Loader2,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{ index: number; error: string }>;
  data: Array<{ id: string; mataKuliah: string }>;
}

interface RpsImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export function RpsImportDialog({
  open,
  onOpenChange,
  onImported,
}: RpsImportDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<
    Array<{ mataKuliah?: string; sks?: string; programStudi?: string }> | null
  >(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const reset = useCallback(() => {
    setFileName(null);
    setFileContent(null);
    setParsedPreview(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        reset();
      }
      onOpenChange(next);
    },
    [onOpenChange, reset]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setParseError(null);
      setParsedPreview(null);

      try {
        const text = await file.text();
        setFileContent(text);
        const parsed = JSON.parse(text);

        // Normalize to array
        const arr = Array.isArray(parsed) ? parsed : [parsed];

        // Build preview
        const preview = arr.map((item: Record<string, unknown>) => {
          const hasWrapper = item.jsonData !== undefined;
          const data = hasWrapper
            ? (item.jsonData as Record<string, unknown>)
            : item;
          return {
            mataKuliah:
              (item.mataKuliah as string) ||
              (data?.MATA_KULIAH as string) ||
              (data?.MATAKULIAH as string) ||
              "Mata Kuliah Impor",
            sks:
              (item.sks as string) || (data?.SKS as string) || "3",
            programStudi:
              (item.programStudi as string) ||
              (data?.PROGRAM_STUDI as string) ||
              (data?.PRODI as string) ||
              "S1 Teknik Informatika",
          };
        });
        setParsedPreview(preview);
      } catch (err) {
        setParseError(
          err instanceof Error ? err.message : "File JSON tidak valid"
        );
        setFileContent(null);
      }
    },
    []
  );

  const handleImport = useCallback(async () => {
    if (!fileContent) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/rps/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: fileContent,
      });
      const json: ImportResult = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          (json as { error?: string }).error || "Gagal mengimpor RPS"
        );
      }
      toast({
        title: "Impor berhasil",
        description: `${json.imported} RPS berhasil diimpor${
          json.errors.length > 0
            ? `, ${json.errors.length} gagal`
            : ""
        }.`,
      });
      onImported();
      handleOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Gagal impor",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }, [fileContent, toast, onImported, handleOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4 text-primary" />
            Impor RPS dari JSON
          </DialogTitle>
          <DialogDescription className="text-xs">
            Unggah file JSON yang berisi data RPS (satu atau batch). Format
            didukung: objek RPS tunggal, objek dengan wrapper, atau array.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/40 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {fileName ? fileName : "Klik untuk memilih file JSON"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Format .json, maksimal beberapa MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Parse error */}
          {parseError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 flex items-start gap-2">
              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-destructive">
                  Gagal membaca file
                </p>
                <p className="text-[11px] text-destructive/80 mt-0.5 font-mono break-all">
                  {parseError}
                </p>
              </div>
            </div>
          )}

          {/* Preview */}
          {parsedPreview && parsedPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pratinjau ({parsedPreview.length} RPS)
                </Label>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  JSON valid
                </span>
              </div>
              <ScrollArea className="h-40 w-full rounded-md border border-border/50">
                <div className="p-2 space-y-1.5">
                  {parsedPreview.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md bg-muted/30 px-2.5 py-1.5"
                    >
                      <FileJson className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">
                          {p.mataKuliah}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {p.sks} SKS &middot; {p.programStudi}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isImporting}
            className="h-9"
          >
            Batal
          </Button>
          <Button
            onClick={handleImport}
            disabled={!fileContent || !!parseError || isImporting}
            className="h-9"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Mengimpor...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Impor {parsedPreview ? `${parsedPreview.length} RPS` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
