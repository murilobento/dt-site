import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServicoSections } from "@/components/services/ServicoSections";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getContentSource } from "@/lib/content/source";
import { HOME_COPY } from "@/lib/copy/home";
import { disciplinaDoServico } from "@/lib/disciplinas";
import { leadHref } from "@/lib/links";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const servicos = await getContentSource().getServicos();
  return servicos.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const servico = await getContentSource().getServico(slug);
  if (!servico) return {};
  return buildMetadata({
    title: servico.seo?.titulo ?? servico.titulo,
    description: servico.seo?.descricao ?? servico.resumo,
    path: `/servicos/${servico.slug}`,
    image: { url: servico.imagem.url, width: servico.imagem.width, height: servico.imagem.height, alt: servico.imagem.alt },
  });
}

export default async function ServicoPage({ params }: Props) {
  const { slug } = await params;
  const source = getContentSource();
  const servico = await source.getServico(slug);
  if (!servico) notFound();
  const obras = await source.getObrasPorServico(servico.slug);
  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", url: `${siteUrl}/` },
          { name: "Serviços", url: `${siteUrl}/servicos` },
          { name: servico.titulo, url: `${siteUrl}/servicos/${servico.slug}` },
        ])}
      />
      <section className="relative isolate overflow-hidden border-b border-primary-container bg-brand-navy text-on-primary">
        <Image
          src={servico.imagem.url}
          alt={servico.imagem.alt}
          fill
          sizes="100vw"
          preload
          fetchPriority="high"
          className="-z-20 object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-navy/85" />
        <Container className="flex flex-col gap-4 py-12 md:py-16">
          <span className="inline-flex items-center self-start rounded-sm bg-secondary-container px-3 py-1 font-label text-label-sm text-on-secondary-container">
            {HOME_COPY.servicos.abas[servico.categoria]}
          </span>
          <h1 className="max-w-4xl font-display text-display-lg-mobile text-balance text-on-primary lg:text-display-lg">
            {servico.titulo}
          </h1>
          {servico.subtitulo && <p className="font-mono text-mono-md text-on-primary-container">{servico.subtitulo}</p>}
          <p className="max-w-2xl font-body text-body-lg text-pretty text-on-primary-container">{servico.resumo}</p>
        </Container>
      </section>

      <ServicoSections servico={servico} obras={obras} />

      <section className="pb-section">
        <Container>
          <div className="grid items-center gap-6 rounded-lg bg-primary-container p-6 md:p-8 lg:grid-cols-12 lg:gap-8 lg:p-12">
            <h2 className="font-headline text-headline-lg-mobile text-balance text-white lg:col-span-8 lg:text-headline-lg">
              Precisa deste serviço?
            </h2>
            <div className="flex lg:col-span-4 lg:justify-end">
              <Button
                href={leadHref({ segmento: servico.segmento, disciplina: disciplinaDoServico(servico), origem: servico.slug })}
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
