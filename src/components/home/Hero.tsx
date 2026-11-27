import Image from "next/image";
import { HardHat } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HOME_COPY } from "@/lib/copy/home";
import type { Imagem } from "@/lib/content/types";
import { TrackedCta } from "./TrackedCta";

export function Hero({ imagem }: { imagem?: Imagem }) {
  const { titulo, subtitulo, ctaServicos, ctaObras } = HOME_COPY.hero;
  return (
    <section className="relative isolate overflow-hidden bg-brand-navy">
      {imagem && (
        <Image
          src={imagem.url}
          alt=""
          fill
          sizes="100vw"
          preload
          fetchPriority="high"
          className="-z-10 object-cover opacity-35"
        />
      )}
      <Container className="py-12 md:py-16 lg:py-24">
        <div className="flex max-w-3xl flex-col gap-5 md:gap-6">
          <h1 className="font-display text-display-lg-mobile text-balance text-white lg:text-display-lg">{titulo}</h1>
          <p className="max-w-prose font-body text-body-lg text-pretty text-on-primary-container">{subtitulo}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2 md:gap-4">
            <TrackedCta href="/servicos" variant="accent" inverse local="hero" className="w-full sm:w-auto">
              <HardHat aria-hidden="true" className="size-5" />
              {ctaServicos}
            </TrackedCta>
            <Button href="/obras" variant="secondary" inverse className="w-full sm:w-auto">
              {ctaObras}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
