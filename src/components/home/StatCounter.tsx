"use client";

import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/format";
import type { Numero } from "@/lib/content/types";

const DURATION_MS = 1200;

/**
 * Anima de 0 até `target` uma única vez, quando o elemento entra na tela. Escreve direto no
 * DOM (sem estado): o HTML do servidor já traz o valor final, que vale sem JS e com reduced motion.
 */
function useCountUp(target: number) {
  const itemRef = useRef<HTMLLIElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    const out = valueRef.current;
    if (!item || !out || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    out.textContent = formatNumber(0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1);
        out.textContent = formatNumber(target * (1 - (1 - t) ** 3));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    observer.observe(item);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return { itemRef, valueRef };
}

function Stat({ numero }: { numero: Numero }) {
  const { itemRef, valueRef } = useCountUp(numero.valor);
  const final = formatNumber(numero.valor);
  const textoFinal = `${final}${numero.unidade ? ` ${numero.unidade}` : ""} ${numero.rotulo}`;
  return (
    <li ref={itemRef}>
      <div aria-hidden="true">
        <p className="font-display text-4xl font-extrabold text-text-primary">
          <span ref={valueRef}>{final}</span>
          {numero.unidade && <span className="ml-1 text-xl">{numero.unidade}</span>}
        </p>
        <p className="mt-2 text-base text-text-secondary">{numero.rotulo}</p>
      </div>
      <span className="sr-only">{textoFinal}</span>
    </li>
  );
}

export function StatCounter({ numeros }: { numeros: Numero[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
      {numeros.map((n) => (
        <Stat key={n.rotulo} numero={n} />
      ))}
    </ul>
  );
}
