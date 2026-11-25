import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getContentSource } from "@/lib/content/source";
import type { Segmento } from "@/lib/content/types";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Serviços",
  description: "Serviços de obras civis e infraestrutura executados pela DT Construtora.",
  path: "/servicos",
});

const SEGMENTOS: Segmento[] = ["obras-civis", "infraestrutura"];

export default async function ServicosPage() {
  const servicos = await getContentSource().getServicos();

  return (
    <>
      <section className="bg-surface-inverse py-16 text-text-on-inverse md:py-24">
        <Container>
          <Eyebrow className="text-text-on-inverse-secondary">O que fazemos</Eyebrow>
          <h1 className="mt-4 text-3xl text-text-on-inverse md:text-5xl">Serviços</h1>
          <p className="mt-6 max-w-2xl text-lg text-text-on-inverse-secondary">
            Do projeto à entrega, com equipe e equipamentos próprios.
          </p>
        </Container>
      </section>
      {SEGMENTOS.map((segmento) => {
        const grupo = servicos.filter((s) => s.segmento === segmento);
        if (grupo.length === 0) return null;
        return (
          <section key={segmento} className="py-16 md:py-24">
            <Container>
              <h2 className="text-2xl text-text-primary md:text-3xl">{SEGMENTO_LABEL[segmento]}</h2>
              <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {grupo.map((s) => (
                  <li
                    key={s.slug}
                    className="flex flex-col rounded-card border border-border bg-surface-default p-6"
                  >
                    <h3 className="text-xl font-bold text-text-primary">{s.titulo}</h3>
                    <p className="mt-2 flex-1 text-base text-text-secondary">{s.resumo}</p>
                    <Link
                      href={`/servicos/${s.slug}`}
                      aria-label={`Ver serviço: ${s.titulo}`}
                      className="mt-6 inline-flex min-h-12 items-center font-semibold text-brand-primary underline underline-offset-4"
                    >
                      Ver serviço
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        );
      })}
    </>
  );
}
