import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface SearchResult {
  id: string;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  createdAt: string;
  matches: Array<{ field: string; snippet: string }>;
  totalMatches: number;
}

const SEARCHABLE_FIELDS: Array<{ key: string; label: string }> = [
  { key: "CPL_PRODI", label: "CPL" },
  { key: "CPMK", label: "CPMK" },
  { key: "DESKRIPSI", label: "Deskripsi" },
  { key: "MATERI_POKOK", label: "Materi Pokok" },
  { key: "REFERENSI_UTAMA", label: "Referensi Utama" },
  { key: "REFERENSI_PENDUKUNG", label: "Referensi Pendukung" },
  { key: "INTEGRASI_RISPKM", label: "Integrasi RISPKM" },
  { key: "RANCANGAN_TUGAS", label: "Rancangan Tugas" },
  { key: "RUBRIK_PENILAIAN", label: "Rubrik Penilaian" },
  { key: "MEDIA_LUNAK", label: "Media Lunak" },
  { key: "MEDIA_KERAS", label: "Media Keras" },
  { key: "MK_SYARAT", label: "MK Syarat" },
];

/**
 * GET /api/rps/search?q=<query>
 * Global search across all RPS content (CPL, CPMK, materi, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (q.length < 2) {
      return NextResponse.json(
        { error: "Query minimal 2 karakter." },
        { status: 400 }
      );
    }

    const items = await db.rPS.findMany({
      orderBy: { createdAt: "desc" },
    });

    const queryLower = q.toLowerCase();
    const results: SearchResult[] = [];

    for (const item of items) {
      const matches: Array<{ field: string; snippet: string }> = [];

      // Search metadata fields
      if (item.mataKuliah.toLowerCase().includes(queryLower)) {
        matches.push({
          field: "Mata Kuliah",
          snippet: makeSnippet(item.mataKuliah, q),
        });
      }
      if (item.programStudi.toLowerCase().includes(queryLower)) {
        matches.push({
          field: "Program Studi",
          snippet: makeSnippet(item.programStudi, q),
        });
      }
      if (item.deskripsi && item.deskripsi.toLowerCase().includes(queryLower)) {
        matches.push({
          field: "Deskripsi",
          snippet: makeSnippet(item.deskripsi, q),
        });
      }

      // Search JSON fields
      try {
        const data = JSON.parse(item.jsonData) as Record<string, unknown>;
        for (const { key, label } of SEARCHABLE_FIELDS) {
          const val = String(data[key] || "");
          if (val.toLowerCase().includes(queryLower)) {
            matches.push({
              field: label,
              snippet: makeSnippet(val, q),
            });
          }
        }

        // Search weekly fields M1-M16
        for (let w = 1; w <= 16; w++) {
          for (const f of [
            "KEMAMPUAN",
            "MATERI",
            "INDIKATOR",
            "METODE",
            "MEDIA",
          ]) {
            const val = String(data[`M${w}_${f}`] || "");
            if (val.toLowerCase().includes(queryLower)) {
              matches.push({
                field: `M${w} ${f}`,
                snippet: makeSnippet(val, q),
              });
            }
          }
        }
      } catch {
        // skip unparseable
      }

      if (matches.length > 0) {
        results.push({
          id: item.id,
          mataKuliah: item.mataKuliah,
          sks: item.sks,
          semester: item.semester,
          programStudi: item.programStudi,
          createdAt: item.createdAt,
          matches,
          totalMatches: matches.length,
        });
      }
    }

    return NextResponse.json({
      success: true,
      query: q,
      results,
      total: results.length,
    });
  } catch (err) {
    console.error("[/api/rps/search] error:", err);
    return NextResponse.json(
      { error: "Gagal melakukan pencarian." },
      { status: 500 }
    );
  }
}

function makeSnippet(text: string, query: string, radius = 60): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return prefix + text.slice(start, end) + suffix;
}
