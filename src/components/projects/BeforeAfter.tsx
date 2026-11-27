import Image from "next/image";
import type { Obra } from "@/lib/content/types";

type Props = { antesDepois: NonNullable<Obra["antesDepois"]> };

/** Duas fotos lado a lado (sem slider arrastável nesta fase). */
export function BeforeAfter({ antesDepois }: Props) {
  const items = [
    { rotulo: "Antes", img: antesDepois.antes },
    { rotulo: "Depois", img: antesDepois.depois },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map(({ rotulo, img }) => (
        <figure key={rotulo}>
          <div className="relative aspect-[8/5] overflow-hidden rounded-md bg-surface-container">
            <Image src={img.url} alt={img.alt} fill sizes="(min-width: 48rem) 50vw, 100vw" className="object-cover" />
          </div>
          <figcaption className="mt-2 text-label-lg text-on-surface-variant">{rotulo}</figcaption>
        </figure>
      ))}
    </div>
  );
}
