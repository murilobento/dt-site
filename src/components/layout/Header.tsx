import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { CTA } from "@/lib/nav";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest">
      <Container className="flex h-16 items-center justify-between gap-6 md:h-20">
        <Link href="/" aria-label="DT Construtora — página inicial" className="shrink-0 text-primary">
          <Logo variant="compacto" className="h-10 w-auto md:h-12" />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <NavLinks />
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Button href={CTA.href} className="hidden whitespace-nowrap lg:inline-flex">
            {CTA.label}
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
