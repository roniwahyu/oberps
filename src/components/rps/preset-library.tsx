"use client";

import { useMemo, useState } from "react";
import {
  Code2,
  Database,
  Network,
  Brain,
  Binary,
  Cpu,
  Rocket,
  Microscope,
  LayoutDashboard,
  ClipboardList,
  BookMarked,
  X,
  Check,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  COURSE_PRESETS,
  PRESET_CATEGORIES,
  CoursePreset,
} from "@/lib/course-presets";

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  Database,
  Network,
  Brain,
  Binary,
  Cpu,
  Rocket,
  Microscope,
  LayoutDashboard,
  ClipboardList,
};

interface PresetLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (preset: CoursePreset) => void;
}

export function PresetLibrary({
  open,
  onOpenChange,
  onSelect,
}: PresetLibraryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COURSE_PRESETS.filter((p) => {
      const matchCat = category === "Semua" || p.kategori === category;
      const matchSearch =
        !q ||
        p.mataKuliah.toLowerCase().includes(q) ||
        p.programStudi.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, category]);

  const handleSelect = (preset: CoursePreset) => {
    onSelect(preset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <BookMarked className="h-4 w-4 text-primary" />
            Pustaka Mata Kuliah
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pilih template mata kuliah untuk mengisi form secara otomatis.
            Anda tetap dapat mengedit sebelum generate.
          </DialogDescription>
        </DialogHeader>

        {/* Search + categories */}
        <div className="px-6 py-3 border-b bg-muted/20 space-y-3">
          <Input
            placeholder="Cari mata kuliah atau program studi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <ScrollArea className="flex-1">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
                  <X className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Tidak ada preset ditemukan</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Coba kata kunci atau kategori lain.
                </p>
              </div>
            ) : (
              filtered.map((preset) => {
                const Icon = ICON_MAP[preset.icon] || Code2;
                return (
                  <Card
                    key={preset.id}
                    className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => handleSelect(preset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold leading-tight">
                            {preset.mataKuliah}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {preset.programStudi}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="text-[9px] font-normal"
                            >
                              {preset.sks} SKS
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-normal"
                            >
                              Smt {preset.semester}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-normal text-primary"
                            >
                              {preset.kategori}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                            {preset.deskripsi}
                          </p>
                        </div>
                        <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
