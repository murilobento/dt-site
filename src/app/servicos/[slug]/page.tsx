import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServicoSections } from "@/components/services/ServicoSections";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getContentSource } from "@/lib/content/source";
import { leadHref } from "@/lib/links";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
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
      <section className="relative isolate overflow-hidden bg-surface-inverse text-text-on-inverse">
        <Image
          src={servico.imagem.url}
          alt={servico.imagem.alt}
          fill
          sizes="100vw"
          preload
          fetchPriority="high"
          className="-z-20 object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-surface-inverse/75" />
        <Container className="py-16 md:py-24">
          <div className="max-w-3xl">
            <Eyebrow className="text-text-on-inverse-secondary">{SEGMENTO_LABEL[servico.segmento]}</Eyebrow>
            <h1 className="mt-4 text-3xl text-text-on-inverse md:text-5xl">{servico.titulo}</h1>
            <p className="mt-6 max-w-2xl text-lg text-text-on-inverse-secondary">{servico.resumo}</p>
          </div>
        </Container>
      </section>

      <ServicoSections servico={servico} obras={obras} />

      <section className="bg-surface-inverse py-16 text-text-on-inverse md:py-24">
        <Container className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <h2 className="max-w-xl text-2xl text-text-on-inverse md:text-3xl">Precisa deste serviço?</h2>
          <Button href={leadHref(servico.segmento, servico.slug)} inverse>
            Solicitar proposta
          </Button>
        </Container>
      </section>
    </>
  );
}
