import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfter } from "@/components/projects/BeforeAfter";
import { Gallery } from "@/components/projects/Gallery";
import { ProjectSpecs } from "@/components/projects/ProjectSpecs";
import { ProjectViewTracker } from "@/components/projects/ProjectViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getContentSource } from "@/lib/content/source";
import type { Obra, Segmento } from "@/lib/content/types";
import { disciplinaDaObra } from "@/lib/disciplinas";
import { leadHref } from "@/lib/links";
import { CATEGORIA_OBRA_LABEL } from "@/lib/obras/categorias";
import { formatDecimal, formatPeriodo } from "@/lib/format";
import { cn } from "@/lib/ui/cn";
import { breadcrumbJsonLd, obraJsonLd } from "@/lib/seo/jsonld";
import { getSiteUrl } from "@/lib/site";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

const TIME_LABEL: Record<Segmento, string> = {
  "obras-civis": "Obras Civis",
  infraestrutura: "Infraestrutura",
};

/** Itens da faixa de metadados; os sem dado ficam de fora. */
function obraMetadados(obra: Obra): { label: string; value: string }[] {
  const itens: { label: string; value: string }[] = [{ label: "Local", value: `${obra.cidade}/${obra.uf}` }];
  if (obra.codigoContrato) itens.push({ label: "Contrato", value: obra.codigoContrato });
  if (obra.extensao) {
    itens.push({
      label: obra.extensao.unidade === "km" ? "Extensão" : "Área",
      value: `${formatDecimal(obra.extensao.valor)} ${obra.extensao.unidade}`,
    });
  }
  itens.push({
    label: "Status",
    value:
      obra.status === "concluida"
        ? `Concluída${obra.termino ? ` • ${obra.termino.slice(0, 4)}` : ""}`
        : `Em andamento • ${formatPeriodo(obra.inicio)}`,
  });
  if (obra.norma) itens.push({ label: "Normativa", value: obra.norma });
  return itens;
}

export async function generateStaticParams() {
  const obras = await getContentSource().getObras();
  return obras.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const obra = await getContentSource().getObra(slug);
  if (!obra) return {};
  return buildMetadata({
    title: obra.seo?.titulo ?? obra.titulo,
    description: obra.seo?.descricao ?? obra.descricao.slice(0, 155),
    path: `/obras/${obra.slug}`,
    image: { url: obra.capa.url, width: obra.capa.width, height: obra.capa.height, alt: obra.capa.alt },
  });
}

