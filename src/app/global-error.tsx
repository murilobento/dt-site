"use client";

import { useEffect } from "react";
import "./(site)/globals.css";
import { Button } from "@/components/ui/Button";
import { FONT_VARIABLES } from "@/lib/fonts";

/** Erro no layout raiz do site: substitui o documento inteiro, então traz o próprio html/body (pt-BR). */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Sem DSN o ramo é descartado no build e nada do Sentry chega ao cliente.
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
    }
  }, [error]);
  return (
    <html lang="pt-BR" className={FONT_VARIABLES}>
      <body>
        <main className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
          <h1 className="font-display text-display-lg-mobile text-primary lg:text-display-lg">Algo deu errado</h1>
          <p className="mt-6 max-w-2xl text-body-lg text-on-surface-variant">Tente de novo em alguns instantes.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button onClick={() => retry()}>Tentar de novo</Button>
            {/* <a> simples: fora do layout raiz o roteador pode estar quebrado, e o link precisa recarregar tudo. */}
            <a
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-primary px-6 py-2 font-label text-label-lg text-primary hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Ir para o início
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
