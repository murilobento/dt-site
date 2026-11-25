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
        <Eyebrow className="text-text-secondary">Erro 404</Eyebrow>
        <h1 className="mt-4 text-3xl text-text-primary md:text-5xl">Página não encontrada</h1>
        <p className="mt-6 max-w-2xl text-lg text-text-secondary">
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
