import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { buildMasterPrompt, RPSFormInput } from "@/lib/rps-template";

/**
 * POST /api/rps/generate
 * Generates an RPS JSON via LLM using the master prompt template.
 * Body: RPSFormInput { mataKuliah, sks, semester, programStudi }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RPSFormInput;

    // Validate input
    if (!body?.mataKuliah || !body?.sks || !body?.semester || !body?.programStudi) {
      return NextResponse.json(
        { error: "Semua field (mataKuliah, sks, semester, programStudi) wajib diisi." },
        { status: 400 }
      );
    }

    const prompt = buildMasterPrompt(body);

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "Anda adalah Pakar Kurikulum Perguruan Tinggi yang ahli dalam penyusunan RPS berbasis OBE (Outcome-Based Education). Anda HANYA boleh mengembalikan JSON murni tanpa teks tambahan, tanpa markdown code fence, tanpa penjelasan apa pun.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      thinking: { type: "disabled" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    if (!rawContent || rawContent.trim().length === 0) {
      return NextResponse.json(
        { error: "Model mengembalikan respons kosong. Silakan coba lagi." },
        { status: 502 }
      );
    }

    // Extract JSON from response (model may sometimes wrap in ```json ... ```)
    const jsonStr = extractJson(rawContent);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        {
          error: "Gagal memparse JSON dari respons model.",
          raw: rawContent,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt,
      data: parsed,
      raw: rawContent,
    });
  } catch (err) {
    console.error("[/api/rps/generate] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memanggil model AI.", detail: message },
      { status: 500 }
    );
  }
}

/**
 * Extract the first JSON object/array from a possibly-markdown-wrapped string.
 */
function extractJson(text: string): string {
  const trimmed = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  // Try to find the first { ... } block
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}
