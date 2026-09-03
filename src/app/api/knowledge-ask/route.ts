import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/gemini";

export const maxDuration = 30;

function fallbackAnswer(question: string, title: string, body: string) {
  const excerpt = body.replace(/\s+/g, " ").slice(0, 280);
  return `“${title}” belgesine göre: ${excerpt}${body.length > 280 ? "…" : ""}

Sorunuz: ${question.slice(0, 180)}
Bu yanıt belge özetine dayanır; bağlayıcı yorum için İK ile teyit edin.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: string; title?: string; document?: string };
    const question = body.question?.trim() || "";
    const title = body.title?.trim() || "Belge";
    const document = body.document?.trim() || "";
    if (!question) {
      return NextResponse.json({ reply: "Belge hakkında sormak istediğiniz cümleyi yazın." });
    }

    if (!isGeminiConfigured() || !document) {
      return NextResponse.json({ reply: fallbackAnswer(question, title, document), fallback: true });
    }

    try {
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        system:
          "Sen Nexus HR bilgi üssü asistanısın. Yalnızca verilen belgeye dayanarak Türkçe, kısa yanıt ver. Belgede yoksa uydurma; İK teyidi öner.",
        prompt: `Belge: ${title}\n\n${document.slice(0, 8000)}\n\nSoru: ${question}`,
        maxRetries: 1,
      });
      return NextResponse.json({ reply: text.trim() || fallbackAnswer(question, title, document) });
    } catch {
      return NextResponse.json({ reply: fallbackAnswer(question, title, document), fallback: true });
    }
  } catch {
    return NextResponse.json({ reply: "Soru işlenemedi. Belgeyi açıp yeniden deneyin.", fallback: true });
  }
}
