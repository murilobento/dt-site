import type { Metadata } from "next";
import "./(site)/globals.css";
import NotFoundContent from "./(site)/not-found";
import { SiteDocument } from "@/components/layout/SiteDocument";

// Com dois layouts raiz não existe um layout único para compor o 404 de URLs sem rota:
// o Next usa este arquivo, que reaproveita o documento do site e o conteúdo de (site)/not-found.
export const metadata: Metadata = {
  title: "Página não encontrada | DT Construtora",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <SiteDocument>
      <NotFoundContent />
    </SiteDocument>
  );
}
