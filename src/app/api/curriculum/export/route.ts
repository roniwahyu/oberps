import { NextRequest, NextResponse } from "next/server";
import { generateCurriculumExcelBuffer } from "@/lib/curriculum/excel-generator";
import { SAMPLE_CURRICULUM_DATA } from "@/lib/curriculum/sample-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/curriculum/export
 * Export default sample curriculum data as a 13-sheet Excel file (.xlsx)
 */
export async function GET(req: NextRequest) {
  try {
    const buffer = generateCurriculumExcelBuffer(SAMPLE_CURRICULUM_DATA);
    const filename = `Implementasi_Modul_OBE_${SAMPLE_CURRICULUM_DATA.prodi.replace(/\s+/g, "_")}_2025.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[/api/curriculum/export GET] error:", err);
    return NextResponse.json(
      { error: "Gagal mengekspor file Excel kurikulum." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/curriculum/export
 * Export custom payload curriculum data as a 13-sheet Excel file (.xlsx)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const buffer = generateCurriculumExcelBuffer(body);
    const prodiName = body.prodi || "Kurikulum_OBE";
    const filename = `Implementasi_Modul_OBE_${String(prodiName).replace(/\s+/g, "_")}_2025.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[/api/curriculum/export POST] error:", err);
    return NextResponse.json(
      { error: "Gagal mengekspor file Excel kurikulum." },
      { status: 500 }
    );
  }
}
