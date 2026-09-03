import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { parseRequestLocale, replyInLocaleInstruction } from "@/lib/ai-locale";
import { isGeminiConfigured } from "@/lib/gemini";
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
    de: `Laut „${title}“: ${excerpt}${body.length > 280 ? "…" : ""}\n\nFrage: ${question.slice(0, 180)}\nBitte mit HR bestätigen.`,
    fr: `D’après « ${title} » : ${excerpt}${body.length > 280 ? "…" : ""}\n\nQuestion : ${question.slice(0, 180)}\nConfirmez auprès des RH.`,
    es: `Según “${title}”: ${excerpt}${body.length > 280 ? "…" : ""}\n\nPregunta: ${question.slice(0, 180)}\nConfirme con RR. HH.`,
    ar: `وفقًا لـ «${title}»: ${excerpt}${body.length > 280 ? "…" : ""}\n\nالسؤال: ${question.slice(0, 180)}\nيرجى التأكد مع الموارد البشرية.`,
    ru: `Согласно «${title}»: ${excerpt}${body.length > 280 ? "…" : ""}\n\nВопрос: ${question.slice(0, 180)}\nПодтвердите в HR.`,
    zh: `根据「${title}」：${excerpt}${body.length > 280 ? "…" : ""}\n\n问题：${question.slice(0, 180)}\n请与人力资源确认。`,
  };
  return tails[locale];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      question?: string;
      title?: string;
      document?: string;
      locale?: string;
      department?: string;
    };
    const locale = parseRequestLocale(body.locale);
    const question = body.question?.trim() || "";
    const title = body.title?.trim() || "Document";
    const document = body.document?.trim() || "";
    const department = DEPT_LABEL[body.department || ""] || body.department || "General";

    if (!question) {
      return NextResponse.json({ reply: fallbackAnswer("—", title, document, locale), fallback: true });
    }

    if (!isGeminiConfigured() || !document) {
      return NextResponse.json({ reply: fallbackAnswer(question, title, document, locale), fallback: true });
    }

    try {
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        system: `You are the Nexus HR knowledge-base assistant. Answer only from the provided document. If the document does not contain the answer, say so and recommend HR confirmation. Be concise and professional. Audience department: ${department}. ${replyInLocaleInstruction(locale)}`,
        prompt: `Document title: ${title}\n\n${document.slice(0, 8000)}\n\nQuestion: ${question}`,
        maxRetries: 1,
      });
      return NextResponse.json({ reply: text.trim() || fallbackAnswer(question, title, document, locale) });
    } catch {
      return NextResponse.json({ reply: fallbackAnswer(question, title, document, locale), fallback: true });
    }
  } catch {
    return NextResponse.json({ reply: "Could not process the question.", fallback: true });
  }
}
