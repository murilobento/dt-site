import { PortableText } from "@portabletext/react";
import { Container } from "@/components/ui/Container";
import type { PaginaLegal } from "@/lib/content/types";

/** `YYYY-MM-DD` → `dd/mm/aaaa`, sem passar por Date (evita deslocamento de fuso). */
function formatarData(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

export function LegalPage({ pagina }: { pagina: PaginaLegal }) {
  return (
    <Container as="article" className="max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">{pagina.titulo}</h1>
      <p className="mt-4 text-sm text-text-secondary">
        Versão {pagina.versao} — vigente desde {formatarData(pagina.vigencia)}
      </p>
      <div className="mt-8 flex flex-col gap-4 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
        <PortableText value={pagina.corpo} />
      </div>
    </Container>
  );
}
