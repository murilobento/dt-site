import { Button } from "@/components/ui/Button";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import type { ObraFilters } from "@/lib/obras/filter";
import type { Segmento, StatusObra, UF } from "@/lib/content/types";

export type FilterKey = keyof ObraFilters;

type FilterBarProps = {
  filters: ObraFilters;
  /** Texto atual do campo de busca (pode estar à frente do filtro aplicado, por causa do debounce). */
  qInput: string;
  ufs: UF[];
  clientes: string[];
  /** Com JS ativo o envio é desnecessário e o botão "Filtrar" some. */
  jsActive: boolean;
  showClear: boolean;
  onSelect: (key: Exclude<FilterKey, "q">, value: string) => void;
  onSearch: (value: string) => void;
  onClear: () => void;
};

const CONTROL =
  "min-h-12 w-full rounded-control border border-border bg-surface-default px-3 text-base text-text-primary";
const LABEL = "mb-1 block text-sm font-semibold text-text-primary";

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
  filters, qInput, ufs, clientes, jsActive, showClear, onSelect, onSearch, onClear,
}: FilterBarProps) {
  const segmentos = (Object.keys(SEGMENTO_LABEL) as Segmento[]).map((s) => ({ value: s, label: SEGMENTO_LABEL[s] }));
  const status: { value: StatusObra; label: string }[] = [
    { value: "em-andamento", label: "Em andamento" },
    { value: "concluida", label: "Concluída" },
  ];
  return (
    <form
      method="get"
      action="/obras"
      role="search"
      aria-label="Filtrar obras"
      onSubmit={(e) => e.preventDefault()}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <Select id="segmento" label="Segmento" value={filters.segmento ?? ""} options={segmentos} onChange={(v) => onSelect("segmento", v)} />
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
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-5">
        {jsActive ? null : <Button type="submit">Filtrar</Button>}
        {showClear ? (
          <Button variant="ghost" onClick={onClear}>Limpar filtros</Button>
        ) : null}
      </div>
    </form>
  );
}
