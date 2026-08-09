import { NextResponse } from "next/server";
import { SAMPLE_CURRICULUM_DATA } from "@/lib/curriculum/sample-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/curriculum/data
 * Returns default sample curriculum JSON data
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: SAMPLE_CURRICULUM_DATA,
  });
}
