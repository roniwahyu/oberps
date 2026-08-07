import { NextRequest, NextResponse } from "next/server";
import { buildMasterPrompt, RPSFormInput, TemplateId } from "@/lib/rps-template";

export const dynamic = "force-dynamic";
import { generateFallbackRPS } from "@/lib/rps-generator-fallback";

interface GenerateBody extends RPSFormInput {
  templateId?: TemplateId;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

async function fetchAICompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * POST /api/rps/generate
 * Generates an RPS JSON via LLM using the master prompt template.
 * Falls back to offline RPS generator if no LLM API key is configured.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody;

    // Validate input
    if (!body?.mataKuliah || !body?.sks || !body?.semester || !body?.programStudi) {
      return NextResponse.json(
        { error: "Semua field (mataKuliah, sks, semester, programStudi) wajib diisi." },
        { status: 400 }
      );
    }

    const templateId: TemplateId =
      (["standard", "compact", "detailed", "project-based"].includes(
        body.templateId as string
      ) &&
        (body.templateId as TemplateId)) ||
      "standard";

    const prompt = buildMasterPrompt(body, templateId);

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

    // If no API key is set, use standalone internal RPS generator
    if (!apiKey) {
      console.log("[/api/rps/generate] No LLM API Key set, using standalone RPS generator engine.");
      const fallbackData = generateFallbackRPS(body, templateId);
      return NextResponse.json({
        success: true,
        prompt,
        data: fallbackData,
        raw: JSON.stringify(fallbackData, null, 2),
        attempts: 1,
        source: "standalone",
      });
    }

    const systemBase =
      "Anda adalah Pakar Kurikulum Perguruan Tinggi yang ahli dalam penyusunan RPS berbasis OBE (Outcome-Based Education). Anda HANYA boleh mengembalikan JSON murni tanpa teks tambahan, tanpa markdown code fence, tanpa penjelasan apa pun.";

    let lastError: string | null = null;
    let lastRaw: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      // Add an increasingly explicit reminder on retries
      const retryReminder =
        attempt === 1
          ? ""
          : attempt === 2
            ? "\n\nPENTING: Pada percobaan sebelumnya, jawaban Anda bukan JSON valid. Pastikan Anda HANYA mengembalikan JSON yang dapat diparse (dimulai dengan { dan diakhiri dengan })."
            : "\n\nPERCABAIAN TERAKHIR. Jawab HANYA dengan JSON yang valid. Jangan tambahkan teks apapun sebelum atau sesudah JSON. Mulai langsung dengan { dan akhiri dengan }.";

      try {
        const rawContent = await fetchAICompletion(systemBase, prompt + retryReminder);

        if (!rawContent || rawContent.trim().length === 0) {
          lastError = "Model mengembalikan respons kosong.";
          lastRaw = "";
          // continue to retry
        } else {
          const jsonStr = extractJson(rawContent);
          try {
            const parsed = JSON.parse(jsonStr);
            // Success
            return NextResponse.json({
              success: true,
              prompt,
              data: parsed,
              raw: rawContent,
              attempts: attempt,
              source: "llm",
            });
          } catch {
            lastError = "Gagal memparse JSON dari respons model.";
            lastRaw = rawContent;
            // continue to retry
          }
        }
      } catch (callErr) {
        lastError =
          callErr instanceof Error
            ? callErr.message
            : "Error saat memanggil model AI.";
        // continue to retry
      }

      // Wait before retry (except on last attempt)
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    // If external LLM failed after retries, fallback gracefully to internal generator
    console.warn("[/api/rps/generate] LLM failed after retries, falling back to standalone generator engine.");
    const fallbackData = generateFallbackRPS(body, templateId);
    return NextResponse.json({
      success: true,
      prompt,
      data: fallbackData,
      raw: JSON.stringify(fallbackData, null, 2),
      attempts: MAX_RETRIES,
      source: "standalone-fallback",
    });
  } catch (err) {
    console.error("[/api/rps/generate] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses RPS.", detail: message },
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
