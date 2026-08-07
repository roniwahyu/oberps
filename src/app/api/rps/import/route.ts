import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ImportPayload {
  mataKuliah?: string;
  sks?: string;
  semester?: string;
  programStudi?: string;
  deskripsi?: string | null;
  jsonData?: unknown;
  promptText?: string;
}

/**
 * POST /api/rps/import
 * Import an RPS from a JSON payload (single RPS or batch array).
 * Accepts either a single object or an array of objects.
 *
 * Body shapes supported:
 *   1. Raw RPS JSON (the jsonData itself) — fields extracted from jsonData.Mata Kuliah info if present
 *   2. { mataKuliah, sks, semester, programStudi, deskripsi, jsonData } — full wrapper
 *   3. Array of either shape above
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const items = Array.isArray(body) ? body : [body];
    if (items.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data untuk diimpor." },
        { status: 400 }
      );
    }

    const created: Array<{ id: string; mataKuliah: string }> = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i] as ImportPayload;
      try {
        // Determine the jsonData: either item.jsonData or item itself if it looks like RPS data
        let jsonDataObj: unknown;
        let wrapper: ImportPayload = item;

        // If item has jsonData field, treat item as wrapper
        if (item.jsonData !== undefined) {
          jsonDataObj = item.jsonData;
        } else {
          // Assume item IS the RPS data (has M1_KEMAMPUAN or CPL_PRODI)
          jsonDataObj = item;
          wrapper = {};
        }

        // Stringify jsonData for storage
        const jsonDataStr =
          typeof jsonDataObj === "string"
            ? jsonDataObj
            : JSON.stringify(jsonDataObj, null, 2);

        // Try to parse jsonData to extract defaults
        let parsedData: Record<string, unknown> | null = null;
        try {
          parsedData =
            typeof jsonDataObj === "string"
              ? (JSON.parse(jsonDataObj) as Record<string, unknown>)
              : (jsonDataObj as Record<string, unknown>);
        } catch {
          // not parseable, that's ok
        }

        // Extract mata kuliah metadata
        const mataKuliah =
          wrapper.mataKuliah ||
          (parsedData?.MATA_KULIAH as string) ||
          (parsedData?.MATAKULIAH as string) ||
          "Mata Kuliah Impor";
        const sks = wrapper.sks || (parsedData?.SKS as string) || "3";
        const semester =
          wrapper.semester || (parsedData?.SEMESTER as string) || "1";
        const programStudi =
          wrapper.programStudi ||
          (parsedData?.PROGRAM_STUDI as string) ||
          (parsedData?.PRODI as string) ||
          "S1 Teknik Informatika";
        const deskripsi =
          wrapper.deskripsi !== undefined
            ? wrapper.deskripsi
            : (parsedData?.DESKRIPSI as string) || null;
        const promptText = wrapper.promptText || "Diimpor dari file JSON";

        if (!mataKuliah || !sks || !semester || !programStudi) {
          throw new Error("Metadata mata kuliah tidak lengkap.");
        }

        const record = await db.rPS.create({
          data: {
            mataKuliah: String(mataKuliah),
            sks: String(sks),
            semester: String(semester),
            programStudi: String(programStudi),
            deskripsi: deskripsi ? String(deskripsi) : null,
            promptText: String(promptText),
            jsonData: jsonDataStr,
          },
        });

        created.push({ id: record.id, mataKuliah: record.mataKuliah });
      } catch (err) {
        errors.push({
          index: i,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        imported: created.length,
        errors,
        data: created,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/rps/import] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Gagal mengimpor RPS.", detail: message },
      { status: 500 }
    );
  }
}
