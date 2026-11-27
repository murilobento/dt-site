import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ServicosCatalogo } from "@/components/services/ServicosCatalogo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getContentSource } from "@/lib/content/source";
import { SERVICOS_COPY } from "@/lib/copy/servicos";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Serviços",
  description: "Serviços de obras civis e infraestrutura executados pela DT Construtora.",
  path: "/servicos",
});

export default async function ServicosPage() {
  const servicos = await getContentSource().getServicos();
  const { hero, cta } = SERVICOS_COPY;

  return (
    <>
      <section className="border-b border-primary-container bg-brand-navy py-12 text-on-primary md:py-16">
        <Container className="flex flex-col gap-4">
          <span className="inline-flex items-center self-start rounded-sm bg-secondary-container px-3 py-1 font-label text-label-sm text-on-secondary-container">
            {hero.selo}
          </span>
          <h1 className="max-w-4xl font-display text-display-lg-mobile text-balance text-on-primary lg:text-display-lg">
            {hero.titulo}
          </h1>
          <p className="max-w-2xl font-body text-body-lg text-pretty text-on-primary-container">{hero.lead}</p>
        </Container>
      </section>

      <ServicosCatalogo servicos={servicos} />

      <section className="pb-section pt-12 md:pt-section">
        <Container>
          <div className="grid items-center gap-6 rounded-lg bg-primary-container p-6 md:p-8 lg:grid-cols-12 lg:gap-8 lg:p-12">
            <div className="flex flex-col gap-3 lg:col-span-8">
              <h2 className="font-headline text-headline-lg-mobile text-balance text-white lg:text-headline-lg">{cta.titulo}</h2>
              <p className="max-w-prose font-body text-body-lg text-pretty text-on-primary-container">{cta.lead}</p>
            </div>
            <div className="flex lg:col-span-4 lg:justify-end">
              <Button href="/contato" variant="accent" inverse className="w-full sm:w-auto">
                <Mail aria-hidden="true" className="size-5" />
                {cta.botao}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
