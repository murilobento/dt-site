import Image from "next/image";
import Link from "next/link";
import { formatPeriodo } from "@/lib/format";
import type { Obra, Segmento } from "@/lib/content/types";

const SEGMENTO_LABEL: Record<Segmento, string> = {
  "obras-civis": "Obras civis",
  infraestrutura: "Infraestrutura",
};

type ProjectCardProps = {
  obra: Obra;
  variant?: "padrao" | "horizontal";
};

export function ProjectCard({ obra, variant = "padrao" }: ProjectCardProps) {
  const horizontal = variant === "horizontal";
  return (
    <article
      className={`group relative overflow-hidden rounded-card border border-border bg-surface-default ${
        horizontal ? "sm:flex" : ""
      }`}
    >
      <div
        className={`relative aspect-[8/5] overflow-hidden bg-surface-muted ${
          horizontal ? "sm:aspect-auto sm:w-2/5 sm:shrink-0" : ""
        }`}
      >
        <Image
          src={obra.capa.url}
          alt={obra.capa.alt}
          fill
          sizes={
            horizontal
              ? "(min-width: 40rem) 40vw, 100vw"
              : "(min-width: 64rem) 400px, (min-width: 40rem) 50vw, 100vw"
          }
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="p-6">
        <p className="text-sm font-semibold text-text-secondary">{SEGMENTO_LABEL[obra.segmento]}</p>
        <h3 className="mt-2 text-lg font-bold text-text-primary">
          <Link href={`/obras/${obra.slug}`} className="after:absolute after:inset-0 hover:underline underline-offset-4">
            {obra.titulo}
          </Link>
        </h3>
        <p className="mt-2 text-base text-text-secondary">
          {obra.cidade}/{obra.uf}
        </p>
        <p className="text-sm text-text-secondary">{formatPeriodo(obra.inicio, obra.termino)}</p>
      </div>
    </article>
  );
}
