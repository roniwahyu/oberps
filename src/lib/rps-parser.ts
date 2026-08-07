// Utilities for parsing and analyzing RPS JSON data

export interface RpsData {
  CPL_PRODI?: string;
  CPMK?: string;
  TAKSONOMI?: Array<{
    TAK_KODE?: string;
    TAK_CPMK?: string;
    TAK_ASPEK?: string;
    TAK_LVL?: string;
  }>;
  DESKRIPSI?: string;
  MATERI_POKOK?: string;
  REFERENSI_UTAMA?: string;
  REFERENSI_PENDUKUNG?: string;
  INTEGRASI_RISPKM?: string;
  MEDIA_LUNAK?: string;
  MEDIA_KERAS?: string;
  TEAM_TEACHING?: string;
  MK_SYARAT?: string;
  RANCANGAN_TUGAS?: string;
  RUBRIK_PENILAIAN?: string;
  [key: string]: string | RpsData["TAKSONOMI"] | undefined;
}

export interface ParsedCplItem {
  code: string;
  label: string;
  description: string;
}

export interface ParsedCpmkItem {
  code: string;
  description: string;
}

export interface WeeklyMatrixRow {
  week: number;
  kode: string;
  kemampuan: string;
  materi: string;
  indikator: string;
  teknik: string;
  bobot: string;
  metode: string;
  waktu: string;
  pengalaman: string;
  media: string;
  referensi: string;
  isUts: boolean;
  isUas: boolean;
  isEmpty: boolean;
}

const WEEKLY_FIELDS = [
  "KEMAMPUAN",
  "MATERI",
  "INDIKATOR",
  "TEKNIK",
  "BOBOT",
  "METODE",
  "WAKTU",
  "PENGALAMAN",
  "MEDIA",
  "REFERENSI",
] as const;

/**
 * Parse multi-line text into labeled items.
 * Handles formats like "CPL-1 (Sikap): description" and "M1: description"
 */
export function parseLabeledLines(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Parse CPL_PRODI string into structured items.
 * Format: "CPL-1 (Sikap): description\nCPL-2 (Pengetahuan): description"
 */
export function parseCplProdi(text: string | undefined): ParsedCplItem[] {
  if (!text) return [];
  const lines = parseLabeledLines(text);
  return lines.map((line) => {
    const match = line.match(/^(CPL-\d+)\s*(?:\(([^)]+)\))?\s*:?\s*(.*)$/i);
    if (match) {
      return {
        code: match[1],
        label: match[2] || "",
        description: match[3] || line,
      };
    }
    return { code: "", label: "", description: line };
  });
}

/**
 * Parse CPMK string into structured items.
 * Format: "M1: description\nM2: description"
 */
export function parseCpmk(text: string | undefined): ParsedCpmkItem[] {
  if (!text) return [];
  const lines = parseLabeledLines(text);
  return lines.map((line) => {
    const match = line.match(/^(M\d+)\s*:?\s*(.*)$/i);
    if (match) {
      return { code: match[1], description: match[2] || line };
    }
    return { code: "", description: line };
  });
}

/**
 * Build the weekly matrix (M1-M16) from RPS data.
 */
export function parseWeeklyMatrix(data: RpsData): WeeklyMatrixRow[] {
  const rows: WeeklyMatrixRow[] = [];
  for (let i = 1; i <= 16; i++) {
    const prefix = `M${i}_`;
    const kemampuan = String(data[`${prefix}KEMAMPUAN`] || "");
    const bobot = String(data[`${prefix}BOBOT`] || "");

    const row: WeeklyMatrixRow = {
      week: i,
      kode: `M${i}`,
      kemampuan,
      materi: String(data[`${prefix}MATERI`] || ""),
      indikator: String(data[`${prefix}INDIKATOR`] || ""),
      teknik: String(data[`${prefix}TEKNIK`] || ""),
      bobot,
      metode: String(data[`${prefix}METODE`] || ""),
      waktu: String(data[`${prefix}WAKTU`] || ""),
      pengalaman: String(data[`${prefix}PENGALAMAN`] || ""),
      media: String(data[`${prefix}MEDIA`] || ""),
      referensi: String(data[`${prefix}REFERENSI`] || ""),
      isUts: kemampuan.toUpperCase().includes("UTS") || kemampuan.toUpperCase().includes("TENGAH SEMESTER"),
      isUas: kemampuan.toUpperCase().includes("UAS") || kemampuan.toUpperCase().includes("AKHIR SEMESTER"),
      isEmpty: !kemampuan && !String(data[`${prefix}MATERI`] || ""),
    };
    rows.push(row);
  }
  return rows;
}

/**
 * Calculate total bobot from M1-M16 and check if it equals 100.
 */
export function calculateBobot(data: RpsData): {
  total: number;
  filledWeeks: number;
  isValid: boolean;
  details: Array<{ week: number; bobot: number }>;
} {
  const details: Array<{ week: number; bobot: number }> = [];
  let total = 0;
  let filledWeeks = 0;

  for (let i = 1; i <= 16; i++) {
    const raw = String(data[`M${i}_BOBOT`] || "").trim();
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      total += num;
      filledWeeks++;
      details.push({ week: i, bobot: num });
    } else if (raw !== "") {
      // non-numeric value present
      details.push({ week: i, bobot: 0 });
    }
  }

  return {
    total: Math.round(total * 100) / 100,
    filledWeeks,
    isValid: Math.abs(total - 100) < 0.01,
    details,
  };
}

