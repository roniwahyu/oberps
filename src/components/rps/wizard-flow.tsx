"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileSpreadsheet,
  Layers,
  GraduationCap,
  Target,
  BarChart3,
  Calendar,
  FolderGit2,
  FileCheck2,
  Cpu,
  RefreshCw,
  Info,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RPSFormInput, TemplateId } from "@/lib/rps-template";
import { CurriculumUploader, CurriculumContextData } from "./curriculum-uploader";
import { LLMProvider, loadStoredLLMConfig } from "./llm-settings";

// Forbidden abstract verbs according to SN-DIKTI / Bloom Taxonomy
const ABSTRACT_VERBS = [
  "memahami",
  "mengetahui",
  "mengerti",
  "mempelajari",
  "menguasai",
  "menghayati",
];

const SUGGESTED_KKOS = [
  { level: "C3", verb: "mengaplikasikan", desc: "Menerapkan metode/konsep" },
  { level: "C4", verb: "menganalisis", desc: "Memeriksa & memecahkan komponen" },
  { level: "C4", verb: "mengimplementasikan", desc: "Membangun kode/solusi" },
  { level: "C5", verb: "mengevaluasi", desc: "Menilai performa & membandingkan" },
  { level: "C6", verb: "merancang", desc: "Mendesain arsitektur/sistem baru" },
];

export interface WizardFlowData {
  formInput: RPSFormInput;
  templateId: TemplateId;
  selectedCplCodes: string[];
  cpmkList: Array<{ id: string; code: string; cplCode: string; text: string; aspect: string; level: string }>;
  weeklyMatrix: Array<{ week: number; subCpmk: string; materi: string; metode: string; waktu: string; indikator: string; teknik: string; bobot: number }>;
  pjbl: {
    title: string;
    drivingQuestion: string;
    description: string;
    deliverables: string;
  };
  rubrik: Array<{ kriteria: string; bobot: number; sangatBaik: string; baik: string; cukup: string; kurang: string }>;
  curriculumContext?: CurriculumContextData | null;
}

interface WizardFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: WizardFlowData, provider: LLMProvider) => void;
}

