import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { getContentSource } from "@/lib/content/source";
import { NAV_ITEMS } from "@/lib/nav";

const REDES = { linkedin: "LinkedIn", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" } as const;

const LINK = "underline-offset-4 hover:underline";

export async function Footer() {
  const c = await getContentSource().getConfiguracoes();
  const { endereco } = c;
  return (
    <footer className="bg-surface-inverse text-text-on-inverse">
      <Container className="grid gap-12 py-16 lg:grid-cols-[2fr_1fr_2fr]">
        <div className="flex flex-col gap-6">
          <Logo variant="completo" className="h-24 w-auto self-start" />
          <p className="text-sm text-text-on-inverse-secondary">
            {c.razaoSocial}
            <br />
            CNPJ {c.cnpj}
          </p>
          {c.siglaValores && (
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">{c.siglaValores}</p>
          )}
        </div>

        <nav aria-label="Rodapé">
          <ul className="flex flex-col gap-2 text-base">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={LINK}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-6 text-base">
          <address className="not-italic text-text-on-inverse-secondary">
            {endereco.logradouro}
            <br />
            {endereco.cidade}/{endereco.uf}, CEP {endereco.cep}
            <br />
            {c.telefone}
          </address>
          {c.redes.length > 0 && (
            <ul className="flex gap-6">
              {c.redes.map((r) => (
                <li key={r.rede}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {REDES[r.rede]}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
      <div className="border-t border-text-on-inverse/20">
        <Container className="flex flex-col gap-2 py-6 text-sm text-text-on-inverse-secondary sm:flex-row sm:gap-6">
          <Link href="/privacidade" className={LINK}>Privacidade</Link>
          <Link href="/cookies" className={LINK}>Cookies</Link>
          <a href={c.canalDenunciasUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
            Canal de denúncias<span className="sr-only"> (abre em nova aba)</span>
          </a>
        </Container>
      </div>
    </footer>
  );
}
