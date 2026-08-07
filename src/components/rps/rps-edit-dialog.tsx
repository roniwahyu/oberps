"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export interface SavedRpsMeta {
  id: string;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string | null;
}

interface RpsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SavedRpsMeta | null;
  onSaved: () => void;
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

export function RpsEditDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: RpsEditDialogProps) {
  const { toast } = useToast();
  const [mataKuliah, setMataKuliah] = useState("");
  const [sks, setSks] = useState("3");
  const [semester, setSemester] = useState("1");
  const [programStudi, setProgramStudi] = useState("S1 Teknik Informatika");
  const [deskripsi, setDeskripsi] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync form when item changes / dialog opens
  useEffect(() => {
    if (item && open) {
      setMataKuliah(item.mataKuliah);
      setSks(item.sks);
      setSemester(item.semester);
      setProgramStudi(item.programStudi);
      setDeskripsi(item.deskripsi || "");
    }
  }, [item, open]);

  const handleSave = useCallback(async () => {
    if (!item) return;
    if (!mataKuliah.trim() || !sks || !semester || !programStudi.trim()) {
      toast({
        title: "Form belum lengkap",
        description: "Mohon isi semua field wajib.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/rps/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mataKuliah: mataKuliah.trim(),
          sks,
          semester,
          programStudi: programStudi.trim(),
          deskripsi: deskripsi.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Gagal memperbarui RPS.");
      }
      toast({
        title: "Tersimpan",
        description: `Metadata "${mataKuliah}" telah diperbarui.`,
      });
      onSaved();
      onOpenChange(false);
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
  }, [
    item,
    mataKuliah,
    sks,
    semester,
    programStudi,
    deskripsi,
    toast,
    onSaved,
    onOpenChange,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Pencil className="h-4 w-4 text-primary" />
            Edit Metadata RPS
          </DialogTitle>
          <DialogDescription className="text-xs">
            Perbarui informasi mata kuliah. Data JSON RPS tidak berubah.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-mataKuliah" className="text-sm font-medium">
              Mata Kuliah <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-mataKuliah"
              value={mataKuliah}
              onChange={(e) => setMataKuliah(e.target.value)}
              placeholder="contoh: Rekayasa Perangkat Lunak"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-sks" className="text-sm font-medium">
                SKS <span className="text-destructive">*</span>
              </Label>
              <Select value={sks} onValueChange={setSks}>
                <SelectTrigger id="edit-sks" className="w-full">
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
              <Label htmlFor="edit-semester" className="text-sm font-medium">
                Semester <span className="text-destructive">*</span>
              </Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="edit-semester" className="w-full">
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
            <Label
              htmlFor="edit-programStudi"
              className="text-sm font-medium"
            >
              Program Studi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-programStudi"
              list="editProgramStudiList"
              value={programStudi}
              onChange={(e) => setProgramStudi(e.target.value)}
              placeholder="contoh: S1 Teknik Informatika"
            />
            <datalist id="editProgramStudiList">
              {PROGRAM_STUDI_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-deskripsi" className="text-sm font-medium">
              Deskripsi{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (opsional)
              </span>
            </Label>
            <Textarea
              id="edit-deskripsi"
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi singkat mata kuliah..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-9"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="h-9">
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
