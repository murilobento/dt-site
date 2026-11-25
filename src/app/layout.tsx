import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { GtmLoader } from "@/components/consent/GtmLoader";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { getContentSource } from "@/lib/content/source";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { getSiteUrl } from "@/lib/site";

// Fontes variáveis auto-hospedadas (@fontsource-variable), subset latin.
const archivo = localFont({
  src: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2",
  weight: "600 800",
  display: "swap",
  variable: "--font-archivo",
});

const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "400 600",
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "DT Construtora",
  description: "DT Construtora e Consultoria",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const config = await getContentSource().getConfiguracoes();
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd(config, getSiteUrl())} />
        <ConsentProvider>
          <SkipLink />
          <Header />
          <main id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <WhatsAppButton phone={config.whatsapp} />
          <CookieBanner />
          <GtmLoader />
        </ConsentProvider>
      </body>
    </html>
  );
}
