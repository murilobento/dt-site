"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/track";

type TrackedCtaProps = {
  href: string;
  /** Posição do CTA na página, enviada como `local` em `cta_click`. */
  local: string;
  inverse?: boolean;
  variant?: "primary" | "accent" | "secondary" | "ghost";
  className?: string;
  children: ReactNode;
};

export function TrackedCta({ local, ...props }: TrackedCtaProps) {
  return <Button {...props} onClick={() => track("cta_click", { local })} />;
}
