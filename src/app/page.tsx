import { CTABand } from "@/components/home/CTABand";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Hero } from "@/components/home/Hero";
import { LogoWall } from "@/components/home/LogoWall";
import { SegmentCards } from "@/components/home/SegmentCards";
import { StatCounter } from "@/components/home/StatCounter";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getContentSource } from "@/lib/content/source";

export default async function Home() {
  const source = getContentSource();
  const [obras, servicos, clientes, numeros] = await Promise.all([
    source.getObrasDestaque(),
    source.getServicos(),
    source.getClientes(),
    source.getNumeros(),
  ]);

  return (
    <>
      <Hero imagem={obras[0]?.capa} />
      {numeros.length > 0 && (
        <section className="reveal py-16 md:py-24">
          <Container>
            <SectionHeader eyebrow="Números da DT" title="Nossa atuação em números" />
            <div className="mt-12">
              <StatCounter numeros={numeros} />
            </div>
          </Container>
        </section>
      )}
      <SegmentCards servicos={servicos} />
      <FeaturedProjects obras={obras} />
      <LogoWall clientes={clientes} />
      <CTABand />
    </>
  );
}
