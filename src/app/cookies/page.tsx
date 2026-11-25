import type { Metadata } from "next";
import { LegalPage } from "@/components/consent/LegalPage";
import { getContentSource } from "@/lib/content/source";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Política de Cookies",
  description: "Quais cookies o site da DT Construtora usa, para que servem e como alterar o seu consentimento.",
  path: "/cookies",
});

export default async function Page() {
  const pagina = await getContentSource().getPaginaLegal("cookies");
  return <LegalPage pagina={pagina} />;
}
