import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getContentSource } from "@/lib/content/source";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { getSiteUrl } from "@/lib/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contato",
  description: "Endereço da sede e canais de contato por assunto: comercial, carreiras, fornecedores, denúncias e imprensa.",
  path: "/contato",
});

const DENUNCIAS = "Fale sem medo. O canal é externo, funciona 24 horas e aceita denúncias anônimas.";

type CardProps = { titulo: string; texto: string; children: React.ReactNode };

function ContactCard({ titulo, texto, children }: CardProps) {
  return (
    <li className="flex flex-col rounded-card border border-border p-6">
      <h3 className="text-xl text-text-primary">{titulo}</h3>
      <p className="mt-2 flex-1 text-base text-text-secondary">{texto}</p>
      <div className="mt-4">{children}</div>
    </li>
  );
}

export default async function ContatoPage() {
  const c = await getContentSource().getConfiguracoes();
  const { logradouro, cidade, uf, cep } = c.endereco;
  const enderecoLinha = `${logradouro}, ${cidade} - ${uf}, ${cep}`;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoLinha)}`;
  const tel = c.telefone.replace(/[^\d+]/g, "");

  return (
    <>
      <JsonLd data={localBusinessJsonLd(c, getSiteUrl())} />
      <section className="bg-surface-inverse py-16 text-text-on-inverse md:py-24">
        <Container>
          <Eyebrow className="text-text-on-inverse-secondary">Fale conosco</Eyebrow>
          <h1 className="mt-4 text-3xl text-text-on-inverse md:text-5xl">Contato</h1>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-2xl text-text-primary md:text-3xl">Sede</h2>
          <address className="mt-6 text-base not-italic text-text-primary">
            <p>{logradouro}</p>
            <p>
              {cidade} - {uf}
            </p>
            <p>CEP {cep}</p>
            <p className="mt-4">
              Telefone:{" "}
              <a href={`tel:${tel}`} className="underline underline-offset-4">
                {c.telefone}
              </a>
            </p>
            <p>Horário: {c.horario}</p>
          </address>
          <p className="mt-6">
            <a href={mapa} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
              Abrir no mapa<span className="sr-only"> (abre em nova aba)</span>
            </a>
          </p>
        </Container>
      </section>

      <section className="bg-surface-muted py-16 md:py-24">
        <Container>
          <SectionHeader title="Fale com a área certa" lead="Escolha o assunto e vá direto a quem resolve." />
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ContactCard titulo="Comercial" texto="Proposta para obras civis ou infraestrutura.">
              <Button href="/contato/comercial">Solicitar proposta</Button>
            </ContactCard>
            <ContactCard titulo="Carreiras" texto="Envie seu currículo para o time de pessoas.">
              <Button variant="secondary" href={`mailto:${c.emailCarreiras}`}>
                {c.emailCarreiras}
              </Button>
            </ContactCard>
            <ContactCard titulo="Fornecedores" texto="Cadastre sua empresa para fornecer à DT.">
              <Button variant="secondary" href={`mailto:${c.emailFornecedores}`}>
                {c.emailFornecedores}
              </Button>
            </ContactCard>
            <ContactCard titulo="Denúncias" texto={DENUNCIAS}>
              <Button variant="secondary" href={c.canalDenunciasUrl} target="_blank" rel="noopener noreferrer">
                Acessar o canal de denúncias<span className="sr-only"> (abre em nova aba)</span>
              </Button>
            </ContactCard>
            <ContactCard titulo="Imprensa" texto="Pedidos de entrevista e material para jornalistas.">
              <Button variant="secondary" href={`mailto:${c.emailImprensa}`}>
                {c.emailImprensa}
              </Button>
            </ContactCard>
          </ul>
        </Container>
      </section>
    </>
  );
}
