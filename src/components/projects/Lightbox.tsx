"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import type { Imagem } from "@/lib/content/types";

type LightboxProps = {
  fotos: Imagem[];
  /** Índice da foto aberta, ou null se fechado. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** Chamado ao fechar; o gatilho não é um Dialog.Trigger, então quem abriu devolve o foco. */
  onCloseFocus: () => void;
};

/** Diálogo com navegação por setas (circular). */
export function Lightbox({ fotos, index, onIndexChange, onCloseFocus }: LightboxProps) {
  const total = fotos.length;
  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );
  const foto = index === null ? null : fotos[index];

  return (
    <Dialog.Root open={index !== null} onOpenChange={(open) => !open && onIndexChange(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-primary/90" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            onCloseFocus();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(-1);
            else if (e.key === "ArrowRight") go(1);
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 text-white"
        >
          <Dialog.Title className="sr-only">Galeria de fotos</Dialog.Title>
          {foto && (
            <figure className="flex max-h-[75vh] max-w-5xl flex-col items-center gap-3">
              <Image
                src={foto.url}
                alt={foto.alt}
                width={foto.width}
                height={foto.height}
                sizes="(min-width: 64rem) 1024px, 100vw"
                className="max-h-[65vh] w-auto rounded-md object-contain"
              />
              <figcaption className="text-center text-base text-white">{foto.alt}</figcaption>
            </figure>
          )}
          <p className="text-sm text-on-primary-container" aria-live="polite">
            {index !== null && `${index + 1} de ${total}`}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" inverse onClick={() => go(-1)}>
              Anterior
            </Button>
            <Button variant="secondary" inverse onClick={() => go(1)}>
              Próxima
            </Button>
            <Dialog.Close asChild>
              <Button inverse>Fechar</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
