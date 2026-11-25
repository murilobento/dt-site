import Link from "next/link";
import type { ReactNode } from "react";
import type { Obra, Servico } from "@/lib/content/types";
import { formatNumber, formatPeriodo } from "@/lib/format";

type Row = { label: string; value: ReactNode };

/** Ficha técnica em `<dl>`. Linhas sem dado são omitidas por inteiro. */
export function ProjectSpecs({ obra, servicos = [] }: { obra: Obra; servicos?: Pick<Servico, "slug" | "titulo">[] }) {
  const rows: Row[] = [];
  if (obra.cidade && obra.uf) rows.push({ label: "Local", value: `${obra.cidade}/${obra.uf}` });
  if (obra.cliente?.nome) rows.push({ label: "Cliente", value: obra.cliente.nome });
  rows.push({ label: "Período", value: formatPeriodo(obra.inicio, obra.termino) });
  if (obra.extensao) {
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
              <Link href={`/servicos/${s.slug}`} className="underline underline-offset-4 hover:text-brand-primary-hover">
                {s.titulo}
              </Link>
            </li>
          ))}
        </ul>
      ),
    });
  }
  rows.push({ label: "Status", value: obra.status === "em-andamento" ? "Em andamento" : "Concluída" });

  return (
    <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <div key={r.label} className="border-t border-border pt-4">
          <dt className="text-sm font-semibold text-text-secondary">{r.label}</dt>
          <dd className="mt-1 text-base text-text-primary">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
