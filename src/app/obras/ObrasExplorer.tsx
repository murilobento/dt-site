"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/track";
import { filterObras, parseObraFilters, serializeObraFilters, type ObraFilters } from "@/lib/obras/filter";
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

  const [filters, setFilters] = useState<ObraFilters>(initialFilters);
  const [qInput, setQInput] = useState(initialFilters.q ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastWritten = useRef(serializeObraFilters(initialFilters));

  // Navegação externa (link, voltar) muda a URL: adota os filtros dela.
  const urlQuery = searchParams.toString();
  useEffect(() => {
    const fromUrl = parseObraFilters(new URLSearchParams(urlQuery));
    const serialized = serializeObraFilters(fromUrl);
    if (serialized === lastWritten.current) return;
    lastWritten.current = serialized;
    setFilters(fromUrl);
    setQInput(fromUrl.q ?? "");
  }, [urlQuery]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const ufs = useMemo(() => [...new Set(obras.map((o) => o.uf))].sort() as UF[], [obras]);
  const clientes = useMemo(
    () => [...new Set(obras.flatMap((o) => (o.cliente ? [o.cliente.nome] : [])))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [obras],
  );
  const resultado = useMemo(() => filterObras(obras, filters, servicoNomes), [obras, filters, servicoNomes]);

  function apply(next: ObraFilters) {
    setFilters(next);
    const qs = serializeObraFilters(next);
    lastWritten.current = qs;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onSelect(key: Exclude<keyof ObraFilters, "q">, value: string) {
    const next = { ...filters, [key]: value || undefined } as ObraFilters;
    if (!value) delete next[key];
    track("filter_use", { filtro: key, valor: value || "todos" });
    apply(next);
  }

  function onSearch(value: string) {
    setQInput(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = value.trim();
      const next = { ...filters };
      if (q) next.q = q;
      else delete next.q;
      track("filter_use", { filtro: "q", valor: q });
      apply(next);
    }, DEBOUNCE_MS);
  }

  function onClear() {
    clearTimeout(timer.current);
    setQInput("");
    track("filter_use", { filtro: "limpar", valor: "todos" });
    apply({});
  }

  const ativo = Object.keys(filters).length > 0 || qInput.trim() !== "";
  const vazio = resultado.length === 0;

  return (
    <>
      <FilterBar
        filters={filters}
        qInput={qInput}
        ufs={ufs}
        clientes={clientes}
        jsActive={jsActive}
        showClear={ativo && !vazio}
        onSelect={onSelect}
        onSearch={onSearch}
        onClear={onClear}
      />
      <h2 className="sr-only">Resultados</h2>
      <p role="status" aria-live="polite" className="mt-8 text-base font-semibold text-text-primary">
        {resultado.length === 1 ? "1 obra" : `${resultado.length} obras`}
      </p>
      {vazio ? (
        <div className="mt-6 rounded-card border border-border bg-surface-muted p-8">
          <p className="text-lg text-text-primary">Nenhuma obra com esses filtros. Limpe um filtro para ver mais.</p>
          <Button className="mt-6" onClick={onClear}>Limpar filtros</Button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resultado.map((o) => (
            <li key={o.slug}>
              <ProjectCard obra={o} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
