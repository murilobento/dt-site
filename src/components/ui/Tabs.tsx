"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type TabItem = { id: string; label: string; content: ReactNode };

type TabsProps = {
  /** Nome acessível do tablist. */
  label: string;
  tabs: TabItem[];
  className?: string;
  panelClassName?: string;
  /** Seleção controlada pelo pai (ex.: âncora da URL). Sem isso, o estado é interno. */
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Usa o `id` da aba como id do painel (âncoras `#id`). */
  anchorPanels?: boolean;
};

/**
 * Padrão ARIA Tabs: tabindex móvel, setas/Home/End e ativação automática ao focar.
 * Todos os painéis ficam no HTML (os inativos com `hidden`), então o conteúdo existe sem JS
 * e fora da árvore de acessibilidade quando oculto.
 */
export function Tabs({ label, tabs, className, panelClassName, selectedId, onSelect, anchorPanels }: TabsProps) {
  const base = useId();
  const [ativoInterno, setAtivoInterno] = useState(0);
  const controlado = selectedId !== undefined ? tabs.findIndex((t) => t.id === selectedId) : -1;
  const ativo = controlado >= 0 ? controlado : ativoInterno;
  const setAtivo = (i: number) => {
    setAtivoInterno(i);
    if (tabs[i]) onSelect?.(tabs[i].id);
  };
  const painelId = (id: string) => (anchorPanels ? id : `${base}-panel-${id}`);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  if (tabs.length === 0) return null;

  function ir(i: number) {
    setAtivo(i);
    tabRefs.current[i]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = tabs.length - 1;
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

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-outline-variant pb-4 sm:flex-wrap sm:gap-3"
      >
        {tabs.map((t, i) => {
          const selecionado = i === ativo;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={selecionado}
              aria-controls={painelId(t.id)}
              tabIndex={selecionado ? 0 : -1}
              onClick={() => setAtivo(i)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-sm px-4 py-2.5 font-label text-label-lg transition-colors duration-state-change ease-state-change md:px-5",
                selecionado
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={painelId(t.id)}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={i !== ativo}
          tabIndex={0}
          className={cn("mt-6 md:mt-8", panelClassName)}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
