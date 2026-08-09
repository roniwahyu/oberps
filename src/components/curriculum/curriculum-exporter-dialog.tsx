"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  BookOpenCheck,
  Layers,
  Award,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_CURRICULUM_DATA } from "@/lib/curriculum/sample-data";

interface CurriculumExporterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CurriculumExporterDialog({
  open,
  onOpenChange,
}: CurriculumExporterDialogProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch("/api/curriculum/export");
      if (!res.ok) throw new Error("Gagal mengekspor file Excel.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Implementasi_Modul_OBE_S1_SISTEKIN_UWG_2025.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const sheetsInfo = [
    { num: 1, name: "1. Profil Lulusan", desc: "6 PL (AI Developer, UI/UX, IoT, Data Engineer, Audit TI, Entrepreneur)" },
    { num: 2, name: "2. CPL", desc: "10 CPL SN-DIKTI (Sikap, Pengetahuan, Keterampilan Umum & Khusus)" },
    { num: 3, name: "3. PL vs CPL", desc: "Matriks pemetaan keterbukaan kontribusi Profil Lulusan vs CPL" },
    { num: 4, name: "4. Struktur Kurikulum", desc: "56 Mata Kuliah, 146 SKS Total, Bobot SKS Teori & Praktikum" },
    { num: 5, name: "5. BK dan Matriks", desc: "Bahan Kajian utama & matriks keterhubungan terhadap CPL prodi" },
    { num: 6, name: "6. Peta Pemenuhan CPL", desc: "Matriks level penguasaan I (Introduced), R (Reinforced), M (Mastered)" },
    { num: 7, name: "7. MK-CPMK-SubCPMK", desc: "Penurunan berantai CPL -> CPMK -> Sub-CPMK -> Instrumen Evaluasi" },
    { num: "8-11", name: "8-11. Evaluasi MK (AI/UIUX/IoT/Audit)", desc: "Template evaluasi nilai mahasiswa (Tugas, Kuis, UTS, UAS, Project)" },
    { num: 12, name: "12. Perhitungan CPL", desc: "Rekapitulasi ketercapaian aktual CPL prodi (Target vs Capaian %)" },
    { num: 13, name: "13. Ringkasan", desc: "Dashboard statistik ringkasan implementasi modul kurikulum OBE" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[1100px] max-h-[92vh] overflow-y-auto bg-slate-950 text-slate-100 border-slate-800/80 p-5 sm:p-6 rounded-2xl shadow-2xl shadow-indigo-950/90">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  Ekspor Modul Kurikulum OBE (13-Sheet Excel)
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-500/10">
                    API-Driven Plug & Play
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-0.5">
                  Menghasilkan berkas spreadsheet resmi 13-sheet sesuai struktur presisi `Implementasi_Modul_OBE*.xlsx`
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Metadata Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <BookOpenCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Program Studi</div>
                <div className="text-xs font-bold text-white">{SAMPLE_CURRICULUM_DATA.prodi}</div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Struktur Data</div>
                <div className="text-xs font-bold text-white">13 Lembar Sheet Terintegrasi</div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Standar Kurikulum</div>
                <div className="text-xs font-bold text-white">SN-DIKTI / LAM-INFOKOM</div>
              </div>
            </div>
          </div>

          {/* Sheets List Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Rincian 13 Lembar Sheet Excel Yang Dihasilkan:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {sheetsInfo.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-2.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                    {s.num}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {s.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
          <div className="text-[11px] text-slate-400">
            Dapat dipanggil via API: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">GET /api/curriculum/export</code>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Tutup
            </Button>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengekspor Excel...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Unduh 13-Sheet Excel (.xlsx)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
