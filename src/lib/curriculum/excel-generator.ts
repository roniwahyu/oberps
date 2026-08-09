import * as XLSX from "xlsx";
import { CurriculumOBEModuleData } from "./types";
import { SAMPLE_CURRICULUM_DATA } from "./sample-data";

/**
 * Modular API-driven Excel Generator for Curriculum OBE Module
 * Produces a clean 13-sheet Excel Workbook matching `Implementasi_Modul_OBE*.xlsx`
 */
export function generateCurriculumExcelBuffer(
  inputData?: Partial<CurriculumOBEModuleData>
): Buffer {
  const data: CurriculumOBEModuleData = {
    ...SAMPLE_CURRICULUM_DATA,
    ...inputData,
  };

  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // Sheet 1: 1. Profil Lulusan
  // -------------------------------------------------------------
  const sheet1Data = [
    ["PROFIL LULUSAN PROGRAM STUDI", data.prodi, data.universitas, data.tahun],
    [],
    ["Kode PL", "Nama Profil Lulusan", "Deskripsi Peran & Kompetensi Utama", "Sumber / Acuan"],
    ...data.profilLulusan.map((p) => [p.kodePL, p.namaProfil, p.deskripsi, p.sumber]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  XLSX.utils.book_append_sheet(wb, ws1, "1. Profil Lulusan");

  // -------------------------------------------------------------
  // Sheet 2: 2. CPL
  // -------------------------------------------------------------
  const sheet2Data = [
    ["CAPAIAN PEMBELAJARAN LULUSAN (CPL) PROGRAM STUDI", data.prodi],
    [],
    ["Kode CPL", "Pernyataan Capaian Pembelajaran Lulusan", "Kategori Keterampilan / Sikap"],
    ...data.cpl.map((c) => [c.kodeCPL, c.pernyataan, c.kategori]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  XLSX.utils.book_append_sheet(wb, ws2, "2. CPL");

  // -------------------------------------------------------------
  // Sheet 3: 3. PL vs CPL
  // -------------------------------------------------------------
  const cplCodes = data.cpl.map((c) => c.kodeCPL);
  const sheet3Header = ["Kode PL", "Nama Profil Lulusan", ...cplCodes];
  const sheet3Rows = data.profilLulusan.map((pl) => {
    const row: (string | number)[] = [pl.kodePL, pl.namaProfil];
    cplCodes.forEach((cCode) => {
      const mapped = data.plCplMatrix.some(
        (m) => m.kodePL === pl.kodePL && m.kodeCPL === cCode && m.isMapped
      );
      row.push(mapped ? "V" : "");
    });
    return row;
  });
  const sheet3Data = [
    ["MATRIKS PEMETAAN PROFIL LULUSAN (PL) VS CPL"],
    [],
    sheet3Header,
    ...sheet3Rows,
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  XLSX.utils.book_append_sheet(wb, ws3, "3. PL vs CPL");

  // -------------------------------------------------------------
  // Sheet 4: 4. Struktur Kurikulum
  // -------------------------------------------------------------
  const sheet4Data = [
    ["STRUKTUR KURIKULUM OBU", data.prodi],
    [],
    ["Kode MK", "Nama Mata Kuliah", "SKS Total", "SKS Teori", "SKS Praktikum", "Semester", "Kategori"],
    ...data.mataKuliah.map((m) => [
      m.kodeMK,
      m.namaMK,
      m.sks,
      m.sksTeori,
      m.sksPraktikum,
      m.semester,
      m.kategori,
    ]),
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
  XLSX.utils.book_append_sheet(wb, ws4, "4. Struktur Kurikulum");

  // -------------------------------------------------------------
  // Sheet 5: 5. BK dan Matriks
  // -------------------------------------------------------------
  const sheet5Data = [
    ["BAHAN KAJIAN (BK) DAN MATRIKS KETERHUBUNGAN CPL"],
    [],
    ["Kode BK", "Bahan Kajian", "Bobot Min (SKS)", "CPL Terkait"],
    ["BK-01", "Dasar-Dasar Algoritma dan Pemrograman", 6, "CPL02, CPL09"],
    ["BK-02", "Rekayasa Perangkat Lunak dan Cloud AI", 9, "CPL01, CPL02, CPL03"],
    ["BK-03", "UI/UX dan Interaksi Manusia Komputer", 6, "CPL04, CPL10"],
    ["BK-04", "IoT dan Komputasi Tertanam Cerdas", 6, "CPL05"],
    ["BK-05", "Audit, Risiko, dan Tata Kelola TI", 6, "CPL07, CPL08"],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(sheet5Data);
  XLSX.utils.book_append_sheet(wb, ws5, "5. BK dan Matriks");

  // -------------------------------------------------------------
  // Sheet 6: 6. Peta Pemenuhan CPL (I/R/M)
  // -------------------------------------------------------------
  const sheet6Header = ["Kode MK", "Nama Mata Kuliah", "SKS", "Semester", ...cplCodes];
  const sheet6Rows = data.petaCPL.map((p) => {
    const row: (string | number)[] = [p.kodeMK, p.namaMK, p.sks, p.semester];
    cplCodes.forEach((cCode) => {
      row.push(p.mapping[cCode] || "");
    });
    return row;
  });
  const sheet6Data = [
    ["PETA PEMENUHAN CPL OLEH MATA KULIAH - LEVEL I/R/M"],
    ["Legenda: I = Introduced, R = Reinforced, M = Mastered"],
    [],
    sheet6Header,
    ...sheet6Rows,
  ];
  const ws6 = XLSX.utils.aoa_to_sheet(sheet6Data);
  XLSX.utils.book_append_sheet(wb, ws6, "6. Peta Pemenuhan CPL");

  // -------------------------------------------------------------
  // Sheet 7: 7. MK-CPMK-SubCPMK-Evaluasi-CPL
  // -------------------------------------------------------------
  const sheet7Data = [
    ["PENURUNAN CPL -> CPMK -> SUB-CPMK -> EVALUASI"],
    [],
    ["Kode MK", "Nama Mata Kuliah", "PL Utama", "CPMK", "Rumusan CPMK", "Sub-CPMK", "Rumusan Sub-CPMK", "CPL", "Metode Evaluasi"],
    ...data.cpmkSubCpmk.map((r) => [
      r.kodeMK,
      r.namaMK,
      r.plUtama,
      r.cpmkKode,
      r.cpmkRumusan,
      r.subCpmkKode,
      r.subCpmkRumusan,
      r.kodeCPL,
      r.metodeEvaluasi,
    ]),
  ];
  const ws7 = XLSX.utils.aoa_to_sheet(sheet7Data);
  XLSX.utils.book_append_sheet(wb, ws7, "7. MK-CPMK-SubCPMK");

  // -------------------------------------------------------------
  // Sheets 8-11: Dynamic Evaluasi MK Sheets
  // -------------------------------------------------------------
  const evalSheets = [
    { code: "AI", title: "8. Evaluasi MK AI", mk: "STI-741 Integrasi Layanan AI" },
    { code: "UIUX", title: "9. Evaluasi MK UIUX", mk: "STI-635 Desain UI/UX" },
    { code: "IoT", title: "10. Evaluasi MK IoT", mk: "STI-526 Internet of Things" },
    { code: "Governance", title: "11. Evaluasi MK TataKelola", mk: "STI-743 Audit TI" },
  ];

  evalSheets.forEach((es, index) => {
    const evalData = data.evaluasiMKList[index] || data.evaluasiMKList[0];
    const sheetRows = [
      [`TEMPLATE EVALUASI OBE - ${es.mk}`],
      [`CPL Dibebankan: ${(evalData.cplDibebankan || []).join(", ")} | Target Ketercapaian Default = 75%`],
      ["Bobot (%)", "100", "", String(evalData.bobot.tugas), String(evalData.bobot.kuis), String(evalData.bobot.uts), String(evalData.bobot.uas), String(evalData.bobot.aktivitas), String(evalData.bobot.project)],
      [],
      ["No", "NIM", "Nama Mahasiswa", "Tugas", "Kuis", "UTS", "UAS", "Aktivitas", "Project"],
      ...evalData.mahasiswa.map((m) => [m.no, m.nim, m.nama, m.tugas, m.kuis, m.uts, m.uas, m.aktivitas, m.project]),
    ];
    const wsEval = XLSX.utils.aoa_to_sheet(sheetRows);
    XLSX.utils.book_append_sheet(wb, wsEval, es.title);
  });

  // -------------------------------------------------------------
  // Sheet 12: 12. Perhitungan CPL
  // -------------------------------------------------------------
  const sheet12Data = [
    ["REKAPITULASI KETERCAPAIAN CPL PROGRAM STUDI"],
    [],
    ["Kode CPL", "Fokus CPL", "Jumlah MK Pendukung", "MK Pengukur Level M", "Target (%)", "Capaian Aktual (%)", "Status"],
    ...data.rekapitulasiCPL.map((r) => [
      r.kodeCPL,
      r.fokusCPL,
      r.jumlahMKPendukung,
      r.mkPengukurLevelM,
      r.targetPercent,
      r.capaianAktualPercent ?? "-",
      r.status,
    ]),
  ];
  const ws12 = XLSX.utils.aoa_to_sheet(sheet12Data);
  XLSX.utils.book_append_sheet(wb, ws12, "12. Perhitungan CPL");

  // -------------------------------------------------------------
  // Sheet 13: 13. Ringkasan
  // -------------------------------------------------------------
  const sheet13Data = [
    ["RINGKASAN IMPLEMENTASI MODUL OBE", data.prodi],
    [],
    ["Indikator", "Nilai", "", "Kode CPL", "Jumlah MK Pendukung"],
    ["Profil Lulusan", data.profilLulusan.length, "", "CPL01", 7],
    ["CPL", data.cpl.length, "", "CPL02", 13],
    ["Mata Kuliah", data.mataKuliah.length, "", "CPL03", 12],
    ["Total SKS", 146, "", "CPL04", 10],
    ["Semester", 8, "", "CPL05", 11],
  ];
  const ws13 = XLSX.utils.aoa_to_sheet(sheet13Data);
  XLSX.utils.book_append_sheet(wb, ws13, "13. Ringkasan");

  // Return binary Excel buffer
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