export default async function ObraPage({ params }: Props) {
  const { slug } = await params;
  const source = getContentSource();
  const obra = await source.getObra(slug);
  if (!obra) notFound();
  const todosServicos = await source.getServicos();
  const siteUrl = getSiteUrl();
  const meta = obraMetadados(obra);
  const temTexto = Boolean(obra.desafio || obra.solucao);
  const temQuantitativos = Boolean(obra.quantitativos?.length);
  const temEtapas = Boolean(obra.etapas?.length);

  return (
    <>
      <JsonLd data={obraJsonLd(obra, siteUrl)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", url: `${siteUrl}/` },
          { name: "Obras", url: `${siteUrl}/obras` },
          { name: obra.titulo, url: `${siteUrl}/obras/${obra.slug}` },
        ])}
      />
      <ProjectViewTracker slug={obra.slug} />

      <section className="border-b border-primary-container bg-brand-navy py-10 text-on-primary md:py-12">
        <Container className="flex flex-col gap-4">
          <Link
            href="/obras"
            className="inline-flex items-center gap-2 self-start font-label text-label-lg text-on-primary-container transition-colors duration-state-change hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
            Voltar ao portfólio de obras
          </Link>
          <span className="inline-flex items-center self-start rounded-sm bg-secondary-container px-2.5 py-0.5 font-label text-label-sm text-on-secondary-container">
            {CATEGORIA_OBRA_LABEL[obra.categoria]}
          </span>
          <h1 className="max-w-4xl font-display text-display-lg-mobile text-balance text-on-primary lg:text-display-lg">
            {obra.titulo}
          </h1>
          <p className="max-w-3xl font-body text-body-lg text-pretty text-on-primary-container">{obra.descricao}</p>
        </Container>
      </section>

      <section aria-label="Dados da obra" className="border-b border-outline-variant bg-surface-container-lowest">
        <Container>
          <dl className="grid grid-cols-2 gap-6 py-6 md:py-8 lg:grid-flow-col lg:auto-cols-fr">
            {meta.map((m, i) => (
              <div key={m.label} className={cn("flex flex-col gap-1", i > 0 && "lg:border-l lg:border-outline-variant lg:pl-6")}>
                <dt className="font-label text-label-sm uppercase text-on-surface-variant">{m.label}</dt>
                <dd className="font-title text-title-lg tabular-nums text-primary">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-10 md:py-section">
        <Container className="flex flex-col gap-10 md:gap-12">
          <figure>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-outline-variant bg-brand-navy">
              <Image
                src={obra.capa.url}
                alt={obra.capa.alt}
                fill
                sizes="(min-width: 80rem) 1232px, 100vw"
                preload
                fetchPriority="high"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 font-label text-label-sm text-on-surface-variant">{obra.capa.alt}</figcaption>
          </figure>

          {temTexto || temQuantitativos ? (
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
              {temTexto && (
                <div className={cn("flex flex-col gap-8", temQuantitativos ? "lg:col-span-7" : "lg:col-span-12")}>
                  {obra.desafio && (
                    <div className="flex flex-col gap-3">
                      <h2 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">Desafio</h2>
                      <p className="max-w-prose font-body text-body-lg text-pretty text-on-surface-variant">{obra.desafio}</p>
                    </div>
                  )}
                  {obra.solucao && (
                    <div className="flex flex-col gap-3">
                      <h2 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">Solução</h2>
                      <p className="max-w-prose font-body text-body-lg text-pretty text-on-surface-variant">{obra.solucao}</p>
                    </div>
                  )}
                </div>
              )}
              {temQuantitativos && (
                <aside
                  aria-labelledby="quantitativos"
                  className={cn(
                    "flex flex-col gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-6",
                    temTexto ? "lg:col-span-5" : "lg:col-span-12",
                  )}
                >
                  <h2 id="quantitativos" className="border-b border-outline-variant pb-3 font-title text-title-lg text-on-surface">
                    Quantitativos executados
                  </h2>
                  <dl className="grid grid-cols-1 divide-y divide-outline-variant">
                    {obra.quantitativos!.map((q) => (
                      <div key={q.rotulo} className="flex items-center justify-between gap-4 py-3">
                        <dt className="font-body text-body-md text-on-surface-variant">{q.rotulo}</dt>
                        <dd className="text-right font-mono text-mono-md tabular-nums text-primary">{q.valor}</dd>
                      </div>
                    ))}
                  </dl>
                </aside>
              )}
            </div>
          ) : null}

          <ProjectSpecs obra={obra} servicos={todosServicos} compact />
        </Container>
      </section>

      {temEtapas && (
        <section className="border-y border-outline-variant bg-surface-container-low py-10 md:py-section">
          <Container className="flex flex-col gap-8">
            <h2 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">Etapas da execução</h2>
            <ol className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
              {obra.etapas!.map((e, i) => (
                <li key={e.titulo} className="flex flex-col gap-2 rounded-md border border-outline-variant bg-surface-container-lowest p-6">
                  <span aria-hidden="true" className="font-mono text-mono-md text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-title text-title-lg text-on-surface">{e.titulo}</h3>
                  <p className="font-body text-body-md text-pretty text-on-surface-variant">{e.descricao}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {obra.diferencialTecnico && (
        <section className="py-10 md:py-section">
          <Container>
            <h2 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">Diferencial técnico</h2>
            <p className="mt-4 max-w-3xl font-body text-body-lg text-on-surface-variant">{obra.diferencialTecnico}</p>
          </Container>
        </section>
      )}

      {obra.galeria.length > 0 && (
        <section className="pb-10 md:pb-section">
          <Container>
            <h2 className="mb-8 font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">Galeria</h2>
            <Gallery fotos={obra.galeria} />
          </Container>
        </section>
      )}

      {obra.antesDepois && (
        <section className="pb-10 md:pb-section">
          <Container>
            <h2 className="mb-8 font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">Antes e depois</h2>
            <BeforeAfter antesDepois={obra.antesDepois} />
          </Container>
        </section>
      )}

      <section className="pb-section">
        <Container>
          <div className="grid items-center gap-6 rounded-lg bg-primary-container p-6 md:p-8 lg:grid-cols-12 lg:gap-8 lg:p-12">
            <h2 className="font-headline text-headline-lg-mobile text-balance text-white lg:col-span-8 lg:text-headline-lg">
              Tem uma obra parecida? Fale com nosso time de {TIME_LABEL[obra.segmento]}.
            </h2>
            <div className="flex lg:col-span-4 lg:justify-end">
              <Button
                href={leadHref({ segmento: obra.segmento, disciplina: disciplinaDaObra(obra.categoria), origem: obra.slug })}
                variant="accent"
                inverse
                className="w-full sm:w-auto"
              >
                Solicitar proposta
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
