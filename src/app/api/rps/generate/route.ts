import { NextRequest, NextResponse } from "next/server";
import { buildMasterPrompt, RPSFormInput, TemplateId } from "@/lib/rps-template";
import { generateFallbackRPS } from "@/lib/rps-generator-fallback";

export const dynamic = "force-dynamic";

export interface CustomLLMConfig {
  provider?: "openai" | "anthropic" | "openrouter" | "dahl" | "custom" | "standalone";
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

interface GenerateBody extends RPSFormInput {
  templateId?: TemplateId;
  llmConfig?: CustomLLMConfig;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

async function fetchAICompletion(
  systemPrompt: string,
  userPrompt: string,
  config?: CustomLLMConfig
): Promise<string> {
  const provider = config?.provider || "openai";
  const apiKey = (config?.apiKey?.trim() || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();

  if (provider === "standalone" || (!apiKey && provider !== "custom")) {
    throw new Error("NO_API_KEY");
  }

  if (provider === "anthropic") {
    const baseUrl = (config?.baseUrl?.trim() || process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
    const model = config?.model?.trim() || process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
    const url = baseUrl.endsWith("/v1") ? `${baseUrl}/messages` : `${baseUrl}/v1/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  } else {
    // OpenAI / OpenRouter / Custom
    let baseUrl = (
      config?.baseUrl?.trim() ||
      process.env.OPENAI_BASE_URL ||
      (provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1")
    ).replace(/\/$/, "");

    if (!baseUrl.endsWith("/v1") && !baseUrl.includes("openrouter.ai") && provider === "openai") {
      baseUrl = `${baseUrl}/v1`;
    }

    const model =
      config?.model?.trim() ||
      process.env.AI_MODEL ||
      (provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    if (provider === "openrouter") {
      headers["HTTP-Referer"] = "https://smartrps-builder.local";
      headers["X-Title"] = "SmartRPS Builder";
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
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

    const config: CustomLLMConfig = body.llmConfig || {
      provider: (req.headers.get("x-llm-provider") as any) || undefined,
      apiKey: req.headers.get("x-llm-api-key") || undefined,
      baseUrl: req.headers.get("x-llm-base-url") || undefined,
      model: req.headers.get("x-llm-model") || undefined,
    };

    const provider = config.provider || "openai";
    const apiKey = (config.apiKey || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();

    // If provider is standalone or no API key, use standalone internal RPS generator
    if (provider === "standalone" || !apiKey) {
      console.log("[/api/rps/generate] Using standalone RPS generator engine.");
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
      const retryReminder =
        attempt === 1
          ? ""
          : attempt === 2
            ? "\n\nPENTING: Pada percobaan sebelumnya, jawaban Anda bukan JSON valid. Pastikan Anda HANYA mengembalikan JSON yang dapat diparse (dimulai dengan { dan diakhiri dengan })."
            : "\n\nPERCABAIAN TERAKHIR. Jawab HANYA dengan JSON yang valid. Jangan tambahkan teks apapun sebelum atau sesudah JSON. Mulai langsung dengan { dan akhiri dengan }.";

      try {
        const rawContent = await fetchAICompletion(systemBase, prompt + retryReminder, config);

        if (!rawContent || rawContent.trim().length === 0) {
          lastError = "Model mengembalikan respons kosong.";
          lastRaw = "";
        } else {
          const jsonStr = extractJson(rawContent);
          try {
            const parsed = JSON.parse(jsonStr);
            return NextResponse.json({
              success: true,
              prompt,
              data: parsed,
              raw: rawContent,
              attempts: attempt,
              source: provider,
            });
          } catch {
            lastError = "Gagal memparse JSON dari respons model.";
            lastRaw = rawContent;
          }
        }
      } catch (callErr) {
        lastError = callErr instanceof Error ? callErr.message : "Error saat memanggil model AI.";
      }

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    // Fallback if call failed after retries
    console.warn("[/api/rps/generate] LLM call failed, falling back to standalone generator engine.");
    const fallbackData = generateFallbackRPS(body, templateId);
    return NextResponse.json({
      success: true,
      prompt,
      data: fallbackData,
      raw: JSON.stringify(fallbackData, null, 2),
      attempts: MAX_RETRIES,
      source: "standalone-fallback",
      error: lastError,
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

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}
