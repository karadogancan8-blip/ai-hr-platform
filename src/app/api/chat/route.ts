import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { parseRequestLocale, replyInLocaleInstruction } from "@/lib/ai-locale";
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

function hasApiKey() {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim());
}

function fallbackReply(question: string) {
  const q = question.toLocaleLowerCase("tr-TR");

  if (/yıllık izin|izin hakk|kaç gün izin|yillik izin/.test(q)) {
    return `İş Kanunu’na göre yıllık ücretli izin, kıdeme göre kural olarak 14 veya 20 iş günüdür (daha uzun kıdemde üst dilimler uygulanabilir). Şirket yönetmeliğimizde:
• Talep, iznin başlangıcından en az 5 iş günü önce iletilir.
• Resmi tatiller izin süresine dahil edilmez.
Kesin bakiyeniz özlük kaydınıza göre değişir; İK panelindeki izin modülünden teyit edin.`;
  }

  if (/mazeret|ücretsiz|ucretsiz|hastalık|hastalik|rapor/.test(q)) {
    return `Mazeret, hastalık (raporlu) ve ücretsiz izin türleri yönetmelikte ayrı izlenir.
• Hastalık izinlerinde hekim raporu İK’ya iletilir; raporlu günler yıllık izinden düşülmez.
• Ücretsiz izin yönetici ve İK onayıyla açılır.
Başvuruyu izin modülünden ilgili türü seçerek iletin.`;
  }

  if (/fazla mesai|mesai|overtime/.test(q)) {
    return `İş Kanunu çerçevesinde fazla çalışma kural olarak haftalık üst sınırlara tabidir; şirketimizde fazla mesai haftalık 11 saati aşamaz ve önceden yazılı onay şarttır.
Onaysız mesai ücret/izin karşılığı doğurmaz. Fiili süreleri yöneticinizle kayıt altına alın.`;
  }

  if (/uzaktan|hibrit|home office|wfh|ofis gün/.test(q)) {
    return `Hibrit çalışma kuralımız: Salı ve Perşembe ofis günüdür. 5 iş gününden uzun uzaktan çalışma için yönetici onayı gerekir.
Güvenlik ve veri politikaları uzaktan çalışmada da geçerlidir. İstisna taleplerini yazılı iletin.`;
  }

  if (/kıdem|kidem|tazminat|ihbar/.test(q)) {
    return `Kıdem tazminatı, kural olarak en az 1 yılı dolduran çalışanlar için İş Kanunu şartlarıyla gündeme gelir. İhbar süreleri kıdeme göre yaklaşık 2–8 haftadır.
Hesaplama brüt ücret, ek ödemeler ve çıkış sebebine bağlıdır; bağlayıcı tutar için İK’dan hesap özeti isteyin.`;
  }

  if (/fesih|işten çık|isten cik|istifa/.test(q)) {
    return `Fesih ve istifa süreçlerinde ihbar süresi, varsa kıdem ve kullanılmayan izin bakiyesi birlikte değerlendirilir. Gerekçe ve tebligat usulü İş Kanunu’na uygun olmalıdır.
Kişisel dosyanız için İK ile görüşmeden bağlayıcı işlem yapmayın.`;
  }

  return `Bu soruyu şirket iç yönetmeliği ve İş Kanunu genel çerçevesinde ele alıyorum.

Kısa özet:
• Yıllık izin kıdeme göre 14 veya 20 iş günü; talep en az 5 iş günü önce.
• Fazla mesai haftalık 11 saati aşmaz, yazılı onay şarttır.
• Hibrit: Salı–Perşembe ofis; 5 günden uzun uzaktan çalışma yönetici onayı ister.
• Kıdem tazminatı genelde 1 yıl sonra; ihbar 2–8 hafta.

Sorunuz (“${question.slice(0, 140)}”) kişisel özlük bilgisine bağlı olabilir. Nihai uygulama için İK ile teyit edin.`;
}

function ok(reply: string, fallback = false) {
  return NextResponse.json({ reply, fallback });
}

export async function POST(request: Request) {
  let lastUser = "";

  try {
    try {
      const supabase = await createServerSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("[chat] oturum yok");
        return ok(
          "Oturumunuz doğrulanamadı. Yine de genel çerçeve: izin, mesai ve kıdem sorularında İK yönetmeliği ile İş Kanunu birlikte uygulanır. Giriş yaptıktan sonra size özel bakiyenizi sorun.",
          true,
        );
      }
    } catch (error) {
      console.error("[chat] oturum kontrolü hatası:", error);
    }

    let body: { message?: string; messages?: ChatTurn[]; locale?: string } = {};
    try {
      body = (await request.json()) as typeof body;
    } catch (error) {
      console.error("[chat] istek gövdesi okunamadı:", error);
      return ok(fallbackReply("genel mevzuat"), true);
    }

    const history = Array.isArray(body.messages) ? body.messages : [];
    lastUser =
      body.message?.trim() ||
      [...history].reverse().find((item) => item.role === "user")?.content?.trim() ||
      "";

    if (!lastUser) {
      return ok(
        "Size yardımcı olmam için sorunuzu yazın. Örneğin: yıllık izin, fazla mesai, hibrit çalışma veya kıdem tazminatı.",
        true,
      );
    }

    if (!hasApiKey()) {
      console.error("[chat] GOOGLE_GENERATIVE_AI_API_KEY tanımlı değil");
      return ok(fallbackReply(lastUser), true);
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

    try {
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        system: `${policySystem}\n${replyInLocaleInstruction(parseRequestLocale(body.locale))}`,
        messages,
        maxRetries: 2,
      });
      const reply = text?.trim();
      if (!reply) {
        console.error("[chat] Gemini boş yanıt döndü");
        return ok(fallbackReply(lastUser), true);
      }
      return ok(reply, false);
    } catch (error) {
      console.error("[chat] Gemini API / kota hatası:", error);
      return ok(fallbackReply(lastUser), true);
    }
  } catch (error) {
    console.error("[chat] beklenmeyen hata:", error);
    return ok(fallbackReply(lastUser || "genel mevzuat"), true);
  }
}
