import { generateText } from "ai";
import { NextResponse } from "next/server";
import { parseRequestLocale, replyInLocaleInstruction } from "@/lib/ai-locale";
import { isGeminiConfigured, withGeminiModel } from "@/lib/gemini";
import type { Locale } from "@/lib/i18n";

export const maxDuration = 30;

const DEPT_LABEL: Record<string, string> = {
  hr: "Human Resources",
  engineering: "Software & Technology",
  sales: "Marketing & Sales",
  general: "General employee",
};

function fallbackAnswer(question: string, title: string, body: string, locale: Locale) {
  const excerpt = body.replace(/\s+/g, " ").slice(0, 280);
  const tails: Record<Locale, string> = {
    tr: `“${title}” belgesine göre: ${excerpt}${body.length > 280 ? "…" : ""}\n\nSorunuz: ${question.slice(0, 180)}\nBu yanıt belge özetine dayanır; bağlayıcı yorum için İK ile teyit edin.`,
    en: `Based on “${title}”: ${excerpt}${body.length > 280 ? "…" : ""}\n\nQuestion: ${question.slice(0, 180)}\nThis is a document summary; confirm with HR before acting.`,
  };
  return tails[locale] ?? tails.tr;
}

function jsonReply(reply: string, fallback = false) {
  return NextResponse.json({ reply, fallback });
}

export async function POST(request: Request) {
  let locale: Locale = "tr";
  let question = "";
  let title = "Document";
  let document = "";
  let department = "General";

  try {
    const body = (await request.json()) as {
      question?: string;
      title?: string;
      document?: string;
      locale?: string;
      department?: string;
    };
    locale = parseRequestLocale(body.locale);
    question = body.question?.trim() || "";
    title = body.title?.trim() || (locale === "en" ? "Document" : "Belge");
    document = body.document?.trim() || "";
    department = DEPT_LABEL[body.department || ""] || body.department || "General";
  } catch {
    return jsonReply(
      locale === "en"
        ? "The question could not be read. Please try again."
        : "Soru okunamadı. Lütfen tekrar deneyin.",
      true,
    );
  }

  if (!question) {
    return jsonReply(fallbackAnswer("—", title, document, locale), true);
  }

  if (!isGeminiConfigured() || !document) {
    return jsonReply(fallbackAnswer(question, title, document, locale), true);
  }

  try {
    const { text } = await withGeminiModel((model) =>
      generateText({
        model,
        system: `You are the Nexus HR knowledge-base assistant. Answer only from the provided document. If the document does not contain the answer, say so and recommend HR confirmation. Be concise and professional. Audience department: ${department}. ${replyInLocaleInstruction(locale)}`,
        prompt: `Document title: ${title}\n\n${document.slice(0, 8000)}\n\nQuestion: ${question}`,
        maxRetries: 1,
      }),
    );
    return jsonReply(text.trim() || fallbackAnswer(question, title, document, locale));
  } catch {
    return jsonReply(fallbackAnswer(question, title, document, locale), true);
  }
}
