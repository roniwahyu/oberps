"use client";

import { useState, useCallback } from "react";
import { Pencil, X, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  RpsData,
  WeeklyMatrixRow,
  parseWeeklyMatrix,
  calculateBobot,
  updateWeeklyField,
} from "@/lib/rps-parser";

interface WeeklyMatrixEditorProps {
  data: RpsData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: RpsData) => void;
}

interface EditableRow {
  row: WeeklyMatrixRow;
  isUts: boolean;
  isUas: boolean;
}

export function WeeklyMatrixEditor({
  data,
  open,
  onOpenChange,
  onSave,
}: WeeklyMatrixEditorProps) {
  const [draft, setDraft] = useState<RpsData>(data);

  // Reset draft when dialog opens with fresh data
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setDraft(data);
      }
      onOpenChange(next);
    },
    [data, onOpenChange]
  );

  const rows = parseWeeklyMatrix(draft);
  const bobot = calculateBobot(draft);

  const handleFieldChange = useCallback(
    (week: number, field: string, value: string) => {
      setDraft((prev) => updateWeeklyField(prev, week, field, value));
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(draft);
    onOpenChange(false);
  }, [draft, onSave, onOpenChange]);

  const handleReset = useCallback(() => {
    setDraft(data);
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Pencil className="h-4 w-4 text-primary" />
                Editor Matriks Mingguan
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Edit langsung kemampuan, materi, bobot, metode, dan referensi
                untuk setiap pertemuan M1–M16.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Batal
              </Button>
              <Button size="sm" onClick={handleSave} className="h-8 text-xs">
                <Check className="h-3.5 w-3.5 mr-1" />
                Simpan
              </Button>
            </div>
          </div>
          {/* Bobot live indicator */}
          <div className="mt-3 flex items-center gap-2">
            <Badge
              variant={bobot.isValid ? "default" : "secondary"}
              className={`text-[10px] font-mono ${bobot.isValid ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
            >
              Total Bobot: {bobot.total}%
              {bobot.isValid ? " ✓" : " (harus 100)"}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {bobot.filledWeeks} dari 16 minggu memiliki bobot
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 sticky top-0">
                  <TableHead className="w-[50px] text-center">Mgg</TableHead>
                  <TableHead className="min-w-[220px]">Sub-CPMK</TableHead>
                  <TableHead className="min-w-[200px]">Materi</TableHead>
                  <TableHead className="min-w-[160px]">Indikator</TableHead>
                  <TableHead className="w-[80px]">Bobot</TableHead>
                  <TableHead className="min-w-[140px]">Metode</TableHead>
                  <TableHead className="min-w-[100px]">Waktu</TableHead>
                  <TableHead className="min-w-[140px]">Media</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <EditableMatrixRow
                    key={row.week}
                    row={row}
                    onChange={handleFieldChange}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function EditableMatrixRow({
  row,
  onChange,
}: {
  row: WeeklyMatrixRow;
  onChange: (week: number, field: string, value: string) => void;
}) {
  const isUts = row.isUts;
  const isUas = row.isUas;
  const isExam = isUts || isUas;

  return (
    <TableRow
      className={
        isExam
          ? "bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted/30"
      }
    >
      <TableCell className="align-top">
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs font-medium">M{row.week}</span>
          {isExam && (
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${isUts ? "bg-amber-500" : "bg-rose-500"}`}
              title={isUts ? "UTS" : "UAS"}
            />
          )}
        </div>
      </TableCell>
      <TableCell className="align-top">
        <Textarea
          value={row.kemampuan}
          onChange={(e) => onChange(row.week, "KEMAMPUAN", e.target.value)}
          rows={2}
          placeholder="Sub-CPMK..."
          className="text-xs min-h-[40px] resize-y"
        />
      </TableCell>
      <TableCell className="align-top">
        <Textarea
          value={row.materi}
          onChange={(e) => onChange(row.week, "MATERI", e.target.value)}
          rows={2}
          placeholder="Materi..."
          className="text-xs min-h-[40px] resize-y"
        />
      </TableCell>
      <TableCell className="align-top">
        <Textarea
          value={row.indikator}
          onChange={(e) => onChange(row.week, "INDIKATOR", e.target.value)}
          rows={2}
          placeholder="Indikator..."
          className="text-xs min-h-[40px] resize-y"
        />
      </TableCell>
      <TableCell className="align-top">
        <Input
          value={row.bobot}
          onChange={(e) => onChange(row.week, "BOBOT", e.target.value)}
          placeholder="0"
          className="text-xs h-8 w-[70px] text-center font-mono"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell className="align-top">
        <Input
          value={row.metode}
          onChange={(e) => onChange(row.week, "METODE", e.target.value)}
          placeholder="Metode..."
          className="text-xs h-8"
        />
      </TableCell>
      <TableCell className="align-top">
        <Input
          value={row.waktu}
          onChange={(e) => onChange(row.week, "WAKTU", e.target.value)}
          placeholder="Waktu..."
          className="text-xs h-8"
        />
      </TableCell>
      <TableCell className="align-top">
        <Input
          value={row.media}
          onChange={(e) => onChange(row.week, "MEDIA", e.target.value)}
          placeholder="Media..."
          className="text-xs h-8"
        />
      </TableCell>
    </TableRow>
  );
}
