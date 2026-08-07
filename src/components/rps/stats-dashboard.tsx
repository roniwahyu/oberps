"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Layers,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Calendar,
  Loader2,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsData {
  total: number;
  totalSks: number;
  prodiCount: number;
  bobotStat: { valid: number; invalid: number };
  byProdi: Array<{ programStudi: string; count: number; totalSks: number }>;
  bySemester: Array<{ semester: string; count: number }>;
  bySks: Array<{ sks: string; count: number }>;
  bobotDist: Array<{ mataKuliah: string; total: number; valid: boolean }>;
  recentCount: number;
}

interface StatsDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BOBOT_COLORS = {
  valid: "#10b981",
  invalid: "#f59e0b",
};

const PRODI_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function StatsDashboard({ open, onOpenChange }: StatsDashboardProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rps/stats", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setStats(json.data as StatsData);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  const bobotPieData = stats
    ? [
        { name: "Valid", value: stats.bobotStat.valid, color: BOBOT_COLORS.valid },
        { name: "Invalid", value: stats.bobotStat.invalid, color: BOBOT_COLORS.invalid },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Statistik RPS
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Visualisasi data RPS tersimpan — distribusi prodi, semester,
                SKS, dan validitas bobot.
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
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">
                  Memuat statistik...
                </p>
              </div>
            ) : !stats ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Gagal memuat statistik.
                </p>
              </div>
            ) : stats.total === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Belum ada data</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Simpan RPS terlebih dahulu untuk melihat statistik.
                </p>
              </div>
            ) : (
              <>
                {/* Top stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatMiniCard
                    icon={Layers}
                    label="Total RPS"
                    value={String(stats.total)}
                    color="text-primary"
                  />
                  <StatMiniCard
                    icon={TrendingUp}
                    label="Total SKS"
                    value={String(stats.totalSks)}
                    color="text-emerald-600 dark:text-emerald-400"
                  />
                  <StatMiniCard
                    icon={GraduationCap}
                    label="Program Studi"
                    value={String(stats.prodiCount)}
                    color="text-amber-600 dark:text-amber-400"
                  />
                  <StatMiniCard
                    icon={Calendar}
                    label="Baru (7 hari)"
                    value={String(stats.recentCount)}
                    color="text-sky-600 dark:text-sky-400"
                  />
                </div>

                {/* Charts grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Bobot validity pie */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Validitas Bobot
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={bobotPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {bobotPieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid hsl(var(--border))",
                                fontSize: "12px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-xs">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: BOBOT_COLORS.valid }}
                          />
                          Valid ({stats.bobotStat.valid})
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: BOBOT_COLORS.invalid }}
                          />
                          Invalid ({stats.bobotStat.invalid})
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bobot distribution bar */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Distribusi Bobot per RPS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.bobotDist}
                            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                              opacity={0.3}
                            />
                            <XAxis
                              dataKey="mataKuliah"
                              tick={{ fontSize: 9 }}
                              interval={0}
                              angle={-25}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              tick={{ fontSize: 10 }}
                              domain={[0, "auto"]}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid hsl(var(--border))",
                                fontSize: "12px",
                              }}
                              formatter={(v: number) => [`${v}%`, "Bobot"]}
                            />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                              {stats.bobotDist.map((entry, i) => (
                                <Cell
                                  key={i}
                                  fill={
                                    entry.valid
                                      ? BOBOT_COLORS.valid
                                      : BOBOT_COLORS.invalid
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* By Program Studi */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" />
                        RPS per Program Studi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.byProdi}
                            layout="vertical"
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                              opacity={0.3}
                              horizontal={false}
                            />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis
                              type="category"
                              dataKey="programStudi"
                              tick={{ fontSize: 9 }}
                              width={100}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid hsl(var(--border))",
                                fontSize: "12px",
                              }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                              {stats.byProdi.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={
                                    PRODI_COLORS[i % PRODI_COLORS.length]
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* By Semester */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        RPS per Semester
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.bySemester}
                            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                              opacity={0.3}
                            />
                            <XAxis
                              dataKey="semester"
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid hsl(var(--border))",
                                fontSize: "12px",
                              }}
                            />
                            <Bar
                              dataKey="count"
                              fill="#10b981"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Prodi detail table */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                      Detail per Program Studi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="divide-y divide-border/40">
                      {stats.byProdi.map((p, i) => (
                        <div
                          key={p.programStudi}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{
                              background: PRODI_COLORS[i % PRODI_COLORS.length],
                            }}
                          />
                          <span className="text-sm font-medium flex-1 truncate">
                            {p.programStudi}
                          </span>
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {p.count} RPS
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {p.totalSks} SKS
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function StatMiniCard({
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
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-md bg-background ${color}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold leading-tight">{value}</p>
    </div>
  );
}
