import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getContentSource } from "@/lib/content/source";
import { parseObraFilters } from "@/lib/obras/filter";
import { ObrasExplorer } from "./ObrasExplorer";

export const metadata: Metadata = {
  title: "Obras | DT Construtora",
  description: "Obras civis e de infraestrutura executadas e em andamento pela DT Construtora.",
};

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
  const initialFilters = parseObraFilters(toURLSearchParams(sp));
  const servicoNomes = Object.fromEntries(servicos.map((s) => [s.slug, s.titulo]));

  return (
    <>
      <section className="bg-surface-inverse py-16 text-text-on-inverse md:py-24">
        <Container>
          <Eyebrow className="text-text-on-inverse-secondary">Portfólio</Eyebrow>
          <h1 className="mt-4 text-3xl text-text-on-inverse md:text-5xl">Obras</h1>
          <p className="mt-6 max-w-2xl text-lg text-text-on-inverse-secondary">
            Conheça obras civis e de infraestrutura executadas e em andamento pela DT.
          </p>
        </Container>
      </section>
      <section className="py-12 md:py-16">
        <Container>
          <ObrasExplorer obras={obras} initialFilters={initialFilters} servicoNomes={servicoNomes} />
        </Container>
      </section>
    </>
  );
}
