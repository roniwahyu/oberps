/**
 * Types & Interfaces for Curriculum OBE Module (Plug & Play, API-Driven)
 * Supports full 13-Sheet Excel Structure (Implementasi_Modul_OBE*.xlsx)
 */

export interface ProfilLulusan {
  kodePL: string;
  namaProfil: string;
  deskripsi: string;
  sumber: string;
}

export interface CPLItem {
  kodeCPL: string;
  pernyataan: string;
  kategori: "Sikap" | "Pengetahuan" | "Keterampilan Umum" | "Keterampilan Khusus";
}

export interface PLCPLMapping {
  kodePL: string;
  kodeCPL: string;
  isMapped: boolean;
}

export interface MataKuliahCurriculum {
  kodeMK: string;
  namaMK: string;
  sks: number;
  sksTeori: number;
  sksPraktikum: number;
  semester: number;
  kategori: string;
}

export interface PetaPemenuhanCPL {
  kodeMK: string;
  namaMK: string;
  sks: number;
  semester: number;
  mapping: Record<string, "I" | "R" | "M" | "">; // e.g. { CPL01: 'I', CPL02: 'R', CPL03: 'M' }
}

export interface CPMKSubCPMKRelation {
  kodeMK: string;
  namaMK: string;
  plUtama: string;
  cpmkKode: string;
  cpmkRumusan: string;
  subCpmkKode: string;
  subCpmkRumusan: string;
  kodeCPL: string;
  metodeEvaluasi: string;
}

export interface EvaluasiNilaiMahasiswa {
  no: number;
  nim: string;
  nama: string;
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
  aktivitas: number;
  project: number;
}

export interface EvaluasiOBEMK {
  kodeMK: string;
  namaMK: string;
  cplDibebankan: string[];
  bobot: {
    tugas: number;
    kuis: number;
    uts: number;
    uas: number;
    aktivitas: number;
    project: number;
  };
  mahasiswa: EvaluasiNilaiMahasiswa[];
}

export interface RekapitulasiCPLProdi {
  kodeCPL: string;
  fokusCPL: string;
  jumlahMKPendukung: number;
  mkPengukurLevelM: string;
  targetPercent: number;
  capaianAktualPercent?: number;
  status: string;
}

export interface CurriculumOBEModuleData {
  prodi: string;
  universitas: string;
  tahun: string;
  profilLulusan: ProfilLulusan[];
  cpl: CPLItem[];
  plCplMatrix: PLCPLMapping[];
  mataKuliah: MataKuliahCurriculum[];
  petaCPL: PetaPemenuhanCPL[];
  cpmkSubCpmk: CPMKSubCPMKRelation[];
  evaluasiMKList: EvaluasiOBEMK[];
  rekapitulasiCPL: RekapitulasiCPLProdi[];
}
