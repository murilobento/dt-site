import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { CTA, NAV_ITEMS } from "@/lib/nav";
import { MobileNav } from "./MobileNav";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-default">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="DT Construtora — página inicial" className="text-text-primary">
          <Logo variant="compacto" className="h-10 w-auto" />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-base font-medium text-text-primary hover:underline underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button href={CTA.href} className="hidden lg:inline-flex">
            {CTA.label}
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
