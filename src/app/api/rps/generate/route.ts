import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { buildMasterPrompt, RPSFormInput } from "@/lib/rps-template";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

/**
 * POST /api/rps/generate
 * Generates an RPS JSON via LLM using the master prompt template.
 * Body: RPSFormInput { mataKuliah, sks, semester, programStudi }
 *
 * Includes auto-retry logic: if the LLM returns unparseable JSON,
 * the request is retried up to MAX_RETRIES times with an increasingly
 * explicit reminder to output pure JSON.
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
        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: systemBase },
            { role: "user", content: prompt + retryReminder },
          ],
          thinking: { type: "disabled" },
        });

        const rawContent = completion.choices[0]?.message?.content ?? "";

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

    // All retries failed
    return NextResponse.json(
      {
        error:
          lastError ||
          "Gagal generate RPS setelah beberapa percobaan. Silakan coba lagi.",
        raw: lastRaw,
        attempts: MAX_RETRIES,
      },
      { status: 502 }
    );
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
