import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { parseRequestLocale, replyInLocaleInstruction } from "@/lib/ai-locale";
import { isGeminiConfigured } from "@/lib/gemini";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

function fallback(question: string, employeeName: string, role: string) {
  const q = question.toLocaleLowerCase("tr-TR");
  const name = employeeName || "yeni çalışan";
  if (/izin|ik|evrak|bordro/.test(q)) {
    return `${name} için ilk hafta İK evrakları, KVKK/güvenlik eğitimi ve sistem hesapları tamamlanmalı. Eksik evrakı İK ile listeleyin.`;
  }
  if (/mentor|yönetici|yonetici|toplantı/.test(q)) {
    return `${role} oryantasyonunda mentor/yönetici ile 1-1: beklentiler, ilk 30 gün teslimatı ve soru listesi. Haftalık 20 dakikalık check-in önerilir.`;
  }
  return `${name} (${role}) için 30 günlük uyum: Hafta 1 kültür ve araçlar, Hafta 2 gölge çalışma, Hafta 3 ilk sahiplik, Hafta 4 30. gün değerlendirme. Sorunuz: “${question.slice(0, 120)}”. Somut adımı checklist’ten işaretleyin; takıldığınız noktayı mentöre iletin.`;
}

export async function POST(request: Request) {
  let question = "";
  let employeeName = "yeni çalışan";
  let role = "pozisyon";
  let department = "departman";
  let outputLocale = parseRequestLocale("tr");

  try {
    try {
      const supabase = await createServerSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("[onboarding-chat] oturum yok");
      }
    } catch (error) {
      console.error("[onboarding-chat] oturum hatası:", error);
    }

    try {
      const body = (await request.json()) as {
        message?: string;
        employeeName?: string;
        role?: string;
        department?: string;
        summary?: string;
        locale?: string;
      };
      question = body.message?.trim() || "";
      employeeName = body.employeeName?.trim() || employeeName;
      role = body.role?.trim() || role;
      department = body.department?.trim() || department;
      outputLocale = parseRequestLocale(body.locale);
    } catch (error) {
      console.error("[onboarding-chat] gövde hatası:", error);
    }

    if (!question) {
      return NextResponse.json({
        reply: "Oryantasyon asistanına bir soru yazın. Örn. ilk hafta neleri bitirmeliyim?",
        fallback: true,
      });
    }

    if (!isGeminiConfigured()) {
      console.error("[onboarding-chat] API anahtarı yok");
      return NextResponse.json({ reply: fallback(question, employeeName, role), fallback: true });
    }

    try {
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        system: `Sen OnboardingAgent adlı oryantasyon asistanısın. Kısa ve uygulanabilir cevap ver. Uydurma iç politika numarası yazma. ${replyInLocaleInstruction(outputLocale)}`,
        prompt: `Çalışan: ${employeeName}\nPozisyon: ${role}\nDepartman: ${department}\nSoru: ${question}`,
        maxRetries: 2,
      });
      const reply = text?.trim();
      if (!reply) {
        return NextResponse.json({ reply: fallback(question, employeeName, role), fallback: true });
      }
      return NextResponse.json({ reply, fallback: false });
    } catch (error) {
      console.error("[onboarding-chat] Gemini hatası:", error);
      return NextResponse.json({ reply: fallback(question, employeeName, role), fallback: true });
    }
  } catch (error) {
    console.error("[onboarding-chat] beklenmeyen hata:", error);
    return NextResponse.json({ reply: fallback(question || "genel", employeeName, role), fallback: true });
  }
}
