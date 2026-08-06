"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Trash2,
  Eye,
  RefreshCw,
  Search,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Layers,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { JsonPreview } from "./json-preview";

interface SavedRps {
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

interface RpsSavedListProps {
  refreshKey: number;
}

export function RpsSavedList({ refreshKey }: RpsSavedListProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<SavedRps[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState<SavedRps | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rps", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setItems(json.data as SavedRps[]);
      }
    } catch {
      toast({
        title: "Gagal memuat",
        description: "Tidak dapat mengambil daftar RPS tersimpan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      try {
        const res = await fetch(`/api/rps/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.error || "Gagal menghapus.");
        }
        toast({
          title: "Terhapus",
          description: `RPS "${name}" telah dihapus.`,
        });
        setItems((prev) => prev.filter((it) => it.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: "Gagal menghapus",
          description: message,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const filtered = items.filter((it) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      it.mataKuliah.toLowerCase().includes(q) ||
      it.programStudi.toLowerCase().includes(q) ||
      it.semester.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            RPS Tersimpan
          </h2>
          <p className="text-sm text-muted-foreground">
            Daftar RPS yang sudah Anda buat dan simpan ke database lokal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari mata kuliah / prodi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-56"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="pt-6 space-y-3">
                <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState search={search} hasItems={items.length > 0} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <SavedCard
              key={item.id}
              item={item}
              onView={() => setDetailItem(item)}
              onDelete={() => handleDelete(item.id, item.mataKuliah)}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(o) => !o && setDetailItem(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              {detailItem?.mataKuliah}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Detail RPS tersimpan.
            </DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b bg-muted/30">
                <Meta
                  icon={<Layers className="h-3.5 w-3.5" />}
                  label="SKS"
                  value={`${detailItem.sks} SKS`}
                />
                <Meta
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                  label="Semester"
                  value={detailItem.semester}
                />
                <Meta
                  icon={<GraduationCap className="h-3.5 w-3.5" />}
                  label="Program Studi"
                  value={detailItem.programStudi}
                />
                <Meta
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                  label="Dibuat"
                  value={new Date(detailItem.createdAt).toLocaleDateString(
                    "id-ID",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                />
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {detailItem.deskripsi && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Deskripsi
                      </h4>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                        {detailItem.deskripsi}
                      </p>
                    </div>
                  )}
                  <Separator />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Data JSON
                    </h4>
                    <JsonPreview
                      data={detailItem.jsonData}
                      filename={`RPS_${detailItem.mataKuliah.replace(/\s+/g, "_")}.json`}
                      maxHeight="50vh"
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

function SavedCard({
  item,
  onView,
  onDelete,
}: {
  item: SavedRps;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <CardTitle
                className="text-sm font-semibold leading-tight truncate"
                title={item.mataKuliah}
              >
                {item.mataKuliah}
              </CardTitle>
              <CardDescription className="text-xs truncate">
                {item.programStudi}
              </CardDescription>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus RPS ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak dapat dibatalkan. RPS{" "}
                  <span className="font-medium text-foreground">
                    &ldquo;{item.mataKuliah}&rdquo;
                  </span>{" "}
                  akan dihapus permanen dari database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[10px] font-normal">
            <Layers className="h-3 w-3 mr-1" />
            {item.sks} SKS
          </Badge>
          <Badge variant="secondary" className="text-[10px] font-normal">
            <CalendarDays className="h-3 w-3 mr-1" />
            Smt {item.semester}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-normal">
            OBE
          </Badge>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <Button size="sm" variant="outline" onClick={onView} className="h-7 text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Lihat Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  search,
  hasItems,
}: {
  search: string;
  hasItems: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-lg border border-dashed border-border/60 bg-muted/20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold">
        {search ? "Tidak ada hasil" : hasItems ? "Tidak ada RPS tersimpan" : "Belum ada RPS tersimpan"}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {search
          ? `Tidak ada RPS yang cocok dengan pencarian "${search}".`
          : "Mulai dengan membuat RPS baru di tab Builder, lalu simpan untuk melihatnya di sini."}
      </p>
    </div>
  );
}
