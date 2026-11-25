import type { Metadata } from "next";
import { Timeline } from "@/components/company/Timeline";
import { ValuesGrid } from "@/components/company/ValuesGrid";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getContentSource } from "@/lib/content/source";

const LEAD =
  "Construtora e consultoria em obras civis e infraestrutura, com sede em Regente Feijó (SP).";

export const metadata: Metadata = {
  title: "Sobre a DT | DT Construtora",
  description: LEAD,
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export default async function EmpresaPage() {
  const source = getContentSource();
  const [empresa, config] = await Promise.all([source.getPaginaEmpresa(), source.getConfiguracoes()]);

  return (
    <>
      <section className="bg-surface-inverse py-16 text-text-on-inverse md:py-24">
        <Container>
          <Eyebrow className="text-text-on-inverse-secondary">Empresa</Eyebrow>
          <h1 className="mt-4 text-3xl text-text-on-inverse md:text-5xl">Sobre a DT</h1>
          <p className="mt-6 max-w-2xl text-lg text-text-on-inverse-secondary">{LEAD}</p>
        </Container>
      </section>

      {empresa.marcos.length > 0 && (
        <Reveal className="py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Nossa história</h2>
            <Timeline marcos={empresa.marcos} />
          </Container>
        </Reveal>
      )}

      {empresa.comoTrabalhamos && (
        <Reveal className="bg-surface-muted py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Como trabalhamos</h2>
            <p className="mt-6 max-w-3xl text-base text-text-primary">{empresa.comoTrabalhamos}</p>
          </Container>
        </Reveal>
      )}

      {empresa.missao && (
        <Reveal className="py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Missão</h2>
            <p className="mt-6 max-w-3xl text-base text-text-primary">{empresa.missao}</p>
          </Container>
        </Reveal>
      )}

      {empresa.visao && (
        <Reveal className="bg-surface-muted py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Visão</h2>
            <p className="mt-6 max-w-3xl text-base text-text-primary">{empresa.visao}</p>
          </Container>
        </Reveal>
      )}

      {empresa.valores.length > 0 && (
        <Reveal className="py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Valores</h2>
            {config.siglaValores && (
              <Eyebrow className="mt-3 text-text-secondary">{config.siglaValores}</Eyebrow>
            )}
            <ValuesGrid valores={empresa.valores} />
          </Container>
        </Reveal>
      )}

      {empresa.principios.length > 0 && (
        <Reveal className="bg-surface-muted py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Princípios</h2>
            <ul className="mt-8 max-w-3xl space-y-4">
              {empresa.principios.map((p) => (
                <li key={p} className="flex gap-3 text-base text-text-primary">
                  <CheckIcon />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Container>
        </Reveal>
      )}
    </>
  );
}
