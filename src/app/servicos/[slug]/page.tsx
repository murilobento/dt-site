import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getContentSource } from "@/lib/content/source";
import { leadHref } from "@/lib/links";
import { SEGMENTO_LABEL } from "@/lib/segmentos";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const servicos = await getContentSource().getServicos();
  return servicos.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const servico = await getContentSource().getServico(slug);
  if (!servico) return {};
  return {
    title: `${servico.seo?.titulo ?? servico.titulo} | DT Construtora`,
    description: servico.seo?.descricao ?? servico.resumo,
  };
}

export default async function ServicoPage({ params }: Props) {
  const { slug } = await params;
  const source = getContentSource();
  const servico = await source.getServico(slug);
  if (!servico) notFound();
  const obras = await source.getObrasPorServico(servico.slug);

  return (
    <>
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

      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-2xl text-text-primary md:text-3xl">Escopo</h2>
          <ul className="mt-8 max-w-3xl list-disc space-y-2 pl-6 text-base text-text-primary">
            {servico.escopo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface-muted py-16 md:py-24">
        <Container>
          <h2 className="text-2xl text-text-primary md:text-3xl">Etapas</h2>
          <ol className="mt-8 max-w-3xl list-decimal space-y-4 pl-6 text-base text-text-primary">
            {servico.etapas.map((etapa) => (
              <li key={etapa.titulo}>
                <strong className="font-bold">{etapa.titulo}</strong>
                <p className="mt-1 text-text-secondary">{etapa.descricao}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-2xl text-text-primary md:text-3xl">Equipamentos</h2>
          <ul className="mt-8 max-w-3xl list-disc space-y-2 pl-6 text-base text-text-primary">
            {servico.equipamentos.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Container>
      </section>

      {obras.length > 0 && (
        <section className="bg-surface-muted py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Obras relacionadas</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {obras.map((obra) => (
                <ProjectCard key={obra.slug} obra={obra} />
              ))}
            </div>
          </Container>
        </section>
      )}

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
