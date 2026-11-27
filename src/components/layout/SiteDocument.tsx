import { CookieBanner } from "@/components/consent/CookieBanner";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { GtmLoader } from "@/components/consent/GtmLoader";
import { VercelTelemetry } from "@/components/consent/VercelTelemetry";
import { JsonLd } from "@/components/seo/JsonLd";
import { CONSENT_COOKIE } from "@/lib/consent/consent";
import { getContentSource } from "@/lib/content/source";
import { FONT_VARIABLES } from "@/lib/fonts";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { getSiteUrl } from "@/lib/site";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SkipLink } from "./SkipLink";
import { WhatsAppButton } from "./WhatsAppButton";

/** Roda antes do primeiro paint: evita o flash do banner de cookies para quem já decidiu. */
const CONSENT_FLAG = `if(document.cookie.indexOf("${CONSENT_COOKIE}=")>-1)document.documentElement.dataset.consent="decided"`;

/** Documento completo do site (html, cabeçalho, rodapé, consentimento). Usado pelo layout raiz do grupo (site) e pelo 404 global. */
export async function SiteDocument({ children }: { children: React.ReactNode }) {
  const config = await getContentSource().getConfiguracoes();
  // O script CONSENT_FLAG marca data-consent no <html> antes da hidratação (esconde o banner
  // para quem já decidiu); suppressHydrationWarning cobre só os atributos deste elemento.
  return (
    <html lang="pt-BR" className={FONT_VARIABLES} suppressHydrationWarning>
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
