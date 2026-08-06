"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

type Msg = { role: "user" | "assistant"; content: string };

const AGENTS = [
  "Asistente",
  "Investigador",
  "Diseñador",
  "Auditoría",
  "Creativo",
  "Sistemas",
] as const;

export function ChatWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [agent, setAgent] = useState<(typeof AGENTS)[number]>("Asistente");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Hola. Soy el asistente de AltivoxAi. ¿En qué te ayudo?",
    },
  ]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages, open]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: clean }]);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          agent,
          history: messages.slice(-8),
        }),
      });
      const data = await res.json();
      const reply =
        data.reply || data.message || data.response || "No he podido responder ahora.";
      setMessages((m) => [...m, { role: "assistant", content: String(reply) }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Error de conexión. Inténtalo de nuevo." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function startVoice() {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "es-ES";
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      void send(ev.results[0][0].transcript);
    };
    rec.start();
  }

  return (
    <>
      <button
        type="button"
        id="chat-toggle-btn"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-cyan text-ink shadow-glow transition hover:scale-105"
        aria-label={open ? t.chat.close : t.chat.open}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h16v12H7l-3 3V4z" />
        </svg>
      </button>

      {open ? (
        <div
          id="chat-container"
          className="hero-dock fixed bottom-24 right-6 z-[100] flex h-[min(560px,70vh)] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-cyan/20"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-sans font-semibold text-xs uppercase tracking-widest text-white">
                Altivox Chat
              </p>
              <p className="text-[10px] text-mist-muted">{agent}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xl text-white hover:text-cyan"
              aria-label={t.chat.close}
            >
              ×
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-2 py-2">
            {AGENTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAgent(a)}
                className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide ${
                  agent === a ? "bg-cyan/20 text-cyan" : "text-mist-muted"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div ref={boxRef} id="chat-box" className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] font-mono leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-cyan/15 text-cyan"
                    : "bg-white/5 text-soft"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/10 p-3">
            <button
              type="button"
              onClick={startVoice}
              className="text-mist-muted hover:text-cyan"
              aria-label={t.chat.voice}
              title={t.chat.voice}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 19v3h2v-3h-2z" />
              </svg>
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              aria-label={t.chat.placeholder}
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-cyan"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl border border-cyan/30 bg-cyan/20 p-2 text-cyan"
              aria-label={t.chat.send}
            >
              ↗
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

// Minimal SpeechRecognition typings for browsers that support it
interface SpeechRecognition extends EventTarget {
  lang: string;
  start: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
