import type { ReactNode } from "react";

/** Rótulo curto (até 3 palavras) em caixa-alta, ecoando "CONSTRUTORA E CONSULTORIA" do logo. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-label text-label-sm uppercase tracking-[0.2em] ${className}`.trim()}>{children}</p>
  );
}
