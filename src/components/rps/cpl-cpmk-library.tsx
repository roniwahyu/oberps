"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Library,
  Copy,
  Search,
  FileText,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface LibraryEntry {
  sourceId: string;
  sourceMataKuliah: string;
  sourceProgramStudi: string;
  cplText: string;
  cpmkText: string;
}

interface CplCpmkLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (entry: LibraryEntry) => void;
}

export function CplCpmkLibrary({
  open,
  onOpenChange,
  onApply,
}: CplCpmkLibraryProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rps/library", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setEntries(json.data as LibraryEntry[]);
      }
    } catch {
      toast({
        title: "Gagal memuat",
        description: "Tidak dapat mengambil pustaka CPL/CPMK.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      e.sourceMataKuliah.toLowerCase().includes(q) ||
      e.sourceProgramStudi.toLowerCase().includes(q) ||
      e.cplText.toLowerCase().includes(q) ||
      e.cpmkText.toLowerCase().includes(q)
    );
  });

  const handleApply = useCallback(
    (entry: LibraryEntry) => {
      onApply(entry);
      onOpenChange(false);
      toast({
        title: "CPL/CPMK dimuat",
        description: `CPL & CPMK dari "${entry.sourceMataKuliah}" diterapkan ke Builder.`,
      });
    },
    [onApply, onOpenChange, toast]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Library className="h-4 w-4 text-primary" />
            Pustaka CPL / CPMK
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ambil CPL &amp; CPMK dari RPS tersimpan untuk digunakan ulang di
            Builder. Data JSON akan diperbarui dengan CPL/CPMK dari sumber
            yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari mata kuliah / prodi / CPL / CPMK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {filtered.length} dari {entries.length} entri
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Memuat pustaka...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
                  <Library className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">
                  {search ? "Tidak ada hasil" : "Pustaka kosong"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {search
                    ? `Tidak ada entri cocok dengan "${search}".`
                    : "Simpan RPS terlebih dahulu untuk membangun pustaka CPL/CPMK."}
                </p>
              </div>
            ) : (
              filtered.map((entry) => {
                const isExpanded = expandedId === entry.sourceId;
                const cplLines = entry.cplText
                  .split("\n")
                  .filter((l) => l.trim());
                const cpmkLines = entry.cpmkText
                  .split("\n")
                  .filter((l) => l.trim());
                return (
                  <div
                    key={entry.sourceId}
                    className="rounded-lg border border-border/60 bg-background overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : entry.sourceId)
                      }
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {entry.sourceMataKuliah}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {entry.sourceProgramStudi}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="secondary" className="text-[9px] font-normal">
                          {cplLines.length} CPL
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] font-normal">
                          {cpmkLines.length} CPMK
                        </Badge>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t bg-muted/10 p-3 space-y-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                            CPL Prodi
                          </p>
                          <pre className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap text-foreground/80 bg-background rounded-md border p-2 max-h-32 overflow-y-auto">
                            {entry.cplText || "-"}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                            CPMK
                          </p>
                          <pre className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap text-foreground/80 bg-background rounded-md border p-2 max-h-32 overflow-y-auto">
                            {entry.cpmkText || "-"}
                          </pre>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleApply(entry)}
                          className="w-full h-8 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1.5" />
                          Terapkan ke Builder
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export type { LibraryEntry };
