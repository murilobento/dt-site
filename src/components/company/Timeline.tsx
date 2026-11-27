"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import type { PaginaEmpresa } from "@/lib/content/types";

type Marco = PaginaEmpresa["marcos"][number];

function MarcoImagem({ marco }: { marco: Marco }) {
  if (!marco.imagem) return null;
  return (
    <Image
      src={marco.imagem.url}
      alt={marco.imagem.alt}
      width={marco.imagem.width}
      height={marco.imagem.height}
      sizes="(min-width: 768px) 640px, 100vw"
      loading="lazy"
      className="mt-4 h-auto w-full max-w-2xl rounded-md"
    />
  );
}

/**
 * Linha do tempo. Desktop (>= 768 px): padrão ARIA Tabs com ativação automática.
 * Mobile: lista vertical com todos os marcos. As duas estruturas são renderizadas e
 * alternadas por CSS; a oculta fica em display:none e fora da árvore de acessibilidade.
 */
export function Timeline({ marcos }: { marcos: Marco[] }) {
  const [ativo, setAtivo] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function ir(i: number) {
    setAtivo(i);
    tabRefs.current[i]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = marcos.length - 1;
    const next: Record<string, number> = {
      ArrowRight: ativo === last ? 0 : ativo + 1,
      ArrowLeft: ativo === 0 ? last : ativo - 1,
      Home: 0,
      End: last,
    };
    if (e.key in next) {
      e.preventDefault();
      ir(next[e.key]);
    }
  }

  const marco = marcos[ativo];

  return (
    <>
      <div className="mt-8 hidden md:block">
        <div
          role="tablist"
          aria-label="Linha do tempo"
          onKeyDown={onKeyDown}
          className="flex gap-2 border-b border-outline-variant"
        >
          {marcos.map((m, i) => {
            const selecionado = i === ativo;
            return (
              <button
                key={`${m.ano}-${m.titulo}`}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`marco-tab-${i}`}
                aria-selected={selecionado}
                aria-controls="marco-painel"
                tabIndex={selecionado ? 0 : -1}
                onClick={() => setAtivo(i)}
                className={`-mb-px border-b-2 px-4 py-3 font-mono text-headline-md font-semibold tabular-nums ${
                  selecionado
                    ? "border-secondary text-secondary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {m.ano}
              </button>
            );
          })}
        </div>
        <div
          role="tabpanel"
          id="marco-painel"
          aria-labelledby={`marco-tab-${ativo}`}
          className="pt-8"
        >
          <h3 className="font-title text-title-lg text-on-surface">{marco.titulo}</h3>
          <p className="mt-2 max-w-2xl font-body text-body-md text-on-surface-variant">{marco.descricao}</p>
          <MarcoImagem marco={marco} />
        </div>
      </div>

      <ol aria-label="Linha do tempo" className="mt-8 space-y-8 border-l border-outline-variant pl-6 md:hidden">
        {marcos.map((m) => (
          <li key={`${m.ano}-${m.titulo}`}>
            <p className="font-mono text-headline-md font-semibold tabular-nums text-secondary">{m.ano}</p>
            <h3 className="mt-1 font-title text-title-lg text-on-surface">{m.titulo}</h3>
            <p className="mt-2 font-body text-body-md text-on-surface-variant">{m.descricao}</p>
            <MarcoImagem marco={m} />
          </li>
        ))}
      </ol>
    </>
  );
}
