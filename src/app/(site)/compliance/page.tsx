import type { Metadata } from "next";
import { CircleCheck, ExternalLink } from "lucide-react";
import { CandidaturaForm } from "@/components/forms/CandidaturaForm";
import { VagaButton } from "@/components/forms/VagaButton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getContentSource } from "@/lib/content/source";
import { PILAR_ICONES } from "@/lib/icons";
import { AREAS_GENERICAS } from "@/lib/leads/candidatura";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Compliance e Carreiras",
  description:
    "Programa de integridade e SSMA da DT Construtora, canal de denúncias e banco de talentos para quem quer trabalhar conosco.",
  path: "/compliance",
});

const H2 = "font-headline text-headline-lg-mobile text-balance text-on-surface lg:text-headline-lg";

export default async function CompliancePage() {
  const source = getContentSource();
  const [pagina, config] = await Promise.all([source.getPaginaCompliance(), source.getConfiguracoes()]);
  const areas = [...new Set([...pagina.vagas.map((v) => v.titulo), ...AREAS_GENERICAS])];

  return (
    <>
      <section className="border-b border-primary-container bg-brand-navy py-12 text-on-primary md:py-16">
        <Container className="flex flex-col gap-4">
          <span className="inline-flex items-center self-start rounded-sm bg-secondary-container px-3 py-1 font-label text-label-sm text-on-secondary-container">
            Integridade &amp; Pessoas
          </span>
          <h1 className="max-w-4xl font-display text-display-lg-mobile text-balance text-on-primary lg:text-display-lg">
            Compliance, segurança e carreiras
          </h1>
          <p className="max-w-2xl font-body text-body-lg text-pretty text-on-primary-container">
            Nosso compromisso com governança transparente, saúde e segurança do trabalho (SSMA) e valorização dos profissionais que executam nossa engenharia em campo.
          </p>
        </Container>
      </section>

      <section id="compliance" className="py-12 md:py-section">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h2 className={H2}>Programa de integridade e SSMA</h2>
            <p className="font-body text-body-md text-on-surface-variant">
              Diretrizes obrigatórias em todas as obras rodoviárias, bases operacionais e canteiros prediais.
            </p>
          </div>

          {pagina.pilares.length > 0 && (
            <ul className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
              {pagina.pilares.map((p) => {
                const Icone = PILAR_ICONES[p.icone];
                return (
                  <li key={p.titulo} className="flex flex-col gap-3 rounded-md border border-outline-variant bg-surface-container-lowest p-6">
                    <Icone aria-hidden="true" className="size-8 text-primary" />
                    <h3 className="font-title text-title-lg text-on-surface">{p.titulo}</h3>
                    <p className="font-body text-body-md text-pretty text-on-surface-variant">{p.descricao}</p>
                    {p.itens.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-1.5 font-body text-body-md text-on-surface-variant">
                        {p.itens.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-secondary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col items-start gap-3 rounded-md border border-outline-variant bg-surface-container-low p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl font-body text-body-md text-on-surface-variant">
              Canal de denúncias: externo, funciona 24 horas e aceita denúncias anônimas.
            </p>
            <Button href={config.canalDenunciasUrl} target="_blank" rel="noopener noreferrer" variant="secondary" className="shrink-0">
              Acessar o canal de denúncias<span className="sr-only"> (abre em nova aba)</span>
              <ExternalLink aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </Container>
      </section>

      <section id="trabalhe-conosco" className="scroll-mt-20 border-t border-outline-variant bg-surface-container-low py-12 md:scroll-mt-24 md:py-section">
        <Container className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div className="flex flex-col gap-2">
              <h2 className={H2}>Trabalhe conosco</h2>
              <p className="font-body text-body-lg text-pretty text-on-surface-variant">
                Buscamos engenheiros civis, encarregados de pavimentação e drenagem, técnicos de segurança e especialistas em orçamento e controle tecnológico.
              </p>
            </div>

            {/* Sem foto da equipe no conteúdo: bloco navy com o rótulo, como no layout. */}
            <div className="flex aspect-video w-full items-center justify-center rounded-md border border-outline-variant bg-brand-navy">
              <span className="px-6 text-center font-label text-label-sm uppercase tracking-[0.2em] text-on-primary-container">
                Equipe Técnica DT Construtora
              </span>
            </div>

            {pagina.vagas.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-title text-title-lg text-on-surface">Posições frequentemente demandadas</h3>
                <ul className="flex flex-col gap-3">
                  {pagina.vagas.map((v) => {
                    const meta = [v.requisito, v.regime].filter(Boolean).join(" • ");
                    return (
                      <li key={v.titulo} className="flex flex-col gap-1 rounded-md border border-outline-variant bg-surface-container-lowest p-4">
                        <h4 className="font-title text-title-md text-on-surface">{v.titulo}</h4>
                        {meta && <p className="font-mono text-mono-md text-secondary">{meta}</p>}
                        <p className="font-body text-body-md text-on-surface-variant">{v.descricao}</p>
                        <VagaButton titulo={v.titulo} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 rounded-md border border-outline-variant bg-surface-container-lowest p-6 md:p-8 lg:col-span-6">
            <div>
              <h3 className="font-headline text-headline-md text-on-surface">Banco de talentos e candidaturas</h3>
              <p className="font-body text-body-md text-on-surface-variant">
                Cadastre seu perfil técnico para oportunidades em obras ou escritórios de engenharia. Todos os campos são obrigatórios.
              </p>
            </div>
            <CandidaturaForm areas={areas} />
          </div>
        </Container>
      </section>
    </>
  );
}
