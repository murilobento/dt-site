"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Seção com entrada em fade + 16px, uma única vez. O HTML do servidor é visível; o estado
 * `pending` só é aplicado após a hidratação e nunca com `prefers-reduced-motion: reduce`.
 */
export function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "visible";
        observer.disconnect();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
