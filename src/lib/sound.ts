"use client";

type Tone = "hover" | "click" | "success" | "whoosh";

let ctx: AudioContext | null = null;
let enabled = false;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  if (value) void getCtx()?.resume();
}

export function isSoundEnabled() {
  return enabled;
}

export function playTone(tone: Tone = "hover") {
  if (!enabled) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(audio.destination);

  const map: Record<Tone, { f: number; d: number; type: OscillatorType; g: number }> = {
    hover: { f: 680, d: 0.05, type: "sine", g: 0.02 },
    click: { f: 420, d: 0.08, type: "triangle", g: 0.035 },
    success: { f: 760, d: 0.16, type: "sine", g: 0.04 },
    whoosh: { f: 220, d: 0.22, type: "sawtooth", g: 0.018 },
  };

  const cfg = map[tone];
  osc.type = cfg.type;
  osc.frequency.setValueAtTime(cfg.f, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(cfg.g, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.d);
  osc.start(now);
  osc.stop(now + cfg.d + 0.02);
}
