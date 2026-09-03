import { generateText } from "ai";
import { NextResponse } from "next/server";
import { isGeminiConfigured, withGeminiModel } from "@/lib/gemini";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

const policySystem = `Sen PolicyAgent adlı şirket içi mevzuat asistanısın. Yanıtların Türkçe, kısa ve net olsun.
Çalışanlara İK yönetmeliği, izin, fazla mesai, uzaktan çalışma ve kıdem konularında yardımcı ol.
Uydurma madde numarası verme; emin değilsen genel çerçeveyi belirtip İK ile teyit öner.
Temel şirket kuralları:
- Yıllık izin kıdeme göre 14 veya 20 iş günüdür; talep çıkıştan en az 5 iş günü önce iletilir; resmi tatiller izin süresine dahil edilmez.
- Hibrit çalışmada Salı ve Perşembe ofis günüdür; 5 günden uzun uzaktan çalışma için yönetici onayı gerekir.
- Fazla mesai haftalık 11 saati aşamaz ve önceden yazılı onay şarttır.
- Kıdem tazminatı 1 yılı dolduran çalışanlar için geçerlidir; ihbar süreleri kıdeme göre 2–8 haftadır.`;

type ChatTurn = {
  role?: string;
  content?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_GENERATIVE_AI_API_KEY tanımlı değil. Ücretsiz Gemini anahtarını .env.local dosyasına ekleyin.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      message?: string;
      messages?: ChatTurn[];
    };

    const history = Array.isArray(body.messages) ? body.messages : [];
    const lastUser =
      body.message?.trim() ||
      [...history].reverse().find((item) => item.role === "user")?.content?.trim() ||
      "";

    if (!lastUser) {
      return NextResponse.json({ error: "Bir soru yazın." }, { status: 400 });
    }

    const messages = history
      .filter((item) => item.content?.trim())
      .slice(-12)
      .map((item) => ({
        role: item.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: item.content!.trim(),
      }));

    if (!messages.length || messages[messages.length - 1]?.content !== lastUser) {
      messages.push({ role: "user", content: lastUser });
    }

    const { text } = await withGeminiModel((model) =>
      generateText({
        model,
        system: policySystem,
        messages,
        maxRetries: 2,
      }),
    );

    return NextResponse.json({ reply: text.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Yanıt üretilemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
