import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { HOME_COPY } from "@/lib/copy/home";
import { TrackedCta } from "./TrackedCta";

export function CTABand() {
  return (
    <Reveal className="bg-surface-inverse py-16 text-text-on-inverse md:py-24">
      <Container className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <h2 className="max-w-xl text-2xl text-text-on-inverse md:text-3xl">{HOME_COPY.cta.titulo}</h2>
        <TrackedCta href="/contato/comercial" inverse local="cta-final">
          {HOME_COPY.cta.botao}
        </TrackedCta>
      </Container>
    </Reveal>
  );
}
