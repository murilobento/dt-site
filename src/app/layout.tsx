import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { GtmLoader } from "@/components/consent/GtmLoader";
import { VercelTelemetry } from "@/components/consent/VercelTelemetry";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { CONSENT_COOKIE } from "@/lib/consent/consent";
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

/** Roda antes do primeiro paint: evita o flash do banner de cookies para quem já decidiu. */
const CONSENT_FLAG = `if(document.cookie.indexOf("${CONSENT_COOKIE}=")>-1)document.documentElement.dataset.consent="decided"`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const config = await getContentSource().getConfiguracoes();
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${inter.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_FLAG }} />
        {/* Sem JS o banner não funciona (e nada é rastreado): não deixa um bloco morto cobrindo a página. */}
        <noscript>
          <style>{"[data-cookie-banner][data-ssr]{display:none}"}</style>
        </noscript>
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
          <VercelTelemetry />
        </ConsentProvider>
      </body>
    </html>
  );
}
