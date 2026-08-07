import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/rps/[id]/duplicate
 * Creates a copy of an existing RPS record with "(Salinan)" suffix.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const original = await db.rPS.findUnique({ where: { id } });

    if (!original) {
      return NextResponse.json(
        { error: "RPS tidak ditemukan." },
        { status: 404 }
      );
    }

    const copy = await db.rPS.create({
      data: {
        mataKuliah: `${original.mataKuliah} (Salinan)`,
        sks: original.sks,
        semester: original.semester,
        programStudi: original.programStudi,
        deskripsi: original.deskripsi,
        promptText: original.promptText,
        jsonData: original.jsonData,
      },
    });

    return NextResponse.json(
      { success: true, data: copy },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/rps/[id]/duplicate] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Gagal menduplikasi RPS.", detail: message },
      { status: 500 }
    );
  }
}
