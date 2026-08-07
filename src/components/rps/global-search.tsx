"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Loader2,
  FileText,
  CornerDownLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchMatch {
  field: string;
  snippet: string;
}

interface SearchResult {
  id: string;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  createdAt: string;
  matches: SearchMatch[];
  totalMatches: number;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
}

export function GlobalSearch({
  open,
  onOpenChange,
  onSelect,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `/api/rps/search?q=${encodeURIComponent(q.trim())}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (json.success) {
        setResults(json.results as SearchResult[]);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [open]);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      onOpenChange(false);
    },
    [onSelect, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[80vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogTitle className="sr-only">Pencarian Global RPS</DialogTitle>
        <DialogDescription className="sr-only">
          Cari di semua RPS tersimpan — CPL, CPMK, materi, deskripsi, dll.
        </DialogDescription>
        {/* Search header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari di semua RPS (CPL, CPMK, materi, deskripsi...)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
          )}
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {!hasSearched ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Ketik minimal 2 karakter untuk mencari
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Pencarian menelusuri CPL, CPMK, materi pokok, deskripsi,
                  referensi, dan semua field mingguan M1–M16.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium">Tidak ada hasil</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tidak ditemukan RPS yang cocok dengan &ldquo;{query}&rdquo;.
                </p>
              </div>
            ) : (
              <>
                <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
                  {results.length} RPS ditemukan
                </div>
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    className="w-full text-left rounded-lg p-2.5 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {r.mataKuliah}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-normal shrink-0"
                          >
                            {r.totalMatches} cocok
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {r.programStudi} &middot; {r.sks} SKS &middot; Smt{" "}
                          {r.semester}
                        </p>
                        {/* Match snippets */}
                        <div className="mt-1.5 space-y-1">
                          {r.matches.slice(0, 3).map((m, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-1.5 text-[11px]"
                            >
                              <Badge
                                variant="outline"
                                className="text-[9px] font-normal shrink-0 py-0 px-1"
                              >
                                {m.field}
                              </Badge>
                              <span className="text-muted-foreground line-clamp-1 font-mono">
                                {m.snippet}
                              </span>
                            </div>
                          ))}
                          {r.matches.length > 3 && (
                            <p className="text-[10px] text-muted-foreground/70 ml-1">
                              +{r.matches.length - 3} cocok lainnya
                            </p>
                          )}
                        </div>
                      </div>
                      <CornerDownLeft className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
