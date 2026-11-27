import type { Metadata } from "next";

// Layout raiz próprio do Studio: sem cabeçalho, rodapé, consentimento, GTM nem JSON-LD do site.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