/**
 * Normalize bobot values so the total equals exactly 100.
 * Proportionally scales each non-zero bobot by (100 / currentTotal).
 * If currentTotal is 0, distributes evenly across filled weeks.
 * Preserves 0 values (empty weeks stay at 0).
 * Preserves UTS (M8) = 25 and UAS (M16) = 25 if they exist.
 */
export function normalizeBobot(data: RpsData): {
  data: RpsData;
  changes: Array<{ week: number; from: number; to: number }>;
  oldTotal: number;
  newTotal: number;
} {
  const result: RpsData = { ...data };
  const changes: Array<{ week: number; from: number; to: number }> = [];

  // Collect current numeric bobot values
  const current: Array<{ week: number; value: number }> = [];
  for (let i = 1; i <= 16; i++) {
    const raw = String(data[`M${i}_BOBOT`] || "").trim();
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      current.push({ week: i, value: num });
    }
  }

  const oldTotal = current.reduce((s, c) => s + c.value, 0);

  if (current.length === 0 || oldTotal === 0) {
    return { data: result, changes, oldTotal: 0, newTotal: 0 };
  }

  const scale = 100 / oldTotal;

  for (const c of current) {
    const newVal = Math.round(c.value * scale * 100) / 100;
    result[`M${c.week}_BOBOT`] = String(newVal);
    if (newVal !== c.value) {
      changes.push({ week: c.week, from: c.value, to: newVal });
    }
  }

  // Fix rounding drift: adjust the largest value to make total exactly 100
  const newTotal = current.reduce(
    (s, c) => s + parseFloat(String(result[`M${c.week}_BOBOT`] || "0")),
    0
  );
  const drift = Math.round((100 - newTotal) * 100) / 100;
  if (Math.abs(drift) >= 0.01 && current.length > 0) {
    // Find the week with the largest bobot
    const largest = current.reduce((max, c) =>
      c.value > max.value ? c : max
    );
    const currentVal = parseFloat(String(result[`M${largest.week}_BOBOT`] || "0"));
    const adjusted = Math.round((currentVal + drift) * 100) / 100;
    result[`M${largest.week}_BOBOT`] = String(adjusted);
    // Update changes
    const existingChange = changes.find((ch) => ch.week === largest.week);
    if (existingChange) {
      existingChange.to = adjusted;
    } else {
      changes.push({ week: largest.week, from: currentVal, to: adjusted });
    }
  }

  const finalTotal = current.reduce(
    (s, c) => s + parseFloat(String(result[`M${c.week}_BOBOT`] || "0")),
    0
  );

  return {
    data: result,
    changes,
    oldTotal: Math.round(oldTotal * 100) / 100,
    newTotal: Math.round(finalTotal * 100) / 100,
  };
}

/**
 * Update a single weekly field in the RPS data (returns a new object).
 */
export function updateWeeklyField(
  data: RpsData,
  week: number,
  field: string,
  value: string
): RpsData {
  const key = `M${week}_${field.toUpperCase()}`;
  return { ...data, [key]: value };
}

/**
 * Parse numbered list text into array of items.
 * Format: "1. item one\n2. item two"
 */
export function parseNumberedList(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Parse rubrik penilaian into grade tiers.
 * Format: "Sangat Baik (80-100): description\nBaik (70-79): description"
 */
export interface RubrikTier {
  label: string;
  range: string;
  description: string;
}

export function parseRubrik(text: string | undefined): RubrikTier[] {
  if (!text) return [];
  const lines = parseLabeledLines(text);
  return lines.map((line) => {
    const match = line.match(/^([^:(]+)\s*(?:\(([^)]+)\))?\s*:?\s*(.*)$/);
    if (match) {
      return {
        label: match[1].trim(),
        range: match[2]?.trim() || "",
        description: match[3].trim() || "",
      };
    }
    return { label: line, range: "", description: "" };
  });
}

/**
 * Safely parse a JSON string into RpsData, or return the object if already parsed.
 */
export function toRpsData(input: string | RpsData | null | undefined): RpsData | null {
  if (!input) return null;
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as RpsData;
    } catch {
      return null;
    }
  }
  return input;
}

export const WEEKLY_DISPLAY_FIELDS: Array<{
  key: (typeof WEEKLY_FIELDS)[number];
  label: string;
}> = [
  { key: "KEMAMPUAN", label: "Sub-CPMK" },
  { key: "MATERI", label: "Materi" },
  { key: "INDIKATOR", label: "Indikator" },
  { key: "TEKNIK", label: "Teknik Penilaian" },
  { key: "BOBOT", label: "Bobot (%)" },
  { key: "METODE", label: "Metode Pembelajaran" },
  { key: "WAKTU", label: "Waktu" },
  { key: "PENGALAMAN", label: "Pengalaman Belajar" },
  { key: "MEDIA", label: "Media" },
  { key: "REFERENSI", label: "Referensi" },
];
