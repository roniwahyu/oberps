import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/rps
 * List all saved RPS, newest first.
 */
export async function GET() {
  try {
    const items = await db.rPS.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("[/api/rps GET] error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil daftar RPS." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rps
 * Save a new RPS record.
 * Body: { mataKuliah, sks, semester, programStudi, deskripsi?, promptText, jsonData }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (
      !body?.mataKuliah ||
      !body?.sks ||
      !body?.semester ||
      !body?.programStudi ||
      !body?.promptText ||
      !body?.jsonData
    ) {
      return NextResponse.json(
        { error: "Field wajib tidak lengkap." },
        { status: 400 }
      );
    }

    const created = await db.rPS.create({
      data: {
        mataKuliah: String(body.mataKuliah),
        sks: String(body.sks),
        semester: String(body.semester),
        programStudi: String(body.programStudi),
        deskripsi: body.deskripsi ? String(body.deskripsi) : null,
        promptText: String(body.promptText),
        jsonData:
          typeof body.jsonData === "string"
            ? body.jsonData
            : JSON.stringify(body.jsonData, null, 2),
        tags: body.tags ? String(body.tags) : "",
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("[/api/rps POST] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Gagal menyimpan RPS.", detail: message },
      { status: 500 }
    );
  }
}
