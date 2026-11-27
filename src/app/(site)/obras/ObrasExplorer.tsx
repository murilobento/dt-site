"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/track";
import { clientesDasObras, filterObras, parseObraFilters, serializeObraFilters, type ObraFilters } from "@/lib/obras/filter";
import type { Obra, UF } from "@/lib/content/types";

const DEBOUNCE_MS = 250;
const subscribeNoop = () => () => {};

type Props = {
  obras: Obra[];
  initialFilters: ObraFilters;
  /** slug → título, para a busca por nome de serviço */
  servicoNomes: Record<string, string>;
};

export function ObrasExplorer({ obras, initialFilters, servicoNomes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jsActive = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const ufs = useMemo(() => [...new Set(obras.map((o) => o.uf))].sort() as UF[], [obras]);
  const clientes = useMemo(() => clientesDasObras(obras), [obras]);

  const [filters, setFilters] = useState<ObraFilters>(initialFilters);
  const [qInput, setQInput] = useState(initialFilters.q ?? "");
  const [moreOpen, setMoreOpen] = useState(
    Boolean(initialFilters.uf || initialFilters.status || initialFilters.cliente || initialFilters.q),
  );
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastWritten = useRef(serializeObraFilters(initialFilters));
  // Sempre o filtro mais recente: o callback do debounce não pode ler um closure velho.
  const filtersRef = useRef(initialFilters);

  // Navegação externa (link, voltar) muda a URL: adota os filtros dela.
  const urlQuery = searchParams.toString();
  useEffect(() => {
    const fromUrl = parseObraFilters(new URLSearchParams(urlQuery), { clientes });
    const serialized = serializeObraFilters(fromUrl);
    if (serialized === lastWritten.current) return;
    lastWritten.current = serialized;
    filtersRef.current = fromUrl;
    setFilters(fromUrl);
    setQInput(fromUrl.q ?? "");
  }, [urlQuery, clientes]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const resultado = useMemo(() => filterObras(obras, filters, servicoNomes), [obras, filters, servicoNomes]);

  function apply(next: ObraFilters) {
    filtersRef.current = next;
    setFilters(next);
    const qs = serializeObraFilters(next);
    lastWritten.current = qs;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onSelect(key: Exclude<keyof ObraFilters, "q">, value: string) {
    const next = { ...filtersRef.current, [key]: value || undefined } as ObraFilters;
    if (!value) delete next[key];
    track("filter_use", { filtro: key, valor: value || "todos" });
    apply(next);
  }

  function commitSearch(value: string) {
    clearTimeout(timer.current);
    const q = value.trim();
    const next = { ...filtersRef.current };
    if (q) next.q = q;
    else delete next.q;
    if ((next.q ?? "") === (filtersRef.current.q ?? "")) return;
    track("filter_use", { filtro: "q", valor: q });
    apply(next);
  }

  function onSearch(value: string) {
    setQInput(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commitSearch(value), DEBOUNCE_MS);
  }

  function onClear() {
    clearTimeout(timer.current);
    setQInput("");
    track("filter_use", { filtro: "limpar", valor: "todos" });
    apply({});
  }

  const ativo = Object.keys(filters).length > 0 || qInput.trim() !== "";
  const vazio = resultado.length === 0;
  const countLabel = resultado.length === 1 ? "1 obra exibida" : `${resultado.length} obras exibidas`;

  return (
    <div className="flex flex-col gap-8">
      <FilterBar
        filters={filters}
        qInput={qInput}
        ufs={ufs}
        clientes={clientes}
        jsActive={jsActive}
        showClear={ativo && !vazio}
        countLabel={countLabel}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen((v) => !v)}
        onSelect={onSelect}
        onSearch={onSearch}
        onSearchNow={() => commitSearch(qInput)}
        onClear={onClear}
      />
      <h2 className="sr-only">Resultados</h2>
      {vazio ? (
        <div className="rounded-md border border-outline-variant bg-surface-container-low p-8">
          <p className="font-body text-body-lg text-on-surface">Nenhuma obra com esses filtros. Limpe um filtro para ver mais.</p>
          {jsActive ? (
            <Button className="mt-6" onClick={onClear}>Limpar filtros</Button>
          ) : (
            <Button className="mt-6" href="/obras">Limpar filtros</Button>
          )}
        </div>
      ) : (
        <ul className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resultado.map((o, i) => (
            <li key={o.slug} className="flex">
              <ProjectCard obra={o} eager={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
