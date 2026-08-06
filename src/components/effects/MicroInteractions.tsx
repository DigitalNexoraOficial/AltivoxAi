"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { playTone } from "@/lib/sound";

export function MicroInteractions() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".ui-lift"));
    const cleaners: Array<() => void> = [];

    nodes.forEach((node) => {
      const onMove = (ev: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const px = (ev.clientX - rect.left) / rect.width - 0.5;
        const py = (ev.clientY - rect.top) / rect.height - 0.5;
        gsap.to(node, {
          rotateY: px * 5,
          rotateX: py * -5,
          y: -4,
          duration: 0.24,
          ease: "power2.out",
        });
      };

      const onEnter = () => playTone("hover");
      const onLeave = () => {
        gsap.to(node, {
          rotateY: 0,
          rotateX: 0,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        });
      };

      node.addEventListener("mousemove", onMove);
      node.addEventListener("mouseenter", onEnter);
      node.addEventListener("mouseleave", onLeave);
      cleaners.push(() => {
        node.removeEventListener("mousemove", onMove);
        node.removeEventListener("mouseenter", onEnter);
        node.removeEventListener("mouseleave", onLeave);
      });
    });

    const clickables = Array.from(document.querySelectorAll<HTMLElement>("a.btn-primary, button.btn-primary"));
    clickables.forEach((node) => {
      const onClick = () => {
        playTone("click");
        if ("vibrate" in navigator) navigator.vibrate?.(8);
      };
      node.addEventListener("click", onClick);
      cleaners.push(() => node.removeEventListener("click", onClick));
    });

    return () => cleaners.forEach((fn) => fn());
  }, []);

  return null;
}
