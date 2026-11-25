import type { Metadata } from "next";
import { LegalPage } from "@/components/consent/LegalPage";
import { getContentSource } from "@/lib/content/source";

export const metadata: Metadata = { title: "Política de Cookies" };

export default async function Page() {
  const pagina = await getContentSource().getPaginaLegal("cookies");
  return <LegalPage pagina={pagina} />;
}
