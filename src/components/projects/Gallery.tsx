"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Imagem } from "@/lib/content/types";
import { Lightbox } from "./Lightbox";

/** Grade de miniaturas; cada uma é um botão que abre o lightbox naquela foto. */
export function Gallery({ fotos }: { fotos: Imagem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const opener = useRef(0);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  if (fotos.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {fotos.map((foto, i) => (
          <li key={foto.url}>
            <button
              type="button"
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              onClick={() => {
                opener.current = i;
                setIndex(i);
              }}
              aria-label={`Ampliar foto ${i + 1}: ${foto.alt}`}
              className="relative block aspect-[8/5] w-full overflow-hidden rounded-card bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <Image
                src={foto.url}
                alt=""
                fill
                sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw"
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox fotos={fotos} index={index} onIndexChange={setIndex}
        onCloseFocus={() => thumbs.current[opener.current]?.focus()}
      />
    </>
  );
}
