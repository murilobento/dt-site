"use client";

import dynamic from "next/dynamic";
import { useConsent } from "./ConsentProvider";

// Chunk separado: quem não consente não baixa nem o código da telemetria.
const Scripts = dynamic(() => import("./VercelTelemetryScripts"));

/**
 * Vercel Analytics e Speed Insights postam em `/_vercel/*` (mesma origem, coberto por 'self' na CSP).
 * Só montam com consentimento de desempenho (LGPD: nada de analytics antes do aceite).
 */
export function VercelTelemetry() {
  const { state } = useConsent();
  return state?.desempenho ? <Scripts /> : null;
}
