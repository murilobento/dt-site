import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Página não encontrada | DT Construtora",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <Eyebrow className="text-on-surface-variant">Erro 404</Eyebrow>
        <h1 className="mt-4 font-display text-display-lg-mobile text-primary lg:text-display-lg">Página não encontrada</h1>
        <p className="mt-6 max-w-2xl text-body-lg text-on-surface-variant">
          O endereço pode ter mudado ou a página foi removida.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/">Ir para o início</Button>
          <Button href="/obras" variant="secondary">
            Ver obras
          </Button>
        </div>
      </Container>
    </section>
  );
}
