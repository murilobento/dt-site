import type { Metadata } from "next";
import { LegalPage } from "@/components/consent/LegalPage";
import { getContentSource } from "@/lib/content/source";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Política de Privacidade",
  description: "Como a DT Construtora coleta, usa e protege os dados pessoais, conforme a LGPD.",
  path: "/privacidade",
});

export default async function Page() {
  const pagina = await getContentSource().getPaginaLegal("privacidade");
  return <LegalPage pagina={pagina} />;
}
