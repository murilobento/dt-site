"use server";

import { getContentSource } from "@/lib/content/source";
import { AREA_ERROR, areasPermitidas, candidaturaSchema, type Candidatura } from "@/lib/leads/candidatura";
import { checkTurnstile, firstFieldErrors, formText, isHoneypotFilled, MSG_TURNSTILE } from "@/lib/leads/guard";
import { sendCandidaturaEmail } from "@/lib/leads/send";

export type CandidaturaFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: Partial<Record<keyof Candidatura, string>>;
      values: Partial<Candidatura>;
      message?: string;
    }
  | { status: "success" };

const TEXT_FIELDS = ["nome", "email", "telefone", "area", "resumo"] as const;

const MSG_SEND = "Não conseguimos enviar agora. Tente de novo em alguns minutos.";

export async function submitCandidatura(_prev: CandidaturaFormState, formData: FormData): Promise<CandidaturaFormState> {
  // Honeypot: robôs preenchem; fingimos sucesso para não dar pista.
  if (isHoneypotFilled(formData)) return { status: "success" };

  const raw: Record<string, unknown> = {};
  for (const k of TEXT_FIELDS) raw[k] = formText(formData, k);
  raw.consentimento = formData.get("consentimento") === "on";

  const parsed = candidaturaSchema.safeParse(raw);
  if (!parsed.success) {
    // O consentimento nunca volta marcado: é preciso reafirmá-lo a cada envio.
    const values: Record<string, string> = {};
    for (const k of TEXT_FIELDS) values[k] = raw[k] as string;
    return { status: "error", fieldErrors: firstFieldErrors<keyof Candidatura>(parsed.error), values: values as Partial<Candidatura> };
  }
  const candidatura = parsed.data;

  // A área precisa ser uma das oferecidas no formulário (vagas do CMS + genéricas); o select pode ser adulterado.
  let areas: string[];
  try {
    areas = areasPermitidas((await getContentSource().getPaginaCompliance()).vagas);
  } catch (err) {
    console.error("[candidaturas] falha ao ler as áreas:", err instanceof Error ? err.message : "desconhecido");
    const { consentimento: _c, ...rest } = candidatura;
    void _c;
    return { status: "error", fieldErrors: {}, values: rest, message: MSG_SEND };
  }
  if (!areas.includes(candidatura.area)) {
    const { consentimento: _c, ...rest } = candidatura;
    void _c;
    return { status: "error", fieldErrors: { area: AREA_ERROR }, values: { ...rest, area: "" } };
  }
  const { consentimento: _consentimento, ...values } = candidatura;
  void _consentimento;

  const turnstile = await checkTurnstile(formData);
  if (!turnstile.ok) return { status: "error", fieldErrors: {}, values, message: MSG_TURNSTILE };

  try {
    const cfg = await getContentSource().getConfiguracoes();
    await sendCandidaturaEmail(candidatura, cfg.emailCarreiras, { unverified: turnstile.unverified });
  } catch (err) {
    // Sem PII no log: só o tipo do erro.
    console.error("[candidaturas] falha no envio:", err instanceof Error ? err.message : "desconhecido");
    return { status: "error", fieldErrors: {}, values, message: MSG_SEND };
  }
  return { status: "success" };
}
