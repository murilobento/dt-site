"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Next 16.4: a prop estável é `retry` (re-busca e re-renderiza); `reset` só limpa o estado. */
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <Eyebrow className="text-text-secondary">Erro</Eyebrow>
        <h1 className="mt-4 text-3xl text-text-primary md:text-5xl">Algo deu errado</h1>
        <p className="mt-6 max-w-2xl text-lg text-text-secondary">Tente de novo em alguns instantes.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button onClick={() => retry()}>Tentar de novo</Button>
          <Button href="/" variant="secondary">
            Ir para o início
          </Button>
        </div>
      </Container>
    </section>
  );
}