export function WizardFlow({ open, onOpenChange, onComplete }: WizardFlowProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [llmConfig] = useState(loadStoredLLMConfig);

  // Step 1: Identitas MK
  const [formInput, setFormInput] = useState<RPSFormInput>({
    mataKuliah: "Struktur Data",
    kodeMK: "STI-207",
    sks: "3",
    sksTeori: "2",
    sksPraktikum: "1",
    semester: "2",
    programStudi: "S1 Sistem dan Teknologi Informasi",
    namaDosen: "Tim Dosen Struktur Data",
  });

  // Step 2: Curriculum Context
  const [curriculumContext, setCurriculumContext] = useState<CurriculumContextData | null>(null);

  // Step 3: CPL Selection
  const [selectedCplCodes, setSelectedCplCodes] = useState<string[]>(["CPL02", "CPL09"]);

  // Step 4 & 5: CPMK & Bloom Taxonomy
  const [cpmkList, setCpmkList] = useState([
    {
      id: "1",
      code: "CPMK-1",
      cplCode: "CPL09",
      text: "Mahasiswa mampu menganalisis karakteristik, operasi, dan kompleksitas Big-O berbagai struktur data linier dan non-linier.",
      aspect: "Pengetahuan",
      level: "C4",
    },
    {
      id: "2",
      code: "CPMK-2",
      cplCode: "CPL02",
      text: "Mahasiswa mampu mengimplementasikan struktur data linier (Array, Linked List, Stack, Queue) dalam bahasa Python.",
      aspect: "Keterampilan Khusus",
      level: "C3",
    },
    {
      id: "3",
      code: "CPMK-3",
      cplCode: "CPL02",
      text: "Mahasiswa mampu mengimplementasikan struktur data non-linier (Tree, Graph) beserta algoritma traversal-nya.",
      aspect: "Keterampilan Khusus",
      level: "C3",
    },
    {
      id: "4",
      code: "CPMK-4",
      cplCode: "CPL09",
      text: "Mahasiswa mampu mengevaluasi dan memilih algoritma sorting dan searching yang paling efisien berdasarkan analisis Big-O.",
      aspect: "Pengetahuan & Keterampilan",
      level: "C5",
    },
  ]);

  // Step 6: Scaffolding 16 Minggu
  const [weeklyWeights, setWeeklyWeights] = useState<number[]>([
    4, 4, 3, 3, 4, 3, 4, 25, 4, 3, 3, 4, 3, 3, 5, 25,
  ]);

  // Step 7: PjBL Design
  const [pjbl, setPjbl] = useState({
    title: "Sistem Simulasi Antrean Layanan Publik Berbasis Struktur Data",
    drivingQuestion: "Bagaimana memilih dan mengimplementasikan struktur data yang paling efisien untuk antrean layanan publik?",
    description: "Mahasiswa mengembangkan program Python yang mensimulasikan antrean layanan rumah sakit menggunakan Queue FIFO, Priority Queue Heap, dan Binary Search.",
    deliverables: "Source code GitHub, Laporan analisis Big-O (10 halaman), Slide presentasi, & Demo running program.",
  });

  // Step 8: Rubrik Analitik 4x4
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(llmConfig.provider || "dahl");

  // Real-time calculation of total weight
  const totalWeight = useMemo(
    () => weeklyWeights.reduce((a, b) => a + b, 0),
    [weeklyWeights]
  );

  // KKO Validation for Step 4
  const abstractVerbWarnings = useMemo(() => {
    const warnings: string[] = [];
    cpmkList.forEach((cpmk) => {
      const lower = cpmk.text.toLowerCase();
      ABSTRACT_VERBS.forEach((verb) => {
        if (lower.includes(verb)) {
          warnings.push(`${cpmk.code} mengandung kata kerja kurang terukur: "${verb}". Disarankan ganti dengan KKO terukur (mis. menganalisis, mengimplementasikan).`);
        }
      });
    });
    return warnings;
  }, [cpmkList]);

  const handleNextStep = () => {
    if (step < 9) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinishWizard = () => {
    const weeklyMatrix = weeklyWeights.map((w, idx) => ({
      week: idx + 1,
      subCpmk: idx + 1 === 8 ? "EVALUASI TENGAH SEMESTER (UTS)" : idx + 1 === 16 ? "EVALUASI AKHIR SEMESTER (UAS)" : `Sub-CPMK Pertemuan ${idx + 1}`,
      materi: `Materi Topik Pembelajaran Pertemuan ${idx + 1}`,
      metode: "Ceramah Interaktif + SCL",
      waktu: "TM: 2x50', PT: 2x60', BM: 2x60'",
      indikator: "Ketepatan analisis & implementasi",
      teknik: idx + 1 === 8 || idx + 1 === 16 ? "Ujian Tulis/Praktikum" : "Praktikum/Tugas",
      bobot: w,
    }));

    const data: WizardFlowData = {
      formInput,
      templateId: "standard",
      selectedCplCodes,
      cpmkList,
      weeklyMatrix,
      pjbl,
      rubrik: [],
      curriculumContext,
    };

    onComplete(data, selectedProvider);
    onOpenChange(false);
    toast({
      title: "Wizard RPS OBE Selesai!",
      description: "Payload RPS 9-Step berhasil disusun & dikirim ke Generator Engine.",
    });
  };

  const stepsList = [
    { num: 1, title: "Identitas MK", icon: GraduationCap },
    { num: 2, title: "Acuan Kurikulum", icon: FileSpreadsheet },
    { num: 3, title: "CPL Dibebankan", icon: Target },
    { num: 4, title: "Formulasi CPMK", icon: BookOpen },
    { num: 5, title: "Taksonomi Bloom", icon: BarChart3 },
    { num: 6, title: "Scaffolding M1-16", icon: Calendar },
    { num: 7, title: "Proyek PjBL", icon: FolderGit2 },
    { num: 8, title: "Rubrik Analitik", icon: FileCheck2 },
    { num: 9, title: "Review & Generate", icon: Wand2 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:w-[96vw] lg:w-[94vw] xl:w-[92vw] max-w-[1600px] max-h-[96vh] sm:max-h-[94vh] lg:max-h-[92vh] overflow-y-auto bg-slate-950 text-slate-100 border-slate-800/80 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-2xl shadow-indigo-950/90 transition-all">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  Wizard RPS OBE 9-Step
                  <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 bg-indigo-500/10">
                    SN-DIKTI Standard
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Panduan langkah demi langkah penyusunan RPS berbasis Outcome-Based Education & Constructive Alignment
                </DialogDescription>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-indigo-400">Langkah {step} dari 9</span>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(step / 9) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Horizontal Stepper Nav */}
          <div className="flex items-center justify-between gap-1 mt-4 overflow-x-auto pb-2 scrollbar-thin">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isActive = s.num === step;
              const isDone = s.num < step;
              return (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : isDone
                      ? "bg-slate-800 text-emerald-400 hover:bg-slate-700"
                      : "bg-slate-900/50 text-slate-500 hover:bg-slate-800"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="whitespace-nowrap">{s.num}. {s.title}</span>
                </button>
              );
            })}
          </div>
        </DialogHeader>

        {/* Step Contents */}
        <div className="py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: Identitas MK */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span>Masukkan identitas mata kuliah secara presisi sesuai kurikulum program studi.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-300">Nama Mata Kuliah *</Label>
                      <Input
                        value={formInput.mataKuliah}
                        onChange={(e) => setFormInput({ ...formInput, mataKuliah: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                        placeholder="Contoh: Struktur Data"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-300">Kode Mata Kuliah</Label>
                      <Input
                        value={formInput.kodeMK || ""}
                        onChange={(e) => setFormInput({ ...formInput, kodeMK: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                        placeholder="Contoh: STI-207"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-300">Bobot SKS Total *</Label>
                      <Input
                        value={formInput.sks}
                        onChange={(e) => setFormInput({ ...formInput, sks: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                        placeholder="3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-300">SKS Teori</Label>
                        <Input
                          value={formInput.sksTeori || ""}
                          onChange={(e) => setFormInput({ ...formInput, sksTeori: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white"
                          placeholder="2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-300">SKS Praktikum</Label>
                        <Input
                          value={formInput.sksPraktikum || ""}
                          onChange={(e) => setFormInput({ ...formInput, sksPraktikum: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white"
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-300">Semester *</Label>
                      <Input
                        value={formInput.semester}
                        onChange={(e) => setFormInput({ ...formInput, semester: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                        placeholder="2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-300">Program Studi *</Label>
                      <Input
                        value={formInput.programStudi}
                        onChange={(e) => setFormInput({ ...formInput, programStudi: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                        placeholder="S1 Sistem dan Teknologi Informasi"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs text-slate-300">Dosen Pengampu / Team Teaching</Label>
                      <Input
                        value={formInput.namaDosen || ""}
                        onChange={(e) => setFormInput({ ...formInput, namaDosen: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                        placeholder="Tim Dosen Struktur Data STI UWG"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Acuan Kurikulum */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-xs">
                    Unggah file Excel kurikulum (<code className="text-amber-300">Implementasi_Modul_OBE*.xlsx</code>) untuk mengekstrak CPL, PL, dan pemetaan CPMK secara otomatis.
                  </div>
                  <CurriculumUploader
                    onCurriculumLoaded={(data) => {
                      setCurriculumContext(data);
                      if (data?.cplList?.length) {
                        setSelectedCplCodes(data.cplList.slice(0, 3).map((c) => c.code));
                      }
                    }}
                  />
                </div>
              )}

              {/* STEP 3: CPL Dibebankan */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-white">Pilih Capaian Pembelajaran Lulusan (CPL) yang Dibebankan:</Label>
                    <Badge variant="outline" className="border-indigo-500/40 text-indigo-300">
                      {selectedCplCodes.length} CPL Terpilih
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                    {(curriculumContext?.cplList || [
                      { code: "CPL01", text: "Mampu menganalisis kebutuhan pengguna dan perancangan solusi sistem informasi." },
                      { code: "CPL02", text: "Mampu merancang, membangun, menguji, dan mengintegrasikan perangkat lunak, basis data, API, dan layanan cloud." },
                      { code: "CPL03", text: "Mampu menerapkan metode komputasi, analitika data, kecerdasan buatan, dan machine learning." },
                      { code: "CPL04", text: "Mampu merancang dan mengevaluasi antarmuka pengguna (UX/UI) dan multimedia interaktif." },
                      { code: "CPL05", text: "Mampu merancang dan mengintegrasikan IoT, jaringan, dan sensor." },
                      { code: "CPL06", text: "Mampu mengelola dan mengintegrasikan data serta pengetahuan lintas platform." },
                      { code: "CPL07", text: "Mampu menerapkan tata kelola, audit, etika, dan keamanan TI." },
                      { code: "CPL08", text: "Mampu merancang dan mengelola proyek inovasi digital & technopreneurship." },
                      { code: "CPL09", text: "Mampu menerapkan matematika, statistika, dan pemikiran komputasional." },
                      { code: "CPL10", text: "Mampu bekerja secara profesional dengan integritas, komunikasi efektif, dan pembelajaran sepanjang hayat." },
                    ]).map((cpl) => {
                      const isSelected = selectedCplCodes.includes(cpl.code);
                      return (
                        <div
                          key={cpl.code}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCplCodes(selectedCplCodes.filter((c) => c !== cpl.code));
                            } else {
                              setSelectedCplCodes([...selectedCplCodes, cpl.code]);
                            }
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/50"
                              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-indigo-400">{cpl.code}</span>
                            {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-3">{cpl.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Formulasi CPMK (Prinsip ABCD & KKO) */}
              {step === 4 && (
                <div className="space-y-4">
                  {abstractVerbWarnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-700/60 text-amber-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Peringatan Kata Kerja Tidak Terukur (SN-DIKTI):</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-2">
                        {abstractVerbWarnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-white">Formulasi CPMK (Prinsip ABCD & KKO Anderson-Krathwohl):</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-indigo-500/40 text-indigo-300 text-xs"
                      onClick={() => {
                        const newId = String(cpmkList.length + 1);
                        setCpmkList([
                          ...cpmkList,
                          {
                            id: newId,
                            code: `CPMK-${newId}`,
                            cplCode: selectedCplCodes[0] || "CPL02",
                            text: "Mahasiswa mampu mengimplementasikan...",
                            aspect: "Keterampilan Khusus",
                            level: "C3",
                          },
                        ]);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Tambah CPMK
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto p-1">
                    {cpmkList.map((cpmk, index) => (
                      <Card key={cpmk.id} className="bg-slate-900/80 border-slate-800 p-3">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-indigo-500 text-indigo-300 font-bold">
                              {cpmk.code}
                            </Badge>
                            <Select
                              value={cpmk.cplCode}
                              onValueChange={(val) => {
                                const next = [...cpmkList];
                                next[index].cplCode = val;
                                setCpmkList(next);
                              }}
                            >
                              <SelectTrigger className="h-7 w-28 text-xs bg-slate-950 border-slate-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 text-white">
                                {selectedCplCodes.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-950 text-emerald-300 border border-emerald-700">
                              Bloom: {cpmk.level}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-rose-400 hover:bg-rose-950/50"
                              onClick={() => setCpmkList(cpmkList.filter((c) => c.id !== cpmk.id))}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={cpmk.text}
                          onChange={(e) => {
                            const next = [...cpmkList];
                            next[index].text = e.target.value;
                            setCpmkList(next);
                          }}
                          className="bg-slate-950 border-slate-800 text-xs text-slate-200 h-16"
                        />
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Taksonomi Bloom */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-xs">
                    Matriks Taksonomi Bloom memetakan setiap CPL ke CPMK beserta aspek pembelajaran (Pengetahuan, Keterampilan Khusus, Sikap) dan level Bloom (C1-C6, A1-A5, P1-P5).
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-900 text-slate-200 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-3 py-2">Kode CPL</th>
                          <th className="px-3 py-2">Kode CPMK & Rumusan</th>
                          <th className="px-3 py-2">Aspek Pembelajaran</th>
                          <th className="px-3 py-2 text-center">Level Bloom</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {cpmkList.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-900/50">
                            <td className="px-3 py-2 font-bold text-indigo-400">{c.cplCode}</td>
                            <td className="px-3 py-2">
                              <span className="font-semibold text-white">{c.code}:</span> {c.text}
                            </td>
                            <td className="px-3 py-2 text-slate-400">{c.aspect}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge className="bg-indigo-900 text-indigo-200 font-bold">{c.level}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 6: Scaffolding M1-M16 */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-slate-300">Total Bobot Evaluasi 16 Minggu:</span>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        {totalWeight}%
                        {totalWeight === 100 ? (
                          <Badge className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs">
                            VALID 100% (SN-DIKTI)
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-950 text-rose-300 border border-rose-700 text-xs">
                            HARUS 100%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-indigo-500/40 text-indigo-300 text-xs"
                      onClick={() =>
                        setWeeklyWeights([
                          4, 4, 3, 3, 4, 3, 4, 25, 4, 3, 3, 4, 3, 3, 5, 25,
                        ])
                      }
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Bobot 100%
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {weeklyWeights.map((w, idx) => {
                      const week = idx + 1;
                      const isEval = week === 8 || week === 16;
                      return (
                        <div
                          key={week}
                          className={`p-2 rounded-lg border text-center ${
                            isEval
                              ? "bg-amber-950/40 border-amber-700/60"
                              : "bg-slate-900 border-slate-800"
                          }`}
                        >
                          <div className="text-[10px] font-bold text-slate-400">
                            {isEval ? (week === 8 ? "M8 (UTS)" : "M16 (UAS)") : `Minggu ${week}`}
                          </div>
                          <Input
                            type="number"
                            value={w}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const next = [...weeklyWeights];
                              next[idx] = val;
                              setWeeklyWeights(next);
                            }}
                            className="h-7 text-center text-xs font-bold bg-slate-950 border-slate-800 mt-1"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 7: Proyek PjBL */}
              {step === 7 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-xs">
                    Rancangan Pembelajaran Berbasis Proyek (PjBL / Case Method) memberikan pengalaman kontekstual mahasiswa dalam memecahkan masalah nyata.
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-300">Judul Proyek Pembelajaran *</Label>
                      <Input
                        value={pjbl.title}
                        onChange={(e) => setPjbl({ ...pjbl, title: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Driving Question (Pertanyaan Pemantik Utama) *</Label>
                      <Input
                        value={pjbl.drivingQuestion}
                        onChange={(e) => setPjbl({ ...pjbl, drivingQuestion: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Deskripsi Proyek & Skenario *</Label>
                      <Textarea
                        value={pjbl.description}
                        onChange={(e) => setPjbl({ ...pjbl, description: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white text-xs h-20 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Bentuk Luaran & Format Penilaian *</Label>
                      <Textarea
                        value={pjbl.deliverables}
                        onChange={(e) => setPjbl({ ...pjbl, deliverables: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white text-xs h-16 mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: Rubrik Analitik */}
              {step === 8 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-xs">
                    Rubrik Analitik 4x4 memberikan deskriptor penilaian yang transparan dan observabel untuk 4 kriteria utama (Analisis, Kode, Dokumentasi, Kolaborasi).
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "Kriteria 1: Ketajaman Analisis Kompleksitas Algoritma (Bobot 30%)", level: "Sangat Baik: Menganalisis Big-O presisi untuk best/average/worst case disertai benchmarking." },
                      { name: "Kriteria 2: Kebenaran & Efisiensi Kode (Bobot 30%)", level: "Sangat Baik: Seluruh operasi berjalan tanpa bug, penanganan pointer null/edge cases sempurna." },
                      { name: "Kriteria 3: Kualitas Dokumentasi & Komunikasi (Bobot 20%)", level: "Sangat Baik: Laporan proyek sangat lengkap, diagram arsitektur jelas, docstring terkonvensi." },
                      { name: "Kriteria 4: Kolaborasi Tim & Problem Solving (Bobot 20%)", level: "Sangat Baik: Kontribusi merata (GitHub commit), inisiatif pemecahan masalah kreatif mandiri." },
                    ].map((k, idx) => (
                      <Card key={idx} className="bg-slate-900 border-slate-800 p-3">
                        <h4 className="text-xs font-bold text-indigo-300 mb-1">{k.name}</h4>
                        <p className="text-[11px] text-slate-400">{k.level}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 9: Review & Generate */}
              {step === 9 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-700/50 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-200">
                      <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                      <h3 className="font-bold text-sm">Review Final RPS OBE & Pilihan Engine Generation</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">MK / SKS</span>
                        <span className="font-bold text-white">{formInput.mataKuliah} ({formInput.sks} SKS)</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">CPL Terpilih</span>
                        <span className="font-bold text-emerald-400">{selectedCplCodes.join(", ")}</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">Jumlah CPMK</span>
                        <span className="font-bold text-indigo-400">{cpmkList.length} CPMK (ABCD)</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">Total Bobot</span>
                        <span className="font-bold text-amber-400">{totalWeight}% (Valid)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-300">Pilih AI Engine Provider:</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "dahl", name: "Dahl Global (MiniMax M2.7)", desc: "Super cepat (~40s), Key rotation otomatis", badge: "Rekomendasi Utama" },
                        { id: "puter", name: "Puter.js (Gratis Browser)", desc: "Claude-3.7 / GPT-4o tanpa API key", badge: "Free Browser AI" },
                        { id: "standalone", name: "Offline Standalone", desc: "Engine internal tanpa jaringan internet", badge: "Internal Engine" },
                      ].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProvider(p.id as LLMProvider)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedProvider === p.id
                              ? "bg-indigo-950/80 border-indigo-500 text-white shadow-lg shadow-indigo-950/50"
                              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-indigo-300">{p.name}</span>
                            {selectedProvider === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mb-2">{p.desc}</p>
                          <Badge variant="outline" className="border-indigo-500/30 text-[10px] text-indigo-400">
                            {p.badge}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="border-t border-slate-800 pt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 1}
            onClick={handlePrevStep}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
          </Button>

          {step < 9 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              Lanjut <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinishWizard}
              className="bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold px-6 shadow-lg shadow-emerald-950/50"
            >
              <Sparkles className="w-4 h-4 mr-2 text-amber-300 animate-spin" /> Generate RPS OBE Final
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
