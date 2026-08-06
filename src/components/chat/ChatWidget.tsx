"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
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

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = window.scrollY / max;
      // Near the end of the page (FAQ / final CTA / contact)
      setNudge(progress >= 0.72 && !open);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

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
      <div className="fixed bottom-5 right-3 z-[100] flex items-end gap-3 mobile-snap-safe sm:bottom-6 sm:right-6">
        <AnimatePresence mode="wait">
          {nudge && !open ? (
            <motion.button
              key="chat-nudge"
              type="button"
              id="chat-toggle-btn"
              onClick={() => setOpen(true)}
              initial={reduce ? false : { opacity: 0, x: 24, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, x: 18, scale: 0.94 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="hero-dock flex max-w-[min(280px,70vw)] items-center gap-3 rounded-full border border-cyan/30 py-2.5 pl-4 pr-2 text-left shadow-glow"
              aria-label="¿Necesitas ayuda?"
            >
              <span className="live-dot shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">¿Necesitas ayuda?</span>
                <span className="block truncate text-[11px] text-mist-muted">Habla con el asistente Altivox</span>
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan text-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4 4h16v12H7l-3 3V4z" />
                </svg>
              </span>
            </motion.button>
          ) : (
            <motion.button
              key="chat-fab"
              type="button"
              id="chat-toggle-btn"
              onClick={() => setOpen((v) => !v)}
              initial={reduce ? false : { opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduce ? undefined : { scale: 1.05 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan text-ink shadow-glow"
              aria-label={open ? t.chat.close : t.chat.open}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M4 4h16v12H7l-3 3V4z" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="chat-container"
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="hero-dock fixed bottom-[5.5rem] right-3 z-[100] flex h-[min(560px,70vh)] w-[min(390px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-cyan/20 sm:bottom-24 sm:right-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white">Altivox Chat</p>
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
                    agent === a ? "border-cyan/40 bg-cyan/20 text-cyan" : "border-transparent text-mist-muted"
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
                    m.role === "user" ? "ml-auto bg-cyan/15 text-cyan" : "bg-white/5 text-soft"
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  start: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
