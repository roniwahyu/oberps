"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Printer,
  Copy,
  ExternalLink,
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { JsonPreview } from "./json-preview";
import { RpsSummary } from "./rps-summary";
import { buildPrintHtml } from "./print-utils";
import { toRpsData, calculateBobot } from "@/lib/rps-parser";

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
  onDuplicate?: (item: SavedRps) => void;
}

export function RpsSavedList({ refreshKey, onDuplicate }: RpsSavedListProps) {
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
        setDetailItem((cur) => (cur?.id === id ? null : cur));
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

  const handlePrint = useCallback(
    (item: SavedRps) => {
      const data = toRpsData(item.jsonData);
      if (!data) {
        toast({
          title: "Data tidak valid",
          description: "JSON RPS tidak dapat diparse.",
          variant: "destructive",
        });
        return;
      }
      const html = buildPrintHtml({
        data,
        mataKuliah: item.mataKuliah,
        sks: item.sks,
        semester: item.semester,
        programStudi: item.programStudi,
        deskripsi: item.deskripsi || undefined,
      });
      const win = window.open("", "_blank", "width=900,height=700");
      if (!win) {
        toast({
          title: "Popup diblokir",
          description: "Izinkan popup untuk mencetak RPS.",
          variant: "destructive",
        });
        return;
      }
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 400);
    },
    [toast]
  );

  const handleDuplicate = useCallback(
    (item: SavedRps) => {
      onDuplicate?.(item);
      toast({
        title: "Dimuat ke Builder",
        description: `Data "${item.mataKuliah}" telah dimuat ke Builder untuk disunting.`,
      });
    },
    [onDuplicate, toast]
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

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const prodiCount = new Set(items.map((i) => i.programStudi)).size;
    const totalSks = items.reduce(
      (sum, it) => sum + (parseInt(it.sks, 10) || 0),
      0
    );
    return { total, prodiCount, totalSks };
  }, [items]);

  return (
    <div className="space-y-5">
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

      {/* Stats row */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={BookOpen}
            label="Total RPS"
            value={String(stats.total)}
            color="text-primary"
          />
          <StatCard
            icon={Layers}
            label="Total SKS"
            value={String(stats.totalSks)}
            color="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={GraduationCap}
            label="Program Studi"
            value={String(stats.prodiCount)}
            color="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

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
              onPrint={() => handlePrint(item)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(o) => !o && setDetailItem(null)}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                {detailItem?.mataKuliah}
              </DialogTitle>
              {detailItem && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handlePrint(detailItem)}
                  >
                    <Printer className="h-3.5 w-3.5 mr-1.5" />
                    Cetak / PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      handleDuplicate(detailItem);
                      setDetailItem(null);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Salin ke Builder
                  </Button>
                </div>
              )}
            </div>
            <DialogDescription className="text-xs">
              Detail RPS tersimpan — beralih antara tampilan ringkasan dan JSON.
            </DialogDescription>
          </DialogHeader>
          {detailItem && (
            <DetailBody item={detailItem} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailBody({ item }: { item: SavedRps }) {
  const rpsData = useMemo(() => toRpsData(item.jsonData), [item.jsonData]);
  const bobot = useMemo(
    () => (rpsData ? calculateBobot(rpsData) : null),
    [rpsData]
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Metadata grid - fixed, no truncate so Program Studi wraps */}
      <div className="px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b bg-muted/30">
        <Meta
          icon={<Layers className="h-3.5 w-3.5" />}
          label="SKS"
          value={`${item.sks} SKS`}
        />
        <Meta
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Semester"
          value={item.semester}
        />
        <Meta
          icon={<GraduationCap className="h-3.5 w-3.5" />}
          label="Program Studi"
          value={item.programStudi}
        />
        <Meta
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Dibuat"
          value={new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        />
      </div>

      <Tabs defaultValue="summary" className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 py-2 border-b bg-background">
          <TabsList className="bg-muted/40 p-0.5">
            <TabsTrigger value="summary" className="text-xs gap-1.5">
              <ExternalLink className="h-3 w-3" />
              Ringkasan
              {bobot && (
                <Badge
                  variant={bobot.isValid ? "default" : "secondary"}
                  className={`ml-1 text-[9px] font-mono h-4 px-1 ${bobot.isValid ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                >
                  {bobot.total}%
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs gap-1.5">
              JSON
            </TabsTrigger>
            {item.deskripsi && (
              <TabsTrigger value="info" className="text-xs gap-1.5">
                Info
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        <TabsContent value="summary" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6">
              {rpsData ? (
                <RpsSummary
                  data={rpsData}
                  mataKuliah={item.mataKuliah}
                  sks={item.sks}
                  semester={item.semester}
                  programStudi={item.programStudi}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Data JSON tidak dapat diparse.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="json" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6">
              <JsonPreview
                data={item.jsonData}
                filename={`RPS_${item.mataKuliah.replace(/\s+/g, "_")}.json`}
                maxHeight="60vh"
              />
            </div>
          </ScrollArea>
        </TabsContent>
        {item.deskripsi && (
          <TabsContent value="info" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Deskripsi Mata Kuliah
                  </h4>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Master Prompt (saat generate)
                  </h4>
                  <pre className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap p-3 rounded-md border border-border/50 bg-muted/30 text-foreground/80">
                    {item.promptText}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="py-3 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {label}
          </p>
          <p className="text-lg font-bold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-0.5 min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  );
}

function SavedCard({
  item,
  onView,
  onDelete,
  onPrint,
  onDuplicate,
}: {
  item: SavedRps;
  onView: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onDuplicate: () => void;
}) {
  const bobot = useMemo(() => {
    const d = toRpsData(item.jsonData);
    return d ? calculateBobot(d) : null;
  }, [item.jsonData]);

  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary/60 to-primary/0" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <BookOpen className="h-4 w-4" />
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
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
          {bobot && (
            <Badge
              variant={bobot.isValid ? "default" : "secondary"}
              className={`text-[10px] font-mono font-normal ${bobot.isValid ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
            >
              {bobot.total}%
            </Badge>
          )}
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
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onPrint}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Cetak / Simpan PDF"
            >
              <Printer className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDuplicate}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Salin ke Builder"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onView} className="h-7 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Detail
            </Button>
          </div>
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
