import type { Metadata } from "next";
import { CTABand } from "@/components/home/CTABand";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Hero } from "@/components/home/Hero";
import { Differentials } from "@/components/home/Differentials";
import { ServicesTabs } from "@/components/home/ServicesTabs";
import { StatsStrip } from "@/components/home/StatsStrip";
import { getContentSource } from "@/lib/content/source";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "DT Construtora e Consultoria | Obras civis e infraestrutura",
  description: "Construtora e consultoria em obras civis e infraestrutura, com sede em Regente Feijó (SP). Conheça serviços e obras.",
  path: "/",
  absoluteTitle: true,
});

export default async function Home() {
  const source = getContentSource();
  const [obras, servicos, numeros, diferenciais] = await Promise.all([
    source.getObrasDestaque(),
    source.getServicos(),
    source.getNumeros(),
    source.getDiferenciais(),
  ]);

  return (
    <>
      <Hero imagem={obras[0]?.capa} />
      <StatsStrip numeros={numeros} />
      <ServicesTabs servicos={servicos} />
      <FeaturedProjects obras={obras} />
      <Differentials diferenciais={diferenciais} />
      <CTABand />
    </>
  );
}
