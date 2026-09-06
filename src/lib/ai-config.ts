import { generateText } from "ai";
import { isGeminiConfigured, publicGeminiError, withGeminiModel } from "@/lib/gemini";

/** Canlı ortam AI çağrı zaman aşımı. */
export const AI_TIMEOUT_MS = 15_000;

/** Kısa, üretim odaklı çıktı — yanıt süresi ve maliyet için üst sınır. */
export const AI_MAX_OUTPUT_TOKENS = 1024;

export const AI_MAX_RETRIES = 1;

const ANTHROPIC_MODEL = "claude-3-5-haiku-latest";

export function publicAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
}

export function anthropicApiKey() {
  return process.env.ANTHROPIC_API_KEY?.trim() || "";
}

export function isAnthropicConfigured() {
  return Boolean(anthropicApiKey());
}

export function isAiConfigured() {
  return isGeminiConfigured() || isAnthropicConfigured();
}

function timeoutSignal() {
  return typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(AI_TIMEOUT_MS)
    : undefined;
}

export function aiCallOptions() {
  const abortSignal = timeoutSignal();
  return {
    ...(abortSignal ? { abortSignal } : {}),
    maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
    maxRetries: AI_MAX_RETRIES,
  };
}

export function publicAiError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (/anthropic|claude/i.test(raw)) {
    if (/401|invalid.*key|authentication/i.test(raw)) {
      return "Anthropic API anahtarı geçersiz. ANTHROPIC_API_KEY değerini kontrol edin.";
    }
    return "Yedek dil modeli yanıt vermedi. Lütfen tekrar deneyin.";
  }
  return publicGeminiError(error);
}

export async function withAiFallback<T>(
  run: () => Promise<T>,
  fallback: T | (() => T),
): Promise<{ data: T; fallback: boolean; warning?: string }> {
  try {
    return { data: await run(), fallback: false };
  } catch (error) {
    console.error("[ai] istek başarısız, yedek yanıt kullanılıyor:", error);
    const data = typeof fallback === "function" ? (fallback as () => T)() : fallback;
    return { data, fallback: true, warning: publicAiError(error) };
  }
}

type AiTextInput = {
  system: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
};

function userPromptFromInput(input: AiTextInput) {
  if (input.prompt?.trim()) return input.prompt.trim();
  const last = [...(input.messages ?? [])].reverse().find((item) => item.role === "user");
  return last?.content?.trim() || "";
}

export async function anthropicGenerateText(input: AiTextInput) {
  const apiKey = anthropicApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY tanımlı değil.");
  }

  const messages =
    input.messages && input.messages.length
      ? input.messages
          .filter((item) => item.content.trim())
          .map((item) => ({
            role: item.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: item.content.trim(),
          }))
      : [{ role: "user" as const, content: userPromptFromInput(input) }];

  if (!messages.length) {
    throw new Error("Anthropic isteği boş.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    signal: timeoutSignal(),
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: AI_MAX_OUTPUT_TOKENS,
      system: input.system,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Anthropic ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`);
  }

  const json = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = (json.content ?? [])
    .map((block) => (block.type === "text" || block.text ? block.text ?? "" : ""))
    .join("")
    .trim();

  if (!text) {
    throw new Error("Anthropic boş yanıt döndü.");
  }
  return text;
}

/** Gemini dener; başarısızsa isteğe bağlı Anthropic. Asla yapılandırılmamış çağrıda sessizce boş dönmez. */
export async function generateAiText(input: AiTextInput) {
  let lastError: unknown;

  if (isGeminiConfigured()) {
    try {
      const { text } = await withGeminiModel((model) =>
        generateText({
          model,
          system: input.system,
          ...(input.messages?.length ? { messages: input.messages } : { prompt: input.prompt ?? "" }),
          ...aiCallOptions(),
        }),
      );
      const reply = text?.trim();
      if (reply) return reply;
      lastError = new Error("Gemini boş yanıt döndü.");
    } catch (error) {
      lastError = error;
    }
  }

  if (isAnthropicConfigured()) {
    try {
      return await anthropicGenerateText(input);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Yapay zeka yanıtı alınamadı.");
}
