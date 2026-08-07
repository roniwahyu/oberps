"use client";

import { useMemo, useState } from "react";
import {
  GitCompareArrows,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
  PlusCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toRpsData, calculateBobot, RpsData } from "@/lib/rps-parser";

export interface SavedRps {
  id: string;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string | null;
  promptText: string;
  jsonData: string;
  createdAt: string;
  updatedAt: string;
}

interface RpsCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SavedRps[];
}

type DiffStatus = "same" | "added" | "removed" | "changed";

interface DiffRow {
  field: string;
  label: string;
  valueA: string;
  valueB: string;
  status: DiffStatus;
}

const COMPARE_FIELDS: Array<{ field: string; label: string }> = [
  { field: "DESKRIPSI", label: "Deskripsi" },
  { field: "CPL_PRODI", label: "CPL Prodi" },
  { field: "CPMK", label: "CPMK" },
  { field: "MATERI_POKOK", label: "Materi Pokok" },
  { field: "REFERENSI_UTAMA", label: "Referensi Utama" },
  { field: "REFERENSI_PENDUKUNG", label: "Referensi Pendukung" },
  { field: "INTEGRASI_RISPKM", label: "Integrasi RISPKM" },
  { field: "MEDIA_LUNAK", label: "Media Lunak" },
  { field: "MEDIA_KERAS", label: "Media Keras" },
  { field: "TEAM_TEACHING", label: "Team Teaching" },
  { field: "MK_SYARAT", label: "MK Syarat" },
  { field: "RANCANGAN_TUGAS", label: "Rancangan Tugas" },
  { field: "RUBRIK_PENILAIAN", label: "Rubrik Penilaian" },
];

// Weekly fields to compare (M1-M16)
const WEEKLY_FIELDS = [
  "KEMAMPUAN",
  "MATERI",
  "INDIKATOR",
  "TEKNIK",
  "BOBOT",
  "METODE",
  "WAKTU",
  "PENGALAMAN",
  "MEDIA",
  "REFERENSI",
];

