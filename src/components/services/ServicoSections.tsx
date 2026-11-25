import { ProjectCard } from "@/components/projects/ProjectCard";
import { Container } from "@/components/ui/Container";
import type { Obra, Servico } from "@/lib/content/types";

/** Seções de conteúdo do serviço; cada uma some por inteiro quando não tem itens. */
export function ServicoSections({ servico, obras }: { servico: Servico; obras: Obra[] }) {
  return (
    <>
      {servico.escopo.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Escopo</h2>
            <ul className="mt-8 max-w-3xl list-disc space-y-2 pl-6 text-base text-text-primary">
              {servico.escopo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {servico.etapas.length > 0 && (
        <section className="bg-surface-muted py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Etapas</h2>
            <ol className="mt-8 max-w-3xl list-decimal space-y-4 pl-6 text-base text-text-primary">
              {servico.etapas.map((etapa) => (
                <li key={etapa.titulo}>
                  <strong className="font-bold">{etapa.titulo}</strong>
                  <p className="mt-1 text-text-secondary">{etapa.descricao}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {servico.equipamentos.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Equipamentos</h2>
            <ul className="mt-8 max-w-3xl list-disc space-y-2 pl-6 text-base text-text-primary">
              {servico.equipamentos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {obras.length > 0 && (
        <section className="bg-surface-muted py-16 md:py-24">
          <Container>
            <h2 className="text-2xl text-text-primary md:text-3xl">Obras relacionadas</h2>
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
