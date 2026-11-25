import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Cliente, TipoCliente } from "@/lib/content/types";

const GRUPOS: { tipo: TipoCliente; titulo: string }[] = [
  { tipo: "concessionaria", titulo: "Concessionárias" },
  { tipo: "publico", titulo: "Órgãos públicos" },
  { tipo: "privado", titulo: "Clientes privados" },
];

const LOGO_CLS = "grayscale transition-[filter] group-hover:grayscale-0 group-focus-visible:grayscale-0";

function Logo({ cliente }: { cliente: Cliente }) {
  const img = (
    <Image
      src={cliente.logo.url}
      alt={cliente.nome}
      width={cliente.logo.width}
      height={cliente.logo.height}
      sizes="160px"
      className={`h-16 w-auto object-contain ${LOGO_CLS}`}
    />
  );
  return cliente.site ? (
    <a href={cliente.site} className="group flex rounded-control p-2" rel="noopener noreferrer">
      {img}
    </a>
  ) : (
    <div className="group flex p-2">{img}</div>
  );
}

export function LogoWall({ clientes }: { clientes: Cliente[] }) {
  const grupos = GRUPOS.map((g) => ({
    ...g,
    itens: clientes.filter((c) => c.tipo === g.tipo).sort((a, b) => a.ordem - b.ordem),
  })).filter((g) => g.itens.length > 0);
  if (grupos.length === 0) return null;

  return (
    <Reveal className="bg-surface-muted py-16 md:py-24">
      <Container>
        <SectionHeader eyebrow="Clientes" title="Quem confia na DT" />
        <div className="mt-12 space-y-12">
          {grupos.map((g) => (
            <div key={g.tipo}>
              <h3 className="text-base font-semibold text-text-secondary">{g.titulo}</h3>
              <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
                {g.itens.map((c) => (
                  <li key={c.nome}>
                    <Logo cliente={c} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Reveal>
  );
}
