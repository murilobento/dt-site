import { Container } from "@/components/ui/Container";
import type { Numero } from "@/lib/content/types";
import { StatCounter } from "./StatCounter";

/** Faixa de números logo abaixo do hero (4 colunas com divisórias no desktop). */
export function StatsStrip({ numeros }: { numeros: Numero[] }) {
  if (numeros.length === 0) return null;
  return (
    <section aria-label="Números da DT" className="border-b border-outline-variant bg-surface-container-lowest">
      <Container className="py-8 md:py-10">
        <StatCounter numeros={numeros.slice(0, 4)} />
      </Container>
    </section>
  );
}
