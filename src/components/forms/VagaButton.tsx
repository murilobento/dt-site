"use client";

import { ArrowRight } from "lucide-react";
import { AREA_FIELD_ID } from "./CandidaturaForm";

/** Preenche o campo "Área de interesse" do formulário de candidatura com esta vaga e leva o foco a ele. */
export function VagaButton({ titulo }: { titulo: string }) {
  function selecionar() {
    const select = document.getElementById(AREA_FIELD_ID);
    if (!(select instanceof HTMLSelectElement)) return;
    select.value = titulo;
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    select.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "center" });
    select.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={selecionar}
      className="mt-1 inline-flex items-center gap-1 self-start font-label text-label-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      Selecionar esta vaga no formulário<span className="sr-only">: {titulo}</span>
      <ArrowRight aria-hidden="true" className="size-4" />
    </button>
  );
}
