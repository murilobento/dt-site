import { Check } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Container } from "@/components/ui/Container";
import type { Obra, Servico } from "@/lib/content/types";

const H2 = "font-headline text-headline-lg-mobile text-balance text-on-surface lg:text-headline-lg";

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="mt-8 grid max-w-4xl gap-3 md:grid-cols-2">
      {itens.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 rounded-md border border-outline-variant bg-surface-container-lowest p-4 font-body text-body-md text-on-surface"
        >
          <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-secondary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Seções de conteúdo do serviço; cada uma some por inteiro quando não tem itens. */
export function ServicoSections({ servico, obras }: { servico: Servico; obras: Obra[] }) {
  return (
    <>
      {servico.escopo.length > 0 && (
        <section className="py-12 md:py-section">
          <Container>
            <h2 className={H2}>Escopo</h2>
            <Lista itens={servico.escopo} />
          </Container>
        </section>
      )}

      {servico.etapas.length > 0 && (
        <section className="border-y border-outline-variant bg-surface-container-low py-12 md:py-section">
          <Container>
            <h2 className={H2}>Etapas</h2>
            <ol className="mt-8 grid max-w-4xl gap-4">
              {servico.etapas.map((etapa, i) => (
                <li
                  key={etapa.titulo}
                  className="flex items-start gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-5"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary font-mono text-mono-md text-on-primary"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <strong className="font-title text-title-lg text-on-surface">{etapa.titulo}</strong>
                    <p className="mt-1 font-body text-body-md text-on-surface-variant">{etapa.descricao}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {servico.equipamentos.length > 0 && (
        <section className="py-12 md:py-section">
          <Container>
            <h2 className={H2}>Equipamentos</h2>
            <Lista itens={servico.equipamentos} />
          </Container>
        </section>
      )}

      {obras.length > 0 && (
        <section className="border-t border-outline-variant bg-surface-container-low py-12 md:py-section">
          <Container>
            <h2 className={H2}>Obras relacionadas</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {obras.map((obra) => (
                <ProjectCard key={obra.slug} obra={obra} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
