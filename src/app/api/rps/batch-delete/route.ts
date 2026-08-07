import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/rps/batch-delete
 * Delete multiple RPS records by id.
 * Body: { ids: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: unknown = body?.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Field 'ids' wajib berupa array non-empty." },
        { status: 400 }
      );
    }

    // Validate all are strings
    const validIds = ids.filter(
      (id): id is string => typeof id === "string" && id.length > 0
    );

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada id yang valid." },
        { status: 400 }
      );
    }

    const result = await db.rPS.deleteMany({
      where: { id: { in: validIds } },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      requested: validIds.length,
    });
  } catch (err) {
    console.error("[/api/rps/batch-delete] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Gagal menghapus RPS secara batch.", detail: message },
      { status: 500 }
    );
  }
}
