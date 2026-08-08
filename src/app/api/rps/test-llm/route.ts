import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface LLMConfigPayload {
  provider: "openai" | "anthropic" | "openrouter" | "dahl" | "custom" | "puter" | "standalone";
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface TestLogDetails {
  timestamp: string;
  provider: string;
  url: string;
  model: string;
  status: number;
  statusText: string;
  latencyMs: number;
  requestHeaders: Record<string, string>;
  requestBody: Record<string, unknown>;
  responseBody: unknown;
  replyText?: string;
}

/**
 * POST /api/rps/test-llm
 * Tests LLM API key and connection with full diagnostic log output.
 */
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  try {
    const body = (await req.json()) as LLMConfigPayload;
    const provider = body.provider || "standalone";

    if (provider === "standalone") {
      const logDetails: TestLogDetails = {
        timestamp,
        provider: "standalone",
        url: "internal://rps-generator-fallback",
        model: "Internal Offline Generator",
        status: 200,
        statusText: "OK",
        latencyMs: 0,
        requestHeaders: { "x-mode": "standalone-offline" },
        requestBody: { note: "Menggunakan engine pembangun RPS OBE internal tanpa API token" },
        responseBody: { status: "ready", message: "Mode Mandiri Siap Digunakan" },
        replyText: "Engine internal aktif & siap.",
      };

      return NextResponse.json({
        success: true,
        message: "Mode Mandiri Aktif — Siap digunakan tanpa API Token eksternal.",
        provider: "standalone",
        latencyMs: 0,
        logDetails,
      });
    }

    const apiKey = body.apiKey?.trim();
    if (!apiKey) {
      const logDetails: TestLogDetails = {
        timestamp,
        provider,
        url: "-",
        model: body.model || "unspecified",
        status: 400,
        statusText: "Bad Request",
        latencyMs: 0,
        requestHeaders: {},
        requestBody: {},
        responseBody: { error: "API Token/Secret Key belum diisi oleh pengguna." },
      };

      return NextResponse.json(
        {
          error: "API Token / Secret Key wajib diisi.",
          logDetails,
        },
        { status: 400 }
      );
    }

    const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "***";
    const startTime = Date.now();

    if (provider === "anthropic") {
      const baseUrl = (body.baseUrl?.trim() || "https://api.anthropic.com").replace(/\/$/, "");
      const model = body.model?.trim() || "claude-3-5-haiku-20241022";
      const targetUrl = baseUrl.endsWith("/v1") ? `${baseUrl}/messages` : `${baseUrl}/v1/messages`;

      const requestHeaders = {
        "x-api-key": maskedKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      };

      const requestBody = {
        model,
        max_tokens: 15,
        messages: [{ role: "user", content: "Ping" }],
      };

      const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const latencyMs = Date.now() - startTime;
      const resText = await res.text();
      let resJson: unknown = resText;
      try {
        resJson = JSON.parse(resText);
      } catch {}

      const logDetails: TestLogDetails = {
        timestamp,
        provider,
        url: targetUrl,
        model,
        status: res.status,
        statusText: res.statusText || (res.ok ? "OK" : "Error"),
        latencyMs,
        requestHeaders,
        requestBody,
        responseBody: resJson,
      };

      if (!res.ok) {
        return NextResponse.json(
          {
            error: `Anthropic API Status HTTP ${res.status}: ${resText}`,
            logDetails,
          },
          { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
        );
      }

      const reply = (resJson as any)?.content?.[0]?.text || "OK";
      logDetails.replyText = reply;

      return NextResponse.json({
        success: true,
        message: `Koneksi ke Anthropic Claude (${model}) Terhubung & Siap!`,
        reply,
        latencyMs,
        provider: "anthropic",
        logDetails,
      });
    } else {
      // OpenAI / OpenRouter / Dahl Global / Custom OpenAI-Compatible
      let baseUrl = body.baseUrl?.trim();
      if (!baseUrl) {
        if (provider === "openrouter") baseUrl = "https://openrouter.ai/api/v1";
        else if (provider === "dahl") baseUrl = "https://inference.dahl.global/v1";
        else baseUrl = "https://api.openai.com/v1";
      }
      baseUrl = baseUrl.replace(/\/$/, "");

      if (!baseUrl.endsWith("/v1") && !baseUrl.includes("openrouter.ai") && provider === "openai") {
        baseUrl = `${baseUrl}/v1`;
      }

      const targetUrl = `${baseUrl}/chat/completions`;
      let model = body.model?.trim();
      if (!model) {
        if (provider === "openrouter") model = "openai/gpt-4o-mini";
        else if (provider === "dahl") model = "moonshotai/Kimi-K2.6";
        else model = "gpt-4o-mini";
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      if (provider === "openrouter") {
        headers["HTTP-Referer"] = "https://smartrps-builder.local";
        headers["X-Title"] = "SmartRPS Builder";
      }

      const sanitizedHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${maskedKey}`,
      };

      const requestBody = {
        model,
        messages: [{ role: "user", content: "Ping" }],
        max_tokens: 15,
      };

      const res = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      const latencyMs = Date.now() - startTime;
      const resText = await res.text();
      let resJson: unknown = resText;
      try {
        resJson = JSON.parse(resText);
      } catch {}

      const logDetails: TestLogDetails = {
        timestamp,
        provider,
        url: targetUrl,
        model,
        status: res.status,
        statusText: res.statusText || (res.ok ? "OK" : "Error"),
        latencyMs,
        requestHeaders: sanitizedHeaders,
        requestBody,
        responseBody: resJson,
      };

      if (!res.ok) {
        return NextResponse.json(
          {
            error: `LLM API Endpoint Status HTTP ${res.status}: ${typeof resJson === "object" && resJson ? JSON.stringify(resJson) : resText}`,
            logDetails,
          },
          { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
        );
      }

      const reply = (resJson as any)?.choices?.[0]?.message?.content || "OK";
      logDetails.replyText = reply;

      return NextResponse.json({
        success: true,
        message: `Koneksi LLM (${provider.toUpperCase()} - ${model}) Terhubung & Siap!`,
        reply,
        latencyMs,
        provider,
        logDetails,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghubungkan ke server LLM.";
    const logDetails: TestLogDetails = {
      timestamp,
      provider: "unknown",
      url: "-",
      model: "-",
      status: 500,
      statusText: "Internal Server Error / Network Exception",
      latencyMs: 0,
      requestHeaders: {},
      requestBody: {},
      responseBody: { error: message },
    };

    return NextResponse.json(
      { error: message, logDetails },
      { status: 500 }
    );
  }
}
