import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface LibraryEntry {
  sourceId: string;
  sourceMataKuliah: string;
  sourceProgramStudi: string;
  cplText: string;
  cpmkText: string;
}

/**
 * GET /api/rps/library
 * Extracts CPL & CPMK from all saved RPS to build a reusable library.
 * Returns deduplicated entries grouped by mata kuliah.
 */
export async function GET() {
  try {
    const items = await db.rPS.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        mataKuliah: true,
        programStudi: true,
        jsonData: true,
      },
    });

    const library: LibraryEntry[] = [];

    for (const item of items) {
      try {
        const data = JSON.parse(item.jsonData) as Record<string, unknown>;
        const cplText = String(data.CPL_PRODI || "");
        const cpmkText = String(data.CPMK || "");
        if (cplText || cpmkText) {
          library.push({
            sourceId: item.id,
            sourceMataKuliah: item.mataKuliah,
            sourceProgramStudi: item.programStudi,
            cplText,
            cpmkText,
          });
        }
      } catch {
        // skip unparseable
      }
    }

    return NextResponse.json({ success: true, data: library });
  } catch (err) {
    console.error("[/api/rps/library] error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil pustaka CPL/CPMK." },
      { status: 500 }
    );
  }
}
