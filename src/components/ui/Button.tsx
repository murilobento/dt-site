import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type CommonProps = {
  variant?: Variant;
  /** Para fundos escuros: o primário vira branco com texto #111111. */
  inverse?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps =
  | (CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | keyof CommonProps>)
  | (CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>);

const BASE =
  "inline-flex items-center justify-center rounded-control px-6 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

function styles(variant: Variant, inverse: boolean): string {
  if (variant === "primary") {
    return inverse
      ? "bg-surface-default text-text-primary hover:bg-surface-muted"
      : "bg-brand-primary text-text-on-inverse hover:bg-brand-primary-hover";
  }
  if (variant === "secondary") {
    return inverse
      ? "border border-text-on-inverse text-text-on-inverse hover:bg-text-on-inverse/10"
      : "border border-brand-primary text-brand-primary hover:bg-surface-muted";
  }
  return inverse
    ? "text-text-on-inverse underline underline-offset-4"
    : "text-brand-primary underline underline-offset-4";
}

export function Button(props: ButtonProps) {
  const { variant = "primary", inverse = false, className = "", children, ...rest } = props;
  const cls = `${BASE} ${styles(variant, inverse)} ${className}`.trim();
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
