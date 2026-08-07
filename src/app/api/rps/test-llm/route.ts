import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface LLMConfigPayload {
  provider: "openai" | "anthropic" | "openrouter" | "dahl" | "custom" | "standalone";
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * POST /api/rps/test-llm
 * Tests LLM API key and connection for OpenAI, Anthropic, OpenRouter, or custom endpoints.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LLMConfigPayload;

    if (body.provider === "standalone") {
      return NextResponse.json({
        success: true,
        message: "Mode Mandiri aktif. Tidak memerlukan API token eksternal.",
        provider: "standalone",
        latencyMs: 0,
      });
    }

    const apiKey = body.apiKey?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Token/Key wajib diisi." },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    if (body.provider === "anthropic") {
      const baseUrl = (body.baseUrl?.trim() || "https://api.anthropic.com").replace(/\/$/, "");
      const model = body.model?.trim() || "claude-3-5-haiku-20241022";
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
          max_tokens: 10,
          messages: [{ role: "user", content: "Ping" }],
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { error: `Anthropic API Error (${res.status}): ${errText}` },
          { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
        );
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || "OK";

      return NextResponse.json({
        success: true,
        message: `Koneksi ke Anthropic (${model}) berhasil!`,
        reply,
        latencyMs,
        provider: "anthropic",
      });
    } else {
      // OpenAI / OpenRouter / Custom OpenAI-compatible
      let baseUrl = (body.baseUrl?.trim() || (body.provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1")).replace(/\/$/, "");
      if (!baseUrl.endsWith("/v1") && !baseUrl.includes("openrouter.ai") && body.provider === "openai") {
        baseUrl = `${baseUrl}/v1`;
      }
      const model = body.model?.trim() || (body.provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      if (body.provider === "openrouter") {
        headers["HTTP-Referer"] = "https://smartrps-builder.local";
        headers["X-Title"] = "SmartRPS Builder";
      }

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 10,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { error: `LLM API Error (${res.status}): ${errText}` },
          { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
        );
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "OK";

      return NextResponse.json({
        success: true,
        message: `Koneksi ke ${body.provider.toUpperCase()} (${model}) berhasil!`,
        reply,
        latencyMs,
        provider: body.provider,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghubungkan ke server LLM.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