export function RpsCompareDialog({
  open,
  onOpenChange,
  items,
}: RpsCompareDialogProps) {
  const [idA, setIdA] = useState<string>(items[0]?.id || "");
  const [idB, setIdB] = useState<string>(items[1]?.id || "");

  const itemA = items.find((i) => i.id === idA);
  const itemB = items.find((i) => i.id === idB);

  const dataA = useMemo(() => (itemA ? toRpsData(itemA.jsonData) : null), [itemA]);
  const dataB = useMemo(() => (itemB ? toRpsData(itemB.jsonData) : null), [itemB]);

  const bobotA = useMemo(() => (dataA ? calculateBobot(dataA) : null), [dataA]);
  const bobotB = useMemo(() => (dataB ? calculateBobot(dataB) : null), [dataB]);

  const diffs = useMemo(() => {
    if (!dataA || !dataB) return [] as DiffRow[];
    const rows: DiffRow[] = [];

    // Top-level fields
    for (const { field, label } of COMPARE_FIELDS) {
      const vA = String(dataA[field] || "");
      const vB = String(dataB[field] || "");
      if (vA === vB) {
        if (vA) rows.push({ field, label, valueA: vA, valueB: vB, status: "same" });
      } else if (!vA && vB) {
        rows.push({ field, label, valueA: "", valueB: vB, status: "added" });
      } else if (vA && !vB) {
        rows.push({ field, label, valueA: vA, valueB: "", status: "removed" });
      } else {
        rows.push({ field, label, valueA: vA, valueB: vB, status: "changed" });
      }
    }

    // Weekly fields (M1-M16)
    for (let w = 1; w <= 16; w++) {
      for (const f of WEEKLY_FIELDS) {
        const key = `M${w}_${f}`;
        const vA = String(dataA[key] || "");
        const vB = String(dataB[key] || "");
        // Skip if both empty
        if (!vA && !vB) continue;
        if (vA === vB) continue; // skip same to keep diff concise
        if (!vA && vB) {
          rows.push({
            field: key,
            label: `M${w} ${f}`,
            valueA: "",
            valueB: vB,
            status: "added",
          });
        } else if (vA && !vB) {
          rows.push({
            field: key,
            label: `M${w} ${f}`,
            valueA: vA,
            valueB: "",
            status: "removed",
          });
        } else {
          rows.push({
            field: key,
            label: `M${w} ${f}`,
            valueA: vA,
            valueB: vB,
            status: "changed",
          });
        }
      }
    }

    return rows;
  }, [dataA, dataB]);

  const stats = useMemo(() => {
    const changed = diffs.filter((d) => d.status === "changed").length;
    const added = diffs.filter((d) => d.status === "added").length;
    const removed = diffs.filter((d) => d.status === "removed").length;
    const same = diffs.filter((d) => d.status === "same").length;
    return { changed, added, removed, same, total: diffs.length };
  }, [diffs]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base">
                <GitCompareArrows className="h-4 w-4 text-primary" />
                Bandingkan RPS
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Pilih dua RPS untuk membandingkan perbedaan field-nya.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Selector row */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <Select value={idA} onValueChange={setIdA}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih RPS A" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.id} value={it.id}>
                      {it.mataKuliah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-[180px]">
              <Select value={idB} onValueChange={setIdB}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih RPS B" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.id} value={it.id}>
                      {it.mataKuliah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary badges */}
          {dataA && dataB && (
            <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
              <Badge variant="secondary" className="text-[10px] font-normal">
                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                {stats.same} sama
              </Badge>
              <Badge
                variant="secondary"
                className="text-[10px] font-normal bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                <MinusCircle className="h-3 w-3 mr-1" />
                {stats.changed} berubah
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-normal bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <PlusCircle className="h-3 w-3 mr-1" />
                {stats.added} ditambah
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-normal bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                <XCircle className="h-3 w-3 mr-1" />
                {stats.removed} dihapus
              </Badge>
              <span className="ml-auto text-muted-foreground">
                Bobot A:{" "}
                <span className="font-mono font-medium">
                  {bobotA?.total ?? "-"}%
                </span>{" "}
                / B:{" "}
                <span className="font-mono font-medium">
                  {bobotB?.total ?? "-"}%
                </span>
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Diff table */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {!dataA || !dataB ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GitCompareArrows className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Pilih dua RPS untuk membandingkan.
                </p>
              </div>
            ) : diffs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
                <p className="text-sm font-medium">RPS identik</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tidak ada perbedaan field yang ditemukan.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 sticky top-0">
                    <TableHead className="w-[60px]">Status</TableHead>
                    <TableHead className="w-[140px]">Field</TableHead>
                    <TableHead className="min-w-[200px]">
                      {itemA?.mataKuliah || "RPS A"}
                    </TableHead>
                    <TableHead className="min-w-[200px]">
                      {itemB?.mataKuliah || "RPS B"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diffs.map((d) => (
                    <DiffTableRow key={d.field} row={d} />
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function DiffTableRow({ row }: { row: DiffRow }) {
  const { status } = row;
  let StatusIcon: React.ElementType = CheckCircle2;
  let statusColor = "text-emerald-500";
  let rowBg = "";

  if (status === "changed") {
    StatusIcon = MinusCircle;
    statusColor = "text-amber-500";
    rowBg = "bg-amber-50/50 dark:bg-amber-950/10";
  } else if (status === "added") {
    StatusIcon = PlusCircle;
    statusColor = "text-emerald-500";
    rowBg = "bg-emerald-50/50 dark:bg-emerald-950/10";
  } else if (status === "removed") {
    StatusIcon = XCircle;
    statusColor = "text-rose-500";
    rowBg = "bg-rose-50/50 dark:bg-rose-950/10";
  }

  return (
    <TableRow className={rowBg}>
      <TableCell>
        <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
      </TableCell>
      <TableCell>
        <span className="text-[11px] font-mono font-medium text-muted-foreground">
          {row.label}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={`text-xs leading-relaxed whitespace-pre-wrap break-words ${
            status === "added" ? "text-muted-foreground/40 line-through" : ""
          }`}
        >
          {row.valueA || (
            <span className="text-muted-foreground/40 italic">— kosong —</span>
          )}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={`text-xs leading-relaxed whitespace-pre-wrap break-words ${
            status === "removed" ? "text-muted-foreground/40 line-through" : ""
          }`}
        >
          {row.valueB || (
            <span className="text-muted-foreground/40 italic">— kosong —</span>
          )}
        </span>
      </TableCell>
    </TableRow>
  );
}
