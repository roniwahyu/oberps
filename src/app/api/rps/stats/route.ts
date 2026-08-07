import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toRpsData, calculateBobot } from "@/lib/rps-parser";

interface ProdiStat {
  programStudi: string;
  count: number;
  totalSks: number;
}

interface BobotStat {
  valid: number;
  invalid: number;
}

interface SemesterStat {
  semester: string;
  count: number;
}

interface BobotDistribution {
  mataKuliah: string;
  total: number;
  valid: boolean;
}

/**
 * GET /api/rps/stats
 * Aggregated statistics for the dashboard.
 */
export async function GET() {
  try {
    const items = await db.rPS.findMany({
      orderBy: { createdAt: "desc" },
    });

    const total = items.length;
    const totalSks = items.reduce(
      (s, it) => s + (parseInt(it.sks, 10) || 0),
      0
    );

    // Program Studi distribution
    const prodiMap = new Map<string, ProdiStat>();
    for (const it of items) {
      const existing = prodiMap.get(it.programStudi) || {
        programStudi: it.programStudi,
        count: 0,
        totalSks: 0,
      };
      existing.count++;
      existing.totalSks += parseInt(it.sks, 10) || 0;
      prodiMap.set(it.programStudi, existing);
    }
    const byProdi = Array.from(prodiMap.values()).sort(
      (a, b) => b.count - a.count
    );

    // Bobot validity
    let valid = 0;
    let invalid = 0;
    const bobotDist: BobotDistribution[] = [];
    for (const it of items) {
      const d = toRpsData(it.jsonData);
      const b = d ? calculateBobot(d) : null;
      if (b) {
        if (b.isValid) valid++;
        else invalid++;
        bobotDist.push({
          mataKuliah: it.mataKuliah,
          total: b.total,
          valid: b.isValid,
        });
      }
    }
    const bobotStat: BobotStat = { valid, invalid };

    // Semester distribution
    const semMap = new Map<string, number>();
    for (const it of items) {
      const key = `Smt ${it.semester}`;
      semMap.set(key, (semMap.get(key) || 0) + 1);
    }
    const bySemester: SemesterStat[] = Array.from(semMap.entries())
      .map(([semester, count]) => ({ semester, count }))
      .sort((a, b) => {
        const na = parseInt(a.semester.replace(/\D/g, ""), 10) || 0;
        const nb = parseInt(b.semester.replace(/\D/g, ""), 10) || 0;
        return na - nb;
      });

    // SKS distribution
    const sksMap = new Map<string, number>();
    for (const it of items) {
      const key = `${it.sks} SKS`;
      sksMap.set(key, (sksMap.get(key) || 0) + 1);
    }
    const bySks = Array.from(sksMap.entries())
      .map(([sks, count]) => ({ sks, count }))
      .sort((a, b) => {
        const na = parseInt(a.sks, 10) || 0;
        const nb = parseInt(b.sks, 10) || 0;
        return na - nb;
      });

    // Recent activity (last 7 days count)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = items.filter(
      (it) => new Date(it.createdAt) >= sevenDaysAgo
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        total,
        totalSks,
        prodiCount: prodiMap.size,
        bobotStat,
        byProdi,
        bySemester,
        bySks,
        bobotDist,
        recentCount,
      },
    });
  } catch (err) {
    console.error("[/api/rps/stats] error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil statistik." },
      { status: 500 }
    );
  }
}
