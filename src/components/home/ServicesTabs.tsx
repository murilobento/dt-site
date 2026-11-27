import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { HOME_COPY } from "@/lib/copy/home";
import { SERVICO_ICONES } from "@/lib/icons";
import { leadHref } from "@/lib/links";
import { cn } from "@/lib/ui/cn";
import type { CategoriaServico, Servico } from "@/lib/content/types";

const CATEGORIAS: CategoriaServico[] = ["infraestrutura", "edificacoes", "consultoria"];

function ServicoCard({ servico }: { servico: Servico }) {
  const Icone = servico.icone ? SERVICO_ICONES[servico.icone] : undefined;
  return (
    <article className="flex h-full flex-col justify-between gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
      <div className="flex flex-col gap-3">
        <header className="flex items-center gap-3">
          {Icone && (
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm bg-surface-container-low text-primary">
              <Icone aria-hidden="true" className="size-6" />
            </span>
          )}
          <div>
            <h3 className="font-title text-title-lg text-on-surface">
              <Link href={`/servicos/${servico.slug}`} className="underline-offset-4 hover:underline">
                {servico.titulo}
              </Link>
            </h3>
            {servico.subtitulo && <p className="font-label text-label-sm text-on-surface-variant">{servico.subtitulo}</p>}
          </div>
        </header>
        <p className="font-body text-body-md text-pretty text-on-surface-variant">{servico.resumo}</p>
      </div>
      <footer className="border-t border-outline-variant pt-3">
        <Link
          href={leadHref(servico.segmento, servico.slug)}
          className="inline-flex items-center gap-1 font-label text-label-lg text-primary underline-offset-4 hover:underline"
        >
          {HOME_COPY.servicos.cta[servico.categoria]}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </footer>
    </article>
  );
}

export function ServicesTabs({ servicos }: { servicos: Servico[] }) {
  const { titulo, lead, catalogo, tablist, abas } = HOME_COPY.servicos;
  const tabs: TabItem[] = CATEGORIAS.flatMap((categoria) => {
    const itens = servicos.filter((s) => s.categoria === categoria);
    if (itens.length === 0) return [];
    return [
      {
        id: categoria,
        label: abas[categoria],
        content: (
          <div
            className={cn(
              "grid grid-cols-1 items-stretch gap-6",
              categoria === "infraestrutura" ? "md:grid-cols-2" : "md:grid-cols-3",
            )}
          >
            {itens.map((s) => (
              <ServicoCard key={s.slug} servico={s} />
            ))}
          </div>
        ),
      },
    ];
  });
  if (tabs.length === 0) return null;

  return (
    <Reveal className="py-12 md:py-section">
      <Container className="flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="font-headline text-headline-lg-mobile text-balance text-on-surface lg:text-headline-lg">{titulo}</h2>
            <p className="font-body text-body-lg text-pretty text-on-surface-variant">{lead}</p>
          </div>
          <Link
            href="/servicos"
            className="inline-flex shrink-0 items-center gap-1.5 self-start whitespace-nowrap font-label text-label-lg text-primary underline-offset-4 hover:underline md:self-auto"
          >
            {catalogo}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <Tabs label={tablist} tabs={tabs} />
      </Container>
    </Reveal>
  );
}
