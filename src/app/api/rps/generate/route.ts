import { NextRequest, NextResponse } from "next/server";
import { buildMasterPrompt, RPSFormInput, TemplateId } from "@/lib/rps-template";
import { generateFallbackRPS } from "@/lib/rps-generator-fallback";

export const dynamic = "force-dynamic";

export interface CustomLLMConfig {
  provider?: "openai" | "anthropic" | "openrouter" | "dahl" | "custom" | "puter" | "standalone";
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

interface GenerateBody extends RPSFormInput {
  templateId?: TemplateId;
  llmConfig?: CustomLLMConfig;
  curriculumContext?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

async function fetchAICompletion(
  systemPrompt: string,
  userPrompt: string,
  config?: CustomLLMConfig
): Promise<string> {
  const provider = config?.provider || "openai";
  const rawApiKey = (config?.apiKey?.trim() || process.env.DAHL_API_KEY || process.env.DAHL_APIKEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();

  if (provider === "standalone" || provider === "puter" || (!rawApiKey && provider !== "custom")) {
    throw new Error("NO_API_KEY");
  }

  // Support multiple API keys separated by comma or newline for key rotation
  const apiKeys = rawApiKey.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);

  if (provider === "anthropic") {
    const baseUrl = (config?.baseUrl?.trim() || process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
    const model = config?.model?.trim() || process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
    const url = baseUrl.endsWith("/v1") ? `${baseUrl}/messages` : `${baseUrl}/v1/messages`;

    let lastError: Error | null = null;
    for (const key of apiKeys) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model,
            max_tokens: 8192,
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
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    throw lastError || new Error("Semua API key Anthropic gagal.");
  } else {
    // OpenAI / Dahl Global / OpenRouter / Custom
    let baseUrl = (
      config?.baseUrl?.trim() ||
      (provider === "dahl" ? process.env.DAHL_BASE_URL || "https://inference.dahl.global/v1" : undefined) ||
      process.env.OPENAI_BASE_URL ||
      (provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1")
    ).replace(/\/$/, "");

    if (!baseUrl.endsWith("/v1") && !baseUrl.includes("openrouter.ai") && provider === "openai") {
      baseUrl = `${baseUrl}/v1`;
    }

    const model =
      config?.model?.trim() ||
      (provider === "dahl" ? "MiniMaxAI/MiniMax-M2.7" : undefined) ||
      process.env.AI_MODEL ||
      (provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini");

    let lastError: Error | null = null;

    for (const key of apiKeys) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
            temperature: 0.3,
            max_tokens: 8192,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`AI API Error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? "";
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    throw lastError || new Error("Semua API key LLM gagal.");
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

    const prompt = buildMasterPrompt(body, templateId, body.curriculumContext);

    const config: CustomLLMConfig = body.llmConfig || {
      provider: (req.headers.get("x-llm-provider") as any) || undefined,
      apiKey: req.headers.get("x-llm-api-key") || undefined,
      baseUrl: req.headers.get("x-llm-base-url") || undefined,
      model: req.headers.get("x-llm-model") || undefined,
    };

    const provider = config.provider || "openai";
    const apiKey = (config.apiKey || process.env.DAHL_API_KEY || process.env.DAHL_APIKEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();

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
      "Anda adalah Pakar Kurikulum Perguruan Tinggi dan Ahli Instructional Design yang menguasai penyusunan RPS berbasis OBE (Outcome-Based Education) dan SN-DIKTI Indonesia. Anda HANYA boleh mengembalikan JSON murni tanpa teks tambahan, tanpa markdown code fence, tanpa penjelasan apa pun. Mulai langsung dengan { dan akhiri dengan }.";

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
  let trimmed = text.trim();

  // 1. Strip reasoning blocks <think>...</think> from models like DeepSeek, MiniMax, Kimi
  trimmed = trimmed.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 2. Extract content inside markdown code fence
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    trimmed = fenceMatch[1].trim();
  }

  // 3. Find boundaries between first { and last }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  } else if (firstBrace !== -1) {
    // Attempt auto-repair for truncated JSON missing closing braces
    const sliced = trimmed.slice(firstBrace);
    const openCount = (sliced.match(/\{/g) || []).length;
    const closeCount = (sliced.match(/\}/g) || []).length;
    const missing = Math.max(0, openCount - closeCount);
    return sliced + "}".repeat(missing);
  }

  return trimmed;
}

