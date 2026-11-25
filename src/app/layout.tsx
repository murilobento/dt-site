import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { GtmLoader } from "@/components/consent/GtmLoader";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";

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
  title: "DT Construtora",
  description: "DT Construtora e Consultoria",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${inter.variable}`}>
      <body>
        <ConsentProvider>
          <SkipLink />
          <Header />
          <main id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <GtmLoader />
        </ConsentProvider>
      </body>
    </html>
  );
}
