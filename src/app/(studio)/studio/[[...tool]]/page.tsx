import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// O Studio nunca deve ser indexado nem entrar no sitemap.
export const metadata: Metadata = {
  title: 'Studio | DT Construtora',
  robots: { index: false, follow: false },
};
export { viewport } from 'next-sanity/studio';

// Importado só quando o projeto existe: sem o ID, o build não carrega o Studio.
const Studio = dynamic(() => import('./Studio'));

export default function StudioPage() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1>Sanity não configurado</h1>
        <p>Defina NEXT_PUBLIC_SANITY_PROJECT_ID para usar o Studio. Veja docs/sanity-setup.md.</p>
      </main>
    );
  }
  return <Studio />;
}
