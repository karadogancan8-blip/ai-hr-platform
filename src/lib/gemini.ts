import { createGoogleGenerativeAI, google as googleProvider } from "@ai-sdk/google";

const DEFAULT_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"] as const;

const RETRYABLE =
  /not found|NOT_FOUND|404|deprecated|no longer available|high demand|overloaded|unavailable|RESOURCE_EXHAUSTED|429|quota/i;

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
  const configured = process.env.GEMINI_MODEL?.trim();
  if (!configured) return "gemini-2.0-flash";
  if (configured === "gemini-2.5-flash" || configured === "gemini-2.5-flash-lite" || configured === "gemini-flash-latest") {
    return "gemini-2.0-flash";
  }
  if (configured === "gemini-1.5-flash-latest") return "gemini-1.5-flash";
  return configured;
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

/** `google('gemini-2.0-flash')`; yoksa `google('gemini-1.5-flash')` kullanılır. */
export function gemini(modelId = geminiModelId()) {
  return googleClient()(modelId);
}

export function geminiFallbackIds() {
  return [...new Set([geminiModelId(), ...DEFAULT_MODELS])];
}

export async function withGeminiModel<T>(run: (model: ReturnType<typeof googleProvider>) => Promise<T>) {
  let lastError: unknown;
  for (const modelId of geminiFallbackIds()) {
    try {
      return await run(gemini(modelId));
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!RETRYABLE.test(message)) throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Gemini modeli yanıt vermedi.");
}
