"use client";

import { useEffect } from "react";
import gsap from "gsap";

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
          rotateY: px * 4,
          rotateX: py * -4,
          y: -3,
          duration: 0.26,
          ease: "power2.out",
        });
      };

      const onLeave = () => {
        gsap.to(node, {
          rotateY: 0,
          rotateX: 0,
          y: 0,
          duration: 0.42,
          ease: "power3.out",
        });
      };

      node.addEventListener("mousemove", onMove);
      node.addEventListener("mouseleave", onLeave);
      cleaners.push(() => {
        node.removeEventListener("mousemove", onMove);
        node.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleaners.forEach((fn) => fn());
  }, []);

  return null;
}
