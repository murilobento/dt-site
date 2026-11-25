import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Segmento, Servico } from "@/lib/content/types";

const SEGMENTOS: { id: Segmento; titulo: string; descricao: string }[] = [
  {
    id: "obras-civis",
    titulo: "Obras civis",
    descricao: "Edificações, reformas e estruturas executadas com controle de prazo e qualidade.",
  },
  {
    id: "infraestrutura",
    titulo: "Infraestrutura",
    descricao: "Conservação, restauração e construção de rodovias, com equipe e equipamentos próprios.",
  },
];

export function SegmentCards({ servicos }: { servicos: Servico[] }) {
  return (
    <section className="reveal bg-surface-muted py-16 md:py-24">
      <Container>
        <SectionHeader eyebrow="O que fazemos" title="Dois segmentos, uma só equipe" />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SEGMENTOS.map((seg) => (
            <article key={seg.id} className="rounded-card border border-border bg-surface-default p-8">
              <h3 className="font-display text-xl font-extrabold text-text-primary">{seg.titulo}</h3>
              <p className="mt-4 text-base text-text-secondary">{seg.descricao}</p>
              <ul className="mt-6 divide-y divide-border border-t border-border">
                {servicos
                  .filter((s) => s.segmento === seg.id)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/servicos/${s.slug}`}
                        className="flex min-h-12 items-center justify-between gap-4 py-2 text-base font-medium text-text-primary hover:underline underline-offset-4"
                      >
                        {s.titulo}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
