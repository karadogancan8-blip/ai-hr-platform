"use client";

import { FormEvent, useRef, useState } from "react";
import { IconSend } from "@/components/icons";
import { initialPolicyMessages } from "@/lib/mock-data";
import type { ChatMessage } from "@/lib/types";

function nowLabel() {
  return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function PolicyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialPolicyMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      time: nowLabel(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messages: nextMessages.map((item) => ({ role: item.role, content: item.content })),
        }),
      });
      const payload = (await response.json()) as { reply?: string; error?: string };
      const reply = payload.reply?.trim();
      if (!reply) {
        throw new Error(payload.error || "Yanıt boş geldi.");
      }

      const assistant: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        time: nowLabel(),
      };
      setMessages((prev) => [...prev, assistant]);
    } catch (err) {
      console.error("[PolicyChat]", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "Bağlantı kesintisi oldu. Genel çerçeve: yıllık izin kıdeme göre 14 veya 20 iş günü; fazla mesai yazılı onay ve haftalık 11 saat sınırı; hibrit çalışmada Salı–Perşembe ofis günüdür. Kesin bilgi için İK ile teyit edin.",
          time: nowLabel(),
        },
      ]);
    } finally {
      setPending(false);
      window.setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">PolicyAgent</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
          Şirket İçi Mevzuat Soru-Cevap
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Yanıtlar Google Gemini (ücretsiz Flash modeli) üzerinden üretilir.
        </p>
      </div>

      <div className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
        <div className="border-b border-sky-50 bg-[#f7fbff] px-5 py-3 text-xs text-slate-500">
          Kaynak: İK Yönetmeliği 2026 · model: Gemini Flash
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-[#123056] text-white"
                    : "bg-sky-50 text-slate-800 ring-1 ring-sky-100"
                }`}
              >
                {message.role === "assistant" ? (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                    PolicyAgent
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`mt-2 text-[10px] ${message.role === "user" ? "text-sky-200" : "text-slate-400"}`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
          {pending ? <div className="text-xs text-slate-400">PolicyAgent yazılıyor…</div> : null}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-sky-50 p-3 sm:p-4">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Örn. Yıllık izin hakkım kaç gün?"
            className="flex-1 rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm outline-none ring-sky-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-3 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
          >
            <IconSend className="h-4 w-4" />
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
}
