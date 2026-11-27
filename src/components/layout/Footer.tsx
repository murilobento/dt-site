import Link from "next/link";
import { PreferencesButton } from "@/components/consent/PreferencesButton";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { getContentSource } from "@/lib/content/source";
import { formatWhatsAppDisplay } from "@/lib/whatsapp";

const REDES = { linkedin: "LinkedIn", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" } as const;

/** Grupo "Atuação & Institucional" do layout. */
const GRUPO_ATUACAO = [
  { label: "Serviços", href: "/servicos" },
  { label: "Obras", href: "/obras" },
  { label: "Consultoria", href: "/servicos#consultoria" },
  { label: "Sobre Nós", href: "/sobre" },
  { label: "Compliance e Carreiras", href: "/compliance" },
] as const;

const LINK = "transition-colors duration-state-change hover:text-white hover:underline underline-offset-4";

export async function Footer() {
  const c = await getContentSource().getConfiguracoes();
  const { endereco } = c;
  const whatsappDigits = c.whatsapp.replace(/\D/g, "");
  return (
    <footer className="border-t border-primary-container bg-primary text-on-primary">
      <Container className="grid grid-cols-1 items-start gap-8 py-10 md:grid-cols-12 md:py-12">
        <div className="flex flex-col gap-4 md:col-span-5">
          <Link href="/" aria-label="DT Construtora — página inicial" className="self-start text-white">
            <Logo variant="completo" className="h-20 w-auto md:h-24" />
          </Link>
          <p className="max-w-sm text-pretty font-body text-body-md text-on-primary-container">
            Construtora e consultoria especializada em infraestrutura rodoviária, terraplanagem, drenagem, SAUs,
            PREs, edificações e reformas.
          </p>
          <p className="font-body text-body-md text-on-primary-container">
            {c.razaoSocial}
            <br />
            CNPJ {c.cnpj}
          </p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-col gap-3 md:col-span-3">
          <h2 className="font-title text-title-md text-white">Atuação &amp; Institucional</h2>
          <ul className="flex flex-col gap-2 font-body text-body-md text-on-primary-container">
            {GRUPO_ATUACAO.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={LINK}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 md:col-span-4">
          <h2 className="font-title text-title-md text-white">Contato Institucional</h2>
          <address className="font-body text-body-md not-italic text-on-primary-container">
            {endereco.logradouro}
            <br />
            {endereco.cidade}/{endereco.uf}, CEP {endereco.cep}
          </address>
          <a
            href={`https://wa.me/${whatsappDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`self-start font-mono text-mono-md tabular-nums text-on-primary-container ${LINK}`}
          >
            {formatWhatsAppDisplay(c.whatsapp)}
            <span className="sr-only"> (WhatsApp, abre em nova aba)</span>
          </a>
          <a
            href={`tel:${c.telefone.replace(/[^\d+]/g, "")}`}
            className={`self-start font-mono text-mono-md tabular-nums text-on-primary-container ${LINK}`}
          >
            {c.telefone}
          </a>
          {c.redes.length > 0 && (
            <ul className="flex gap-6 font-body text-body-md text-on-primary-container">
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

      <div className="border-t border-primary-container">
        <Container className="flex flex-col gap-2 py-4 font-label text-label-sm text-on-primary-container sm:flex-row sm:items-center sm:gap-6">
          <span className="sm:mr-auto">© DT Construtora e Consultoria. Todos os direitos reservados.</span>
          <Link href="/privacidade" className={LINK}>
            Privacidade
          </Link>
          <Link href="/cookies" className={LINK}>
            Cookies
          </Link>
          <PreferencesButton className={`${LINK} text-left`} />
          <a href={c.canalDenunciasUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
            Canal de denúncias<span className="sr-only"> (abre em nova aba)</span>
          </a>
        </Container>
      </div>
    </footer>
  );
}
