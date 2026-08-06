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
