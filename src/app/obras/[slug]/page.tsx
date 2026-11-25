import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BeforeAfter } from "@/components/projects/BeforeAfter";
import { Gallery } from "@/components/projects/Gallery";
import { ProjectSpecs } from "@/components/projects/ProjectSpecs";
import { ProjectViewTracker } from "@/components/projects/ProjectViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getContentSource } from "@/lib/content/source";
import type { Segmento } from "@/lib/content/types";
import { leadHref } from "@/lib/links";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import { breadcrumbJsonLd, obraJsonLd } from "@/lib/seo/jsonld";
import { getSiteUrl } from "@/lib/site";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

const TIME_LABEL: Record<Segmento, string> = {
  "obras-civis": "Obras Civis",
  infraestrutura: "Infraestrutura",
};

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

      <section className="relative isolate overflow-hidden bg-surface-inverse text-text-on-inverse">
        <Image
          src={obra.capa.url}
          alt={obra.capa.alt}
          fill
          sizes="100vw"
          preload
          fetchPriority="high"
          className="-z-20 object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-surface-inverse/75" />
        <Container className="py-12 md:py-16">
          <div className="max-w-3xl">
            <Eyebrow className="text-text-on-inverse-secondary">{SEGMENTO_LABEL[obra.segmento]}</Eyebrow>
            <h1 className="mt-4 text-3xl text-text-on-inverse md:text-5xl">{obra.titulo}</h1>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <h2 className="mb-8 text-2xl text-text-primary md:text-3xl">Ficha técnica</h2>
          <ProjectSpecs obra={obra} servicos={todosServicos} />
        </Container>
      </section>

      {obra.diferencialTecnico && (
        <section className="bg-surface-muted py-12 md:py-16">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Diferencial técnico</h2>
            <p className="mt-4 max-w-3xl text-lg text-text-primary">{obra.diferencialTecnico}</p>
          </Container>
        </section>
      )}

      <section className="py-12 md:py-16">
        <Container>
          <h2 className="text-2xl text-text-primary md:text-3xl">Sobre a obra</h2>
          <p className="mt-4 max-w-3xl text-base text-text-primary">{obra.descricao}</p>
        </Container>
      </section>

      {obra.galeria.length > 0 && (
        <section className="pb-12 md:pb-16">
          <Container>
            <h2 className="mb-8 text-2xl text-text-primary md:text-3xl">Galeria</h2>
            <Gallery fotos={obra.galeria} />
          </Container>
        </section>
      )}

      {obra.antesDepois && (
        <section className="pb-12 md:pb-16">
          <Container>
            <h2 className="mb-8 text-2xl text-text-primary md:text-3xl">Antes e depois</h2>
            <BeforeAfter antesDepois={obra.antesDepois} />
          </Container>
        </section>
      )}

      <section className="bg-surface-inverse py-16 text-text-on-inverse md:py-24">
        <Container className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <h2 className="max-w-xl text-2xl text-text-on-inverse md:text-3xl">
            Tem uma obra parecida? Fale com nosso time de {TIME_LABEL[obra.segmento]}.
          </h2>
          <Button href={leadHref(obra.segmento, obra.slug)} inverse>
            Solicitar proposta
          </Button>
        </Container>
      </section>
    </>
  );
}
