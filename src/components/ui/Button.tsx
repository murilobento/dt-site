import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost";

type CommonProps = {
  variant?: Variant;
  /** Para fundos escuros (navy): ajusta cores e contorno de foco de cada variante. */
  inverse?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps =
  | (CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | keyof CommonProps>)
  | (CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>);

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm min-h-12 px-6 py-2 font-label text-label-lg transition-colors duration-state-change ease-state-change disabled:cursor-not-allowed disabled:opacity-50";

function styles(variant: Variant, inverse: boolean): string {
  if (variant === "primary") {
    // Navy `primary`; sobre navy vira branco com texto primary.
    return inverse
      ? "bg-white text-primary hover:bg-surface-container-high focus-visible:outline-white"
      : "bg-primary text-on-primary hover:bg-primary-container focus-visible:outline-primary";
  }
  if (variant === "accent") {
    // Laranja de destaque: secondary-container com texto primary (8,3:1). Nunca texto branco.
    return inverse
      ? "bg-secondary-container text-primary hover:bg-white focus-visible:outline-white"
      : "bg-secondary-container text-primary hover:bg-secondary hover:text-white focus-visible:outline-primary";
  }
  if (variant === "secondary") {
    return inverse
      ? "border border-on-primary-container text-white hover:bg-white/10 focus-visible:outline-white"
      : "border border-primary text-primary hover:bg-surface-container-low focus-visible:outline-primary";
  }
  return inverse
    ? "text-white underline underline-offset-4 focus-visible:outline-white"
    : "text-primary underline underline-offset-4 focus-visible:outline-primary";
}

export function Button(props: ButtonProps) {
  const { variant = "primary", inverse = false, className = "", children, ...rest } = props;
  const cls = cn(BASE, styles(variant, inverse), className);
  if (rest.href !== undefined) {
    return (
      <Link className={cls} {...(rest as React.ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }
  const { href: _href, type = "button", ...btn } = rest as ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
  void _href;
  return (
    <button type={type} className={cls} {...btn}>
      {children}
    </button>
  );
}
