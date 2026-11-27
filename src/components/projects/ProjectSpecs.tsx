import Link from "next/link";
import type { ReactNode } from "react";
import type { Obra, Servico } from "@/lib/content/types";
import { formatNumber, formatPeriodo } from "@/lib/format";

type Row = { label: string; value: ReactNode };

/** Ficha técnica em `<dl>`. Linhas sem dado são omitidas por inteiro. */
export function ProjectSpecs({
  obra,
  servicos = [],
  compact = false,
}: {
  obra: Obra;
  servicos?: Pick<Servico, "slug" | "titulo">[];
  /** Só as linhas que a faixa de metadados da ficha não mostra (cliente e serviços). */
  compact?: boolean;
}) {
  const rows: Row[] = [];
  if (!compact && obra.cidade && obra.uf) rows.push({ label: "Local", value: `${obra.cidade}/${obra.uf}` });
  if (obra.cliente?.nome) rows.push({ label: "Cliente", value: obra.cliente.nome });
  if (!compact) rows.push({ label: "Período", value: formatPeriodo(obra.inicio, obra.termino) });
  if (!compact && obra.extensao) {
    rows.push({
      label: obra.extensao.unidade === "km" ? "Extensão" : "Área",
      value: `${formatNumber(obra.extensao.valor)} ${obra.extensao.unidade}`,
    });
  }
  const links = obra.servicos
    .map((slug) => servicos.find((s) => s.slug === slug))
    .filter((s): s is Pick<Servico, "slug" | "titulo"> => Boolean(s));
  if (links.length > 0) {
    rows.push({
      label: "Serviços",
      value: (
        <ul className="flex flex-col gap-1">
          {links.map((s) => (
            <li key={s.slug}>
              <Link href={`/servicos/${s.slug}`} className="underline underline-offset-4 hover:text-secondary">
                {s.titulo}
              </Link>
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (!compact) rows.push({ label: "Status", value: obra.status === "em-andamento" ? "Em andamento" : "Concluída" });

  if (rows.length === 0) return null;
  const lista = (
    <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <div key={r.label} className="border-t border-outline-variant pt-4">
          <dt className="text-sm font-semibold text-on-surface-variant">{r.label}</dt>
          <dd className="mt-1 text-base text-on-surface">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
  if (!compact) return lista;
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-headline text-headline-md text-on-surface">Ficha técnica</h2>
      {lista}
    </section>
  );
}
