import { headers } from "next/headers";
import type { ZodError } from "zod";
import { verifyTurnstile } from "./turnstile";

export const MSG_TURNSTILE = "Não foi possível validar o envio. Recarregue a página e tente de novo.";

/** Valor de texto de um campo do FormData ("" se ausente ou se for arquivo). */
export function formText(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

/** Honeypot: robôs preenchem o campo `website`; quem chama finge sucesso para não dar pista. */
export function isHoneypotFilled(formData: FormData): boolean {
  return formText(formData, "website").trim() !== "";
}

/** Primeira mensagem de erro de cada campo. */
export function firstFieldErrors<K extends string>(error: ZodError): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  for (const [k, msgs] of Object.entries(error.flatten().fieldErrors)) {
    const first = (msgs as string[] | undefined)?.[0];
    if (first) out[k as K] = first;
  }
  return out;
}

/**
 * Decisão do Turnstile. Token presente deve passar. Token ausente com secret configurado é o caminho
 * sem JavaScript: aceitamos, mas o e-mail segue marcado como não verificado.
 */
export async function checkTurnstile(formData: FormData): Promise<{ ok: true; unverified: boolean } | { ok: false }> {
  const token = formText(formData, "cf-turnstile-response");
  const unverified = !token && Boolean(process.env.TURNSTILE_SECRET_KEY);
  if (!token) return { ok: true, unverified };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  return (await verifyTurnstile(token, ip)) ? { ok: true, unverified: false } : { ok: false };
}
