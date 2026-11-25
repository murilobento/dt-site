import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { HOME_COPY } from "@/lib/copy/home";
import type { Imagem } from "@/lib/content/types";
import { TrackedCta } from "./TrackedCta";

export function Hero({ imagem }: { imagem?: Imagem }) {
  const { eyebrow, titulo, subtitulo } = HOME_COPY.hero;
  return (
    <section className="relative isolate overflow-hidden bg-surface-inverse text-text-on-inverse">
      {imagem && (
        <>
          <Image
            src={imagem.url}
            alt={imagem.alt}
            fill
            sizes="100vw"
            preload
            fetchPriority="high"
            className="-z-20 object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-surface-inverse/75" />
        </>
      )}
      <Container className="py-24 md:py-32">
        <div className="max-w-3xl">
          <Eyebrow className="text-text-on-inverse-secondary">{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-3xl text-text-on-inverse md:text-5xl">{titulo}</h1>
          <p className="mt-6 max-w-2xl text-lg text-text-on-inverse-secondary">{subtitulo}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <TrackedCta href="/contato/comercial" inverse local="hero">
              Fale com a equipe
            </TrackedCta>
            <Button href="/obras" variant="secondary" inverse>
              Ver obras
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
