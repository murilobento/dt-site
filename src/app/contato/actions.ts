"use server";

import type { Disciplina } from "@/lib/disciplinas";
import type { Segmento } from "@/lib/content/types";
import { getContentSource } from "@/lib/content/source";
import { DISCIPLINA_SEGMENTO, isDisciplina } from "@/lib/disciplinas";
import { leadSchema, type Lead } from "@/lib/leads/schema";
import { resolveLeadRecipient } from "@/lib/leads/routing";
import { sendLeadEmail } from "@/lib/leads/send";
import { checkTurnstile, firstFieldErrors, formText as text, isHoneypotFilled, MSG_TURNSTILE } from "@/lib/leads/guard";

export type LeadFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: Partial<Record<keyof Lead, string>>;
      values: Partial<Lead>;
      message?: string;
    }
  | { status: "success"; segmento: Segmento; disciplina: Disciplina };

const TEXT_FIELDS = ["nome", "empresa", "email", "telefone", "disciplina", "cidadeUf", "escopo", "origem"] as const;

const MSG_SEND = "Não conseguimos enviar agora. Tente de novo em alguns minutos ou fale pelo WhatsApp.";

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  // Honeypot: robôs preenchem; fingimos sucesso para não dar pista.
  if (isHoneypotFilled(formData)) {
    const d = text(formData, "disciplina");
    return { status: "success", segmento: isDisciplina(d) ? DISCIPLINA_SEGMENTO[d] : "obras-civis", disciplina: isDisciplina(d) ? d : "edificacao-reforma" };
  }

  const raw: Record<string, unknown> = {};
  for (const k of TEXT_FIELDS) {
    const v = text(formData, k);
    raw[k] = k === "cidadeUf" || k === "origem" ? v || undefined : v;
  }
  raw.consentimento = formData.get("consentimento") === "on";

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = firstFieldErrors<keyof Lead>(parsed.error);
    // O consentimento nunca volta marcado: é preciso reafirmá-lo a cada envio.
    const values: Record<string, string> = {};
    for (const k of TEXT_FIELDS) if (typeof raw[k] === "string") values[k] = raw[k] as string;
    return { status: "error", fieldErrors, values: values as Partial<Lead> };
  }
  const lead = parsed.data;
  const segmento = DISCIPLINA_SEGMENTO[lead.disciplina];
  const { consentimento: _consentimento, ...values } = lead;
  void _consentimento;

  const turnstile = await checkTurnstile(formData);
  if (!turnstile.ok) {
    return { status: "error", fieldErrors: {}, values, message: MSG_TURNSTILE };
  }

  try {
    const cfg = await getContentSource().getConfiguracoes();
    await sendLeadEmail(lead, resolveLeadRecipient(segmento, cfg), { unverified: turnstile.unverified });
  } catch (err) {
    // Sem PII no log: só o tipo do erro.
    console.error("[leads] falha no envio:", err instanceof Error ? err.message : "desconhecido");
    return { status: "error", fieldErrors: {}, values, message: MSG_SEND };
  }
  return { status: "success", segmento, disciplina: lead.disciplina };
}
