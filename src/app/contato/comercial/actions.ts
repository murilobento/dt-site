"use server";

import { headers } from "next/headers";
import type { Segmento } from "@/lib/content/types";
import { getContentSource } from "@/lib/content/source";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import { leadSchema, type Lead } from "@/lib/leads/schema";
import { resolveLeadRecipient } from "@/lib/leads/routing";
import { sendLeadEmail } from "@/lib/leads/send";
import { verifyTurnstile } from "@/lib/leads/turnstile";

export type LeadFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: Partial<Record<keyof Lead, string>>;
      values: Partial<Lead>;
      message?: string;
    }
  | { status: "success"; segmento: Segmento };

const TEXT_FIELDS = ["nome", "empresa", "cargo", "email", "telefone", "segmento", "tipoObra", "local", "mensagem", "origem"] as const;

const MSG_TURNSTILE = "Não foi possível validar o envio. Recarregue a página e tente de novo.";
const MSG_SEND = "Não conseguimos enviar agora. Tente de novo em alguns minutos ou fale pelo WhatsApp.";

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  // Honeypot: robôs preenchem; fingimos sucesso para não dar pista.
  if (text(formData, "website").trim() !== "") {
    const seg = text(formData, "segmento");
    return { status: "success", segmento: (seg in SEGMENTO_LABEL ? seg : "obras-civis") as Segmento };
  }

  const raw: Record<string, unknown> = {};
  for (const k of TEXT_FIELDS) {
    const v = text(formData, k);
    raw[k] = k === "cargo" || k === "origem" ? v || undefined : v;
  }
  raw.consentimento = formData.get("consentimento") === "on";

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof Lead, string>> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (msgs?.[0]) fieldErrors[k as keyof Lead] = msgs[0];
    }
    // O consentimento nunca volta marcado: é preciso reafirmá-lo a cada envio.
    const values: Record<string, string> = {};
    for (const k of TEXT_FIELDS) if (typeof raw[k] === "string") values[k] = raw[k] as string;
    return { status: "error", fieldErrors, values: values as Partial<Lead> };
  }
  const lead = parsed.data;
  const { consentimento: _consentimento, ...values } = lead;
  void _consentimento;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  // Token presente deve passar. Token ausente com secret configurado é o caminho sem JavaScript:
  // aceitamos, mas o e-mail segue marcado como não verificado.
  const token = text(formData, "cf-turnstile-response");
  const unverified = !token && Boolean(process.env.TURNSTILE_SECRET_KEY);
  if (token && !(await verifyTurnstile(token, ip))) {
    return { status: "error", fieldErrors: {}, values, message: MSG_TURNSTILE };
  }

  try {
    const cfg = await getContentSource().getConfiguracoes();
    await sendLeadEmail(lead, resolveLeadRecipient(lead.segmento, cfg), { unverified });
  } catch (err) {
    // Sem PII no log: só o tipo do erro.
    console.error("[leads] falha no envio:", err instanceof Error ? err.message : "desconhecido");
    return { status: "error", fieldErrors: {}, values, message: MSG_SEND };
  }
  return { status: "success", segmento: lead.segmento };
}
