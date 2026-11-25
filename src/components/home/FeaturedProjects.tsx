import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Obra } from "@/lib/content/types";

export function FeaturedProjects({ obras }: { obras: Obra[] }) {
  if (obras.length === 0) return null;
  return (
    <section className="reveal py-16 md:py-24">
      <Container>
        <SectionHeader eyebrow="Obras em destaque" title="Veja o que já executamos" />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {obras.slice(0, 6).map((obra) => (
            <li key={obra.slug}>
              <ProjectCard obra={obra} />
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <Button href="/obras" variant="secondary">
            Ver todas as obras
          </Button>
        </div>
      </Container>
    </section>
  );
}
