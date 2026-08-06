"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { tokens } from "@/lib/brand-system";

export function BrandLoader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduce) return;
    if (sessionStorage.getItem("altivox-intro") === "1") return;
    setShow(true);
    const t = window.setTimeout(() => {
      sessionStorage.setItem("altivox-intro", "1");
      setShow(false);
    }, 1400);
    return () => window.clearTimeout(t);
  }, [reduce]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-[#050505]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-hidden
    >
      <div className="text-center">
        <div className="mx-auto mb-5 h-14 w-14 rounded-full border border-cyan/40 bg-cyan/10 shadow-glow" />
        <p className="font-semibold tracking-[0.28em] text-cyan">{tokens.brand.mark}</p>
        <p className="mt-2 text-xs text-mist-muted">AI-Native Studio</p>
      </div>
    </motion.div>
  );
}
