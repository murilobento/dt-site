import type { Metadata } from "next";
import { LeadForm } from "@/components/forms/LeadForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getContentSource } from "@/lib/content/source";
import type { Segmento } from "@/lib/content/types";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Solicitar proposta",
  description: "Conte sobre a obra e a equipe comercial da DT responde em até 2 dias úteis.",
  path: "/contato/comercial",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ComercialPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const seg = first(params.segmento);
  const segmentoInicial = seg && Object.hasOwn(SEGMENTO_LABEL, seg) ? (seg as Segmento) : undefined;
  const origem = first(params.origem)?.trim().slice(0, 100) || undefined;
  const config = await getContentSource().getConfiguracoes();

  return (
    <>
      <section className="bg-surface-inverse py-16 text-text-on-inverse md:py-24">
        <Container>
          <Eyebrow className="text-text-on-inverse-secondary">Comercial</Eyebrow>
          <h1 className="mt-4 text-3xl text-text-on-inverse md:text-5xl">Solicitar proposta</h1>
          <p className="mt-6 max-w-2xl text-lg text-text-on-inverse-secondary">
            Conte sobre a obra. Nossa equipe responde em até 2 dias úteis.
          </p>
        </Container>
      </section>
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <LeadForm
              segmentoInicial={segmentoInicial}
              origem={origem}
              whatsappHref={buildWhatsAppUrl(config.whatsapp, "/contato/comercial")}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
