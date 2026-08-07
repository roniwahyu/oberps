import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/rps/[id]
 * Get a single RPS by id.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.rPS.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "RPS tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    console.error("[/api/rps/[id] GET] error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil RPS." },
      { status: 500 }
    );
  }
}

interface UpdateBody {
  mataKuliah?: string;
  sks?: string;
  semester?: string;
  programStudi?: string;
  deskripsi?: string | null;
  promptText?: string;
  jsonData?: unknown;
  tags?: string;
}

/**
 * PATCH /api/rps/[id]
 * Partially update an RPS record. Only provided fields are updated.
 * Body: any subset of { mataKuliah, sks, semester, programStudi, deskripsi, promptText, jsonData }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.rPS.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "RPS tidak ditemukan." }, { status: 404 });
    }

    const body = (await req.json()) as UpdateBody;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.mataKuliah !== undefined)
      updateData.mataKuliah = String(body.mataKuliah);
    if (body.sks !== undefined) updateData.sks = String(body.sks);
    if (body.semester !== undefined)
      updateData.semester = String(body.semester);
    if (body.programStudi !== undefined)
      updateData.programStudi = String(body.programStudi);
    if (body.deskripsi !== undefined)
      updateData.deskripsi = body.deskripsi ? String(body.deskripsi) : null;
    if (body.promptText !== undefined)
      updateData.promptText = String(body.promptText);
    if (body.jsonData !== undefined) {
      updateData.jsonData =
        typeof body.jsonData === "string"
          ? body.jsonData
          : JSON.stringify(body.jsonData, null, 2);
    }
    if (body.tags !== undefined) {
      updateData.tags = String(body.tags);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada field untuk diperbarui." },
        { status: 400 }
      );
    }

    const updated = await db.rPS.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[/api/rps/[id] PATCH] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Gagal memperbarui RPS.", detail: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rps/[id]
 * Delete a single RPS by id.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.rPS.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "RPS tidak ditemukan." }, { status: 404 });
    }
    await db.rPS.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/rps/[id] DELETE] error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus RPS." },
      { status: 500 }
    );
  }
}
