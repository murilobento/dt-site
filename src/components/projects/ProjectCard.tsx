import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDecimal } from "@/lib/format";
import { CATEGORIA_OBRA_LABEL } from "@/lib/obras/categorias";
import type { Obra } from "@/lib/content/types";

type ProjectCardProps = {
  obra: Obra;
  variant?: "padrao" | "horizontal";
};

export function ProjectCard({ obra, variant = "padrao" }: ProjectCardProps) {
  const horizontal = variant === "horizontal";
  const { extensao } = obra;
  return (
    <article
      className={`group relative flex w-full overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest transition-colors duration-state-change ease-state-change hover:border-primary ${
        horizontal ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative aspect-video overflow-hidden bg-brand-navy ${
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
          className="object-cover transition-transform duration-surface-enter ease-surface-enter group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-5 md:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center whitespace-nowrap rounded-sm bg-surface-container px-2.5 py-0.5 font-label text-label-sm text-on-surface-variant">
              {CATEGORIA_OBRA_LABEL[obra.categoria]}
            </span>
            {extensao && (
              <span className="font-mono text-mono-md tabular-nums text-on-surface-variant">
                {formatDecimal(extensao.valor)} {extensao.unidade}
              </span>
            )}
          </div>
          <h3 className="pt-1 font-title text-title-lg text-on-surface">
            <Link href={`/obras/${obra.slug}`} className="after:absolute after:inset-0 hover:underline underline-offset-4">
              {obra.titulo}
            </Link>
          </h3>
          <p className="font-body text-body-md line-clamp-3 text-pretty text-on-surface-variant">{obra.descricao}</p>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-outline-variant pt-3">
          <span className="flex items-center gap-1 font-label text-label-sm text-on-surface-variant">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            {obra.cidade}/{obra.uf}
          </span>
          <span aria-hidden="true" className="inline-flex items-center gap-1 font-label text-label-lg text-primary">
            Ver detalhes
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
