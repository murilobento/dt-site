import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { HOME_COPY } from "@/lib/copy/home";
import { DIFERENCIAL_ICONES } from "@/lib/icons";
import type { Diferencial } from "@/lib/content/types";

export function Differentials({ diferenciais }: { diferenciais: Diferencial[] }) {
  if (diferenciais.length === 0) return null;
  const { titulo, lead } = HOME_COPY.diferenciais;
  return (
    <Reveal className="py-12 md:py-section">
      <Container className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <h2 className="font-headline text-headline-lg-mobile text-balance text-on-surface lg:text-headline-lg">{titulo}</h2>
          <p className="font-body text-body-lg text-pretty text-on-surface-variant">{lead}</p>
        </div>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-7">
          {diferenciais.map((d) => {
            const Icone = DIFERENCIAL_ICONES[d.icone];
            return (
              <li key={d.titulo} className="flex flex-col gap-2 rounded-md border border-outline-variant bg-surface-container-lowest p-6">
                {Icone && <Icone aria-hidden="true" className="size-8 text-primary" />}
                <h3 className="font-title text-title-lg text-on-surface">{d.titulo}</h3>
                <p className="font-body text-body-md text-pretty text-on-surface-variant">{d.descricao}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Reveal>
  );
}
