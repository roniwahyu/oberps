/**
 * puter-generator.ts
 * Generates RPS OBE using Puter.js (browser-side free AI via puter.ai.chat).
 * No API key required — users authenticate with their own Puter account.
 * Best model: claude-3-7-sonnet (most capable for structured JSON generation).
 */

export const PUTER_BEST_MODEL = "claude-3-7-sonnet";
export const PUTER_FALLBACK_MODEL = "gpt-4o";

declare global {
  interface Window {
    puter?: {
      ai: {
        chat(
          prompt: string | Array<{ role: string; content: string }>,
          options?: {
            model?: string;
            stream?: boolean;
            max_tokens?: number;
          }
        ): Promise<{
          message?: {
            content: Array<{ text: string }> | string;
          };
          choices?: Array<{ message: { content: string } }>;
          text?: string;
        }>;
      };
    };
  }
}

export function isPuterAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.puter?.ai?.chat === "function";
}

export async function loadPuterScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (isPuterAvailable()) return resolve(true);
    if (typeof document === "undefined") return resolve(false);

    // Check if script already loading
    if (document.getElementById("puter-js-script")) {
      let tries = 0;
      const check = setInterval(() => {
        if (isPuterAvailable()) {
          clearInterval(check);
          resolve(true);
        } else if (++tries > 20) {
          clearInterval(check);
          resolve(false);
        }
      }, 300);
      return;
    }

    const script = document.createElement("script");
    script.id = "puter-js-script";
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.onload = () => {
      let tries = 0;
      const check = setInterval(() => {
        if (isPuterAvailable()) {
          clearInterval(check);
          resolve(true);
        } else if (++tries > 15) {
          clearInterval(check);
          resolve(false);
        }
      }, 300);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export async function generateRPSWithPuter(
  masterPrompt: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  const loaded = await loadPuterScript();
  if (!loaded) {
    throw new Error("Puter.js tidak tersedia atau gagal dimuat. Pastikan peramban terhubung ke internet dan akun Puter aktif.");
  }

  onProgress?.("Menghubungkan ke Puter.js...");

  const puter = window.puter!;

  let rawText = "";
  let usedModel = PUTER_BEST_MODEL;

  try {
    onProgress?.(`Mengirim prompt ke Puter AI (${PUTER_BEST_MODEL})...`);
    const res = await puter.ai.chat(
      [
        {
          role: "system",
          content:
            "Kamu adalah Pakar Kurikulum Pendidikan Tinggi. WAJIB output JSON murni valid tanpa penjelasan apapun.",
        },
        {
          role: "user",
          content: masterPrompt,
        },
      ],
      { model: PUTER_BEST_MODEL, max_tokens: 8192 }
    );

    rawText = extractTextFromPuterResponse(res);
  } catch (err) {
    onProgress?.(`Model ${PUTER_BEST_MODEL} gagal, mencoba ${PUTER_FALLBACK_MODEL}...`);
    usedModel = PUTER_FALLBACK_MODEL;
    try {
      const res = await puter.ai.chat(
        [
          {
            role: "system",
            content:
              "Kamu adalah Pakar Kurikulum Pendidikan Tinggi. WAJIB output JSON murni valid tanpa penjelasan apapun.",
          },
          {
            role: "user",
            content: masterPrompt,
          },
        ],
        { model: PUTER_FALLBACK_MODEL, max_tokens: 8192 }
      );
      rawText = extractTextFromPuterResponse(res);
    } catch (err2) {
      throw new Error(
        `Puter.js gagal dengan model ${PUTER_BEST_MODEL} dan ${PUTER_FALLBACK_MODEL}: ${err2 instanceof Error ? err2.message : "Error tidak diketahui"}`
      );
    }
  }

  onProgress?.(`Respon diterima dari Puter (${usedModel}). Memproses JSON...`);

  if (!rawText || rawText.trim() === "") {
    throw new Error("Puter.js mengembalikan respon kosong.");
  }

  return rawText;
}

function extractTextFromPuterResponse(res: any): string {
  if (typeof res === "string") return res;

  // Anthropic format
  if (res?.message?.content) {
    const c = res.message.content;
    if (Array.isArray(c)) return c.map((b: any) => b.text || "").join("");
    if (typeof c === "string") return c;
  }

  // OpenAI format
  if (res?.choices?.[0]?.message?.content) {
    return res.choices[0].message.content;
  }

  // Simple text
  if (res?.text) return res.text;

  return JSON.stringify(res);
}
