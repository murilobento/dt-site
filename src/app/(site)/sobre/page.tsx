import type { Metadata } from "next";
import { CircleCheck, Eye, Flag } from "lucide-react";
import { Timeline } from "@/components/company/Timeline";
import { ValuesGrid } from "@/components/company/ValuesGrid";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getContentSource } from "@/lib/content/source";
import { buildMetadata } from "@/lib/seo/metadata";

const LEAD =
  "Construtora e consultoria em obras civis e infraestrutura, com sede em Regente Feijó (SP).";

export const metadata: Metadata = buildMetadata({ title: "Sobre Nós", description: LEAD, path: "/sobre" });

const H2 = "font-headline text-headline-lg-mobile text-balance text-on-surface lg:text-headline-lg";
const CARD = "flex flex-col gap-2 rounded-md border border-outline-variant bg-surface-container-lowest p-6";

export default async function SobrePage() {
  const source = getContentSource();
  const [empresa, config] = await Promise.all([source.getPaginaEmpresa(), source.getConfiguracoes()]);
  const cardsMV = [
    { titulo: "Missão", texto: empresa.missao, Icone: Flag },
    { titulo: "Visão", texto: empresa.visao, Icone: Eye },
  ].filter((c) => c.texto);

  return (
    <>
      <section className="border-b border-primary-container bg-brand-navy py-12 text-on-primary md:py-16">
        <Container className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <span className="inline-flex items-center self-start rounded-sm bg-secondary-container px-3 py-1 font-label text-label-sm text-on-secondary-container">
              História &amp; Engenharia
            </span>
            <h1 className="font-display text-display-lg-mobile text-balance text-on-primary lg:text-display-lg">
              Engenharia sólida construída em campo
            </h1>
            <p className="max-w-prose font-body text-body-lg text-pretty text-on-primary-container">{LEAD}</p>
          </div>
          <div className="lg:col-span-5">
            {/* Sem foto da equipe no conteúdo: bloco navy com o rótulo, como no layout. */}
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-on-primary-container/30 bg-primary">
              <span className="px-6 text-center font-label text-label-sm uppercase tracking-[0.2em] text-on-primary-container">
                DT Construtora — Engenharia em Campo
              </span>
            </div>
          </div>
        </Container>
      </section>

      {(empresa.comoTrabalhamos || cardsMV.length > 0) && (
        <Reveal className="py-12 md:py-section">
          <Container className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            {empresa.comoTrabalhamos && (
              <div className="flex flex-col gap-5 lg:col-span-7">
                <h2 className={H2}>Como trabalhamos</h2>
                <p className="font-body text-body-lg text-pretty text-on-surface-variant">{empresa.comoTrabalhamos}</p>
              </div>
            )}
            {cardsMV.length > 0 && (
              <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
                {cardsMV.map(({ titulo, texto, Icone }) => (
                  <div key={titulo} className={CARD}>
                    <div className="flex items-center gap-2 text-primary">
                      <Icone aria-hidden="true" className="size-5" />
                      <h3 className="font-title text-title-lg text-on-surface">{titulo}</h3>
                    </div>
                    <p className="font-body text-body-md text-pretty text-on-surface-variant">{texto}</p>
                  </div>
                ))}
              </div>
            )}
          </Container>
        </Reveal>
      )}

      {empresa.marcos.length > 0 && (
        <Reveal className="border-y border-outline-variant bg-surface-container-low py-12 md:py-section">
          <Container>
            <h2 className={H2}>Nossa trajetória</h2>
            <p className="mt-2 max-w-2xl font-body text-body-md text-on-surface-variant">
              Evolução contínua de capacidade técnica, equipamentos e acervo certificado.
            </p>
            <Timeline marcos={empresa.marcos} />
          </Container>
        </Reveal>
      )}

      {empresa.valores.length > 0 && (
        <Reveal className="py-12 md:py-section">
          <Container>
            <h2 className={H2}>Valores</h2>
            {config.siglaValores && (
              <p className="mt-2 font-mono text-mono-md text-secondary">{config.siglaValores}</p>
            )}
            <ValuesGrid valores={empresa.valores} />
          </Container>
        </Reveal>
      )}

      {empresa.principios.length > 0 && (
        <Reveal className="border-y border-outline-variant bg-surface-container-low py-12 md:py-section">
          <Container>
            <h2 className={H2}>Princípios</h2>
            <ul className="mt-8 flex max-w-3xl flex-col gap-3">
              {empresa.principios.map((p) => (
                <li key={p} className="flex items-start gap-3 font-body text-body-lg text-on-surface">
                  <CircleCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-secondary" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Container>
        </Reveal>
      )}

      <section className="py-12 md:py-section">
        <Container>
          <div className="grid items-center gap-6 rounded-lg bg-primary-container p-6 md:p-8 lg:grid-cols-12 lg:gap-8 lg:p-12">
            <div className="flex flex-col gap-3 lg:col-span-8">
              <h2 className="font-headline text-headline-lg-mobile text-balance text-white lg:text-headline-lg">
                Quer conhecer nossa capacidade técnica para seu próximo contrato?
              </h2>
              <p className="max-w-prose font-body text-body-lg text-pretty text-on-primary-container">
                Fale diretamente com nossos engenheiros responsáveis e solicite nosso portfólio documental completo.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
              <Button href="/contato" variant="accent" inverse className="w-full sm:w-auto">
                Entrar em contato
              </Button>
              <Button href="/compliance" variant="secondary" inverse className="w-full sm:w-auto">
                Compliance e Carreiras
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
