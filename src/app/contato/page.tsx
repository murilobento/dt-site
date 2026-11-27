import type { Metadata } from "next";
import { CircleCheck, Clock, Mail, Phone } from "lucide-react";
import { LeadForm } from "@/components/forms/LeadForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getContentSource } from "@/lib/content/source";
import type { Segmento } from "@/lib/content/types";
import { DISCIPLINA_SEGMENTO, disciplinaInicial } from "@/lib/disciplinas";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = buildMetadata({
  title: "Contato e orçamento",
  description:
    "Solicite proposta técnica ou agende consultoria: conte o escopo, a localização ou o número do edital e a equipe da DT responde em até 2 dias úteis.",
  path: "/contato",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const CARD = "flex flex-col gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-6";
const CARD_TITLE = "font-title text-title-lg text-on-surface";
const LABEL = "block font-label text-label-sm text-on-surface-variant";
const LINK = "font-mono text-mono-md text-primary underline underline-offset-4 hover:text-secondary break-all";

export default async function ContatoPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const disciplina = disciplinaInicial(first(params.disciplina), first(params.segmento));
  const origem = first(params.origem)?.trim().slice(0, 100) || undefined;
  const c = await getContentSource().getConfiguracoes();

  const { logradouro, cidade, uf, cep } = c.endereco;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${logradouro}, ${cidade} - ${uf}, ${cep}`)}`;
  const tel = c.telefone.replace(/[^\d+]/g, "");
  const segmento: Segmento = disciplina ? DISCIPLINA_SEGMENTO[disciplina] : (Object.keys(c.emailsLead)[0] as Segmento);
  const emailComercial = c.emailsLead[segmento];

  return (
    <>
      <JsonLd data={localBusinessJsonLd(c, getSiteUrl())} />
      <section className="border-b border-primary-container bg-brand-navy py-12 text-on-primary md:py-16">
        <Container className="flex flex-col gap-4">
          <span className="inline-flex items-center self-start rounded-sm bg-secondary-container px-3 py-1 font-label text-label-sm text-on-secondary-container">
            Atendimento Técnico • Orçamentos e Editais
          </span>
          <h1 className="max-w-4xl font-display text-display-lg-mobile text-balance text-on-primary lg:text-display-lg">
            Solicite proposta técnica ou agende consultoria
          </h1>
          <p className="max-w-2xl font-body text-body-lg text-pretty text-on-primary-container">
            Compartilhe o escopo do empreendimento, localização ou número do edital. Nossa equipe de engenharia responde em até 2 dias úteis.
          </p>
        </Container>
      </section>

      <section id="formulario" className="py-10 md:py-12">
        <Container className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-6 rounded-md border border-outline-variant bg-surface-container-lowest p-6 md:p-8 lg:col-span-7">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline text-headline-md text-on-surface">Dados da solicitação</h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Preencha os campos para direcionarmos ao coordenador da disciplina.
              </p>
            </div>
            <LeadForm disciplinaInicial={disciplina} origem={origem} whatsappHref={buildWhatsAppUrl(c.whatsapp, "/contato")} />
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-5">
            <div className={CARD}>
              <h2 className={CARD_TITLE}>Canais Diretos de Engenharia</h2>
              <ul className="flex flex-col gap-3 font-body text-body-md">
                <li className="flex items-start gap-3">
                  <Phone aria-hidden="true" className="size-6 shrink-0 text-primary" />
                  <div>
                    <span className={LABEL}>Telefone Comercial &amp; Orçamentos</span>
                    <a href={`tel:${tel}`} className={`${LINK} tabular-nums`}>
                      {c.telefone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail aria-hidden="true" className="size-6 shrink-0 text-primary" />
                  <div>
                    <span className={LABEL}>E-mail Comercial &amp; Editais</span>
                    <a href={`mailto:${emailComercial}`} className={LINK}>
                      {emailComercial}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock aria-hidden="true" className="size-6 shrink-0 text-primary" />
                  <div>
                    <span className={LABEL}>Horário de Atendimento</span>
                    <span className="text-on-surface">{c.horario}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className={CARD}>
              <h2 className={CARD_TITLE}>Sede Operacional</h2>
              <address className="font-body text-body-md not-italic text-on-surface-variant">
                <p>{logradouro}</p>
                <p>
                  {cidade} - {uf}
                </p>
                <p>CEP {cep}</p>
              </address>
              <a href={mapa} target="_blank" rel="noopener noreferrer" className="self-start font-label text-label-lg text-primary underline underline-offset-4 hover:text-secondary">
                Abrir no mapa<span className="sr-only"> (abre em nova aba)</span>
              </a>
            </div>

            <div className="flex flex-col gap-3 rounded-md bg-primary-container p-6 text-on-primary-container">
              <h2 className="font-title text-title-lg text-on-primary">Atendimento a Editais e Licitações</h2>
              <p className="font-body text-body-md text-pretty text-on-primary-container">
                Disponibilizamos Certidões de Acervo Técnico (CATs), balanços patrimoniais e atestados técnicos para processos de concorrência pública e privada.
              </p>
              <ul className="flex flex-col gap-1.5 font-body text-body-md">
                {["Orçamentação SICRO / SINAPI", "Cronogramas físico-financeiros auditáveis"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-secondary-container" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </section>

      <section id="outros-assuntos" className="border-t border-outline-variant bg-surface-container-low py-10 md:py-12">
        <Container className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline text-headline-md text-on-surface">Outros assuntos</h2>
            <p className="font-body text-body-md text-on-surface-variant">Escolha o assunto e vá direto a quem resolve.</p>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex flex-col items-start gap-3 rounded-md border border-outline-variant bg-surface-container-lowest p-5">
              <h3 className="font-title text-title-md text-on-surface">Carreiras</h3>
              <p className="flex-1 font-body text-body-md text-on-surface-variant">Envie seu currículo para o time de pessoas.</p>
              <Button variant="secondary" href="/compliance#trabalhe-conosco">
                Trabalhe conosco
              </Button>
            </li>
            <li className="flex flex-col items-start gap-3 rounded-md border border-outline-variant bg-surface-container-lowest p-5">
              <h3 className="font-title text-title-md text-on-surface">Fornecedores</h3>
              <p className="flex-1 font-body text-body-md text-on-surface-variant">Cadastre sua empresa para fornecer à DT.</p>
              <a href={`mailto:${c.emailFornecedores}`} className={LINK}>
                {c.emailFornecedores}
              </a>
            </li>
            <li className="flex flex-col items-start gap-3 rounded-md border border-outline-variant bg-surface-container-lowest p-5">
              <h3 className="font-title text-title-md text-on-surface">Imprensa</h3>
              <p className="flex-1 font-body text-body-md text-on-surface-variant">Pedidos de entrevista e material para jornalistas.</p>
              <a href={`mailto:${c.emailImprensa}`} className={LINK}>
                {c.emailImprensa}
              </a>
            </li>
            <li className="flex flex-col items-start gap-3 rounded-md border border-outline-variant bg-surface-container-lowest p-5">
              <h3 className="font-title text-title-md text-on-surface">Denúncias</h3>
              <p className="flex-1 font-body text-body-md text-on-surface-variant">
                Fale sem medo. O canal é externo, funciona 24 horas e aceita denúncias anônimas.
              </p>
              <Button variant="secondary" href={c.canalDenunciasUrl} target="_blank" rel="noopener noreferrer">
                Acessar o canal<span className="sr-only"> de denúncias (abre em nova aba)</span>
              </Button>
            </li>
          </ul>
        </Container>
      </section>
    </>
  );
}
