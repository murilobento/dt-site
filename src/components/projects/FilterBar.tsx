import { ChevronDown, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/ui/cn";
import { CATEGORIA_OBRA_LABEL } from "@/lib/obras/categorias";
import { serializeObraFilters, type ObraFilters } from "@/lib/obras/filter";
import type { CategoriaObra, StatusObra, UF } from "@/lib/content/types";

export type FilterKey = keyof ObraFilters;

type FilterBarProps = {
  filters: ObraFilters;
  /** Texto atual do campo de busca (pode estar à frente do filtro aplicado, por causa do debounce). */
  qInput: string;
  ufs: UF[];
  clientes: string[];
  /** Com JS ativo o envio é desnecessário: some o botão "Filtrar" e as chips viram botões. */
  jsActive: boolean;
  showClear: boolean;
  /** Texto da contagem, ex.: "6 obras exibidas". */
  countLabel: string;
  /** Filtros secundários abertos (só recolhem no mobile e só com JS). */
  moreOpen: boolean;
  onToggleMore: () => void;
  onSelect: (key: Exclude<FilterKey, "q">, value: string) => void;
  onSearch: (value: string) => void;
  onSearchNow: () => void;
  onClear: () => void;
};

const CONTROL =
  "min-h-12 w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-3 font-body text-body-md text-on-surface";
const LABEL = "mb-1 block font-label text-label-sm text-on-surface-variant";
const CHIP =
  "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-sm px-4 py-2 font-label text-label-lg transition-colors duration-state-change ease-state-change focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const CATEGORIAS = Object.keys(CATEGORIA_OBRA_LABEL) as CategoriaObra[];

function Select({
  id, label, value, options, onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <select id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} className={CONTROL}>
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function FilterBar({
  filters, qInput, ufs, clientes, jsActive, showClear, countLabel, moreOpen, onToggleMore, onSelect, onSearch, onSearchNow, onClear,
}: FilterBarProps) {
  const status: { value: StatusObra; label: string }[] = [
    { value: "em-andamento", label: "Em andamento" },
    { value: "concluida", label: "Concluída" },
  ];
  const chips: { id: CategoriaObra | ""; label: string }[] = [
    { id: "", label: "Todas" },
    ...CATEGORIAS.map((c) => ({ id: c, label: CATEGORIA_OBRA_LABEL[c] })),
  ];
  const hrefFor = (id: CategoriaObra | "") => {
    const next: ObraFilters = { ...filters, categoria: id || undefined };
    const qs = serializeObraFilters(next);
    return qs ? `/obras?${qs}` : "/obras";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 border-b border-outline-variant pb-4 sm:flex-row sm:items-center">
        <div role="group" aria-label="Filtrar obras por categoria" className="flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:gap-3 sm:overflow-visible">
          {chips.map((c) => {
            const active = (filters.categoria ?? "") === c.id;
            const cls = cn(
              CHIP,
              active ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
            );
            return jsActive ? (
              <button key={c.id} type="button" aria-pressed={active} onClick={() => onSelect("categoria", c.id)} className={cls}>
                {c.label}
              </button>
            ) : (
              <a key={c.id} href={hrefFor(c.id)} aria-current={active ? "true" : undefined} className={cls}>
                {c.label}
              </a>
            );
          })}
        </div>
        <p role="status" aria-live="polite" className="shrink-0 font-mono text-mono-md tabular-nums text-on-surface-variant">
          {countLabel}
        </p>
      </div>

      {/* Sempre no HTML do servidor (sem salto de layout na hidratação); some quando não há JavaScript. */}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls="filtros-secundarios"
          onClick={onToggleMore}
          className="inline-flex min-h-11 items-center gap-2 self-start font-label text-label-lg text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden [@media(scripting:none)]:hidden"
        >
          <ListFilter aria-hidden="true" className="size-4" />
          Mais filtros
          <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-state-change", moreOpen && "rotate-180")} />
        </button>

      <form
        id="filtros-secundarios"
        method="get"
        action="/obras"
        role="search"
        aria-label="Filtrar obras"
        onSubmit={(e) => {
          if (!jsActive) return;
          e.preventDefault();
          onSearchNow();
        }}
        className={cn("gap-4 sm:grid-cols-2 lg:grid-cols-4", moreOpen ? "grid" : "hidden md:grid [@media(scripting:none)]:grid")}
      >
        {filters.categoria ? <input type="hidden" name="categoria" value={filters.categoria} /> : null}
        {filters.segmento ? <input type="hidden" name="segmento" value={filters.segmento} /> : null}
        <Select id="uf" label="Estado" value={filters.uf ?? ""} options={ufs.map((u) => ({ value: u, label: u }))} onChange={(v) => onSelect("uf", v)} />
        <Select id="status" label="Status" value={filters.status ?? ""} options={status} onChange={(v) => onSelect("status", v)} />
        <Select id="cliente" label="Cliente" value={filters.cliente ?? ""} options={clientes.map((c) => ({ value: c, label: c }))} onChange={(v) => onSelect("cliente", v)} />
        <div>
          <label htmlFor="q" className={LABEL}>Buscar</label>
          <input
            id="q"
            name="q"
            type="search"
            value={qInput}
            onChange={(e) => onSearch(e.target.value)}
            className={CONTROL}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-4">
          {jsActive ? null : <Button type="submit">Filtrar</Button>}
          {showClear ? (
            jsActive ? (
              <Button variant="ghost" onClick={onClear}>Limpar filtros</Button>
            ) : (
              <Button variant="ghost" href="/obras">Limpar filtros</Button>
            )
          ) : null}
        </div>
      </form>
    </div>
  );
}
