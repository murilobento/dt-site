import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { leadHref } from "@/lib/links";
import { getContentSource } from "@/lib/content/source";
import { clientesDasObras, parseObraFilters } from "@/lib/obras/filter";
import { ObrasExplorer } from "./ObrasExplorer";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Obras",
  description: "Obras civis e de infraestrutura executadas e em andamento pela DT Construtora.",
  path: "/obras",
});

type SearchParams = Record<string, string | string[] | undefined>;

function toURLSearchParams(sp: SearchParams): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const first = Array.isArray(v) ? v[0] : v;
    if (first !== undefined) out.set(k, first);
  }
  return out;
}

export default async function ObrasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const source = getContentSource();
  const [obras, servicos, sp] = await Promise.all([source.getObras(), source.getServicos(), searchParams]);
  const initialFilters = parseObraFilters(toURLSearchParams(sp), { clientes: clientesDasObras(obras) });
  const servicoNomes = Object.fromEntries(servicos.map((s) => [s.slug, s.titulo]));

  return (
    <>
      <section className="border-b border-primary-container bg-brand-navy py-12 text-on-primary md:py-16">
        <Container className="flex flex-col gap-4">
          <span className="inline-flex items-center self-start rounded-sm bg-secondary-container px-3 py-1 font-label text-label-sm text-on-secondary-container">
            Acervo Técnico
          </span>
          <h1 className="max-w-4xl font-display text-display-lg-mobile text-balance text-on-primary lg:text-display-lg">
            Portfólio de obras executadas
          </h1>
          <p className="max-w-2xl font-body text-body-lg text-pretty text-on-primary-container">
            Obras entregues em rodovias concedidas, infraestrutura urbana, SAUs, PREs e edificações corporativas em todo o país.
          </p>
        </Container>
      </section>
      <section className="py-10 md:py-12">
        <Container>
          <ObrasExplorer obras={obras} initialFilters={initialFilters} servicoNomes={servicoNomes} />
        </Container>
      </section>
      <section className="pb-section">
        <Container>
          <div className="grid items-center gap-6 rounded-lg bg-primary-container p-6 md:p-8 lg:grid-cols-12 lg:gap-8 lg:p-12">
            <div className="flex flex-col gap-3 lg:col-span-8">
              <h2 className="font-headline text-headline-lg-mobile text-balance text-white lg:text-headline-lg">
                Solicite nossas Certidões de Acervo Técnico (CATs)
              </h2>
              <p className="max-w-prose font-body text-body-lg text-pretty text-on-primary-container">
                Disponibilizamos atestados técnicos, memoriais de cálculo e referências contratuais para processos de habilitação e licitações.
              </p>
            </div>
            <div className="flex lg:col-span-4 lg:justify-end">
              <Button href={leadHref({ disciplina: "consultoria", origem: "acervo-tecnico" })} variant="accent" inverse className="w-full sm:w-auto">
                <FileText aria-hidden="true" className="size-5" />
                Solicitar acervo e proposta
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
