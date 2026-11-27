import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { HOME_COPY } from "@/lib/copy/home";
import { SERVICOS_COPY } from "@/lib/copy/servicos";
import type { CategoriaServico, Servico } from "@/lib/content/types";
import { disciplinaDoServico } from "@/lib/disciplinas";
import { SERVICO_ICONES } from "@/lib/icons";
import { leadHref } from "@/lib/links";
import { cn } from "@/lib/ui/cn";

const CATEGORIAS: CategoriaServico[] = ["infraestrutura", "edificacoes", "consultoria"];

function ServicoCard({ servico, comImagem }: { servico: Servico; comImagem: boolean }) {
  const Icone = servico.icone ? SERVICO_ICONES[servico.icone] : undefined;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest">
      {comImagem && (
        <div className="relative aspect-video w-full overflow-hidden bg-primary-container">
          <Image
            src={servico.imagem.url}
            alt={servico.imagem.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5 md:p-6">
        <div className="flex flex-col gap-3">
          <header className="flex items-center gap-3">
            {Icone && (
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm bg-surface-container-low text-primary">
                <Icone aria-hidden="true" className="size-6" />
              </span>
            )}
            <div>
              <h3 className="font-title text-title-lg text-on-surface">{servico.titulo}</h3>
              {servico.subtitulo && (
                <p className="font-mono text-mono-md text-on-surface-variant">{servico.subtitulo}</p>
              )}
            </div>
          </header>
          <p className="font-body text-body-md text-pretty text-on-surface-variant">{servico.resumo}</p>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-outline-variant pt-3">
          <Link
            href={leadHref({
              segmento: servico.segmento,
              disciplina: disciplinaDoServico(servico),
              origem: servico.slug,
            })}
            className="inline-flex items-center gap-1 font-label text-label-lg text-primary underline-offset-4 hover:underline"
          >
            {HOME_COPY.servicos.cta[servico.categoria]}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href={`/servicos/${servico.slug}`}
            aria-label={`${SERVICOS_COPY.verServico}: ${servico.titulo}`}
            className="font-label text-label-lg text-on-surface-variant underline underline-offset-4 hover:text-primary"
          >
            {SERVICOS_COPY.verServico}
          </Link>
        </footer>
      </div>
    </article>
  );
}

const FUNDO: Record<CategoriaServico, string> = {
  infraestrutura: "",
  edificacoes: "border-y border-outline-variant bg-surface-container-low",
  consultoria: "",
};

/** Três seções empilhadas (âncoras #infraestrutura, #edificacoes, #consultoria), como no layout. */
export function ServicosCatalogo({ servicos }: { servicos: Servico[] }) {
  return (
    <>
      {CATEGORIAS.map((categoria) => {
        const itens = servicos.filter((s) => s.categoria === categoria);
        if (itens.length === 0) return null;
        const copy = SERVICOS_COPY.categorias[categoria];
        const destaque = "destaque" in copy ? copy.destaque : undefined;
        const titleId = `${categoria}-titulo`;
        return (
          <section
            key={categoria}
            id={categoria}
            aria-labelledby={titleId}
            className={cn("scroll-mt-20 py-12 md:scroll-mt-24 md:py-section", FUNDO[categoria])}
          >
            <Container className="flex flex-col gap-8">
              <div className="flex flex-col justify-between gap-4 border-b border-outline-variant pb-4 md:flex-row md:items-end">
                <div>
                  <h2
                    id={titleId}
                    className="font-headline text-headline-lg-mobile text-balance text-on-surface lg:text-headline-lg"
                  >
                    {copy.titulo}
                  </h2>
                  <p className="font-body text-body-md text-on-surface-variant">{copy.lead}</p>
                </div>
                {destaque && <span className="shrink-0 font-mono text-mono-md text-secondary">{destaque}</span>}
              </div>
              <div
                className={cn(
                  "grid grid-cols-1 items-stretch gap-6",
                  categoria === "infraestrutura" ? "md:grid-cols-2" : "md:grid-cols-3",
                )}
              >
                {itens.map((s) => (
                  <ServicoCard key={s.slug} servico={s} comImagem={categoria === "infraestrutura"} />
                ))}
              </div>
            </Container>
          </section>
        );
      })}
    </>
  );
}
