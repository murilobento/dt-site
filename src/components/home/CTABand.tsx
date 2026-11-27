import { Mail } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { HOME_COPY } from "@/lib/copy/home";
import { TrackedCta } from "./TrackedCta";

export function CTABand() {
  const { titulo, lead, botao } = HOME_COPY.cta;
  return (
    <Reveal className="pb-section">
      <Container>
        <div className="grid items-center gap-6 rounded-lg bg-primary-container p-6 md:p-8 lg:grid-cols-12 lg:gap-8 lg:p-12">
          <div className="flex flex-col gap-3 lg:col-span-8">
            <h2 className="font-headline text-headline-lg-mobile text-balance text-white lg:text-headline-lg">{titulo}</h2>
            <p className="max-w-prose font-body text-body-lg text-pretty text-on-primary-container">{lead}</p>
          </div>
          <div className="flex lg:col-span-4 lg:justify-end">
            <TrackedCta href="/contato" variant="accent" inverse local="cta-final" className="w-full sm:w-auto">
              <Mail aria-hidden="true" className="size-5" />
              {botao}
            </TrackedCta>
          </div>
        </div>
      </Container>
    </Reveal>
  );
}
