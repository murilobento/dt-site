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

function Stat({ numero, divider }: { numero: Numero; divider: boolean }) {
  const { itemRef, valueRef } = useCountUp(numero.valor);
  const final = formatNumber(numero.valor);
  const textoFinal = `${final}${numero.unidade ? ` ${numero.unidade}` : ""} ${numero.rotulo}`;
  return (
    <li ref={itemRef} className={divider ? "lg:border-l lg:border-outline-variant lg:pl-6" : undefined}>
      <div aria-hidden="true" className="flex flex-col gap-1">
        <p className="font-display text-headline-lg-mobile tabular-nums text-primary lg:text-headline-lg">
          <span ref={valueRef}>{final}</span>
          {numero.unidade && <span className="ml-1">{numero.unidade}</span>}
        </p>
        <p className="font-body text-body-md text-on-surface-variant">{numero.rotulo}</p>
      </div>
      <span className="sr-only">{textoFinal}</span>
    </li>
  );
}

export function StatCounter({ numeros }: { numeros: Numero[] }) {
  return (
    <ul className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
      {numeros.map((n, i) => (
        <Stat key={n.rotulo} numero={n} divider={i > 0} />
      ))}
    </ul>
  );
}
