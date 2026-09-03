import { createGoogleGenerativeAI, google as googleProvider } from "@ai-sdk/google";

export const GEMINI_MODEL_ID = "gemini-2.5-flash";

const RETRYABLE =
  /not found|NOT_FOUND|404|deprecated|no longer available|high demand|overloaded|unavailable|RESOURCE_EXHAUSTED|429|quota|timeout|ECONNRESET|fetch failed/i;

export function geminiApiKey() {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    ""
  );
}

export function isGeminiConfigured() {
  return Boolean(geminiApiKey());
}

export function geminiModelId() {
  return GEMINI_MODEL_ID;
}

function googleClient() {
  const apiKey = geminiApiKey();
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY tanımlı değil. Ücretsiz Gemini anahtarını Google AI Studio’dan alıp .env.local dosyasına ekleyin.",
    );
  }
  return createGoogleGenerativeAI({ apiKey });
}

/** Sabit model: `google('gemini-2.5-flash')`. */
export function gemini() {
  return googleClient()(GEMINI_MODEL_ID);
}

export function publicGeminiError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (/API_KEY|api key|GOOGLE_GENERATIVE|tanımlı değil/i.test(raw)) {
    return "Gemini API anahtarı eksik veya geçersiz. .env.local dosyasını kontrol edin.";
  }
  if (/429|quota|RESOURCE_EXHAUSTED/i.test(raw)) {
    return "Gemini kotası doldu. Kısa bir süre sonra tekrar deneyin.";
  }
  if (/overloaded|unavailable|high demand|503/i.test(raw)) {
    return "Gemini şu an yoğun. Lütfen birkaç saniye sonra tekrar deneyin.";
  }
  if (/404|not found|NOT_FOUND|unsupported/i.test(raw)) {
    return "Gemini modeli yanıt vermedi. Lütfen tekrar deneyin.";
  }
  if (/timeout|ETIMEDOUT|fetch failed|network/i.test(raw)) {
    return "Gemini bağlantısı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.";
  }
  return "Yapay zeka yanıtı alınamadı. Lütfen tekrar deneyin.";
}

export function toClientError(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : String(error);
  if (/AI_APICallError|google|gemini|generative|NOT_FOUND|RESOURCE_EXHAUSTED/i.test(raw) || RETRYABLE.test(raw)) {
    return publicGeminiError(error);
  }
  if (raw && raw.length < 180 && !raw.includes("{") && !raw.includes("\n")) return raw;
  return fallback;
}

export async function withGeminiModel<T>(run: (model: ReturnType<typeof googleProvider>) => Promise<T>) {
  try {
    return await run(gemini());
  } catch (first) {
    const message = first instanceof Error ? first.message : String(first);
    if (!RETRYABLE.test(message)) {
      throw new Error(publicGeminiError(first));
    }
    try {
      return await run(gemini());
    } catch (second) {
      throw new Error(publicGeminiError(second));
    }
  }
}
