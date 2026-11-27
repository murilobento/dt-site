"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLead, type LeadFormState } from "@/app/contato/comercial/actions";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/track";
import type { Segmento } from "@/lib/content/types";
import { SEGMENTO_LABEL } from "@/lib/segmentos";
import { CONTROL_CLASS, Field } from "./Field";
import { ConsentField, Honeypot, recoverAfterError, TurnstileWidget } from "./FormGuards";

const SUCCESS = "Recebemos sua mensagem. Nossa equipe responde em até 2 dias úteis.";

type LeadFormProps = {
  segmentoInicial?: Segmento;
  origem?: string;
  whatsappHref: string;
};

export function LeadForm({ segmentoInicial, origem, whatsappHref }: LeadFormProps) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const values = state.status === "error" ? state.values : {};
  const errors = state.status === "error" ? state.fieldErrors : {};

  useEffect(() => {
    if (state.status === "success") {
      track("lead_submit", { segmento: state.segmento });
    }
    if (state.status !== "error") return;
    recoverAfterError(formRef.current);
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-card border border-success p-6 text-lg text-text-primary">
        {SUCCESS}
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-6" aria-busy={pending}>
      {state.status === "error" && state.message && (
        <div role="alert" tabIndex={-1} data-form-message className="rounded-card border border-error p-4 text-base text-error">
          <p>{state.message}</p>
          {state.message.includes("WhatsApp") && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline">
              Falar pelo WhatsApp (abre em nova aba)
            </a>
          )}
        </div>
      )}

      <Field id="nome" label="Nome" error={errors.nome}>
        {(a) => <input {...a} name="nome" type="text" autoComplete="name" defaultValue={values.nome} className={CONTROL_CLASS} />}
      </Field>
      <Field id="empresa" label="Empresa" error={errors.empresa}>
        {(a) => <input {...a} name="empresa" type="text" autoComplete="organization" defaultValue={values.empresa} className={CONTROL_CLASS} />}
      </Field>
      <Field id="cargo" label="Cargo (opcional)" error={errors.cargo}>
        {(a) => <input {...a} name="cargo" type="text" autoComplete="organization-title" defaultValue={values.cargo} className={CONTROL_CLASS} />}
      </Field>
      <Field id="email" label="E-mail" error={errors.email}>
        {(a) => <input {...a} name="email" type="email" autoComplete="email" defaultValue={values.email} className={CONTROL_CLASS} />}
      </Field>
      <Field id="telefone" label="Telefone" error={errors.telefone}>
        {(a) => <input {...a} name="telefone" type="tel" autoComplete="tel" defaultValue={values.telefone} className={CONTROL_CLASS} />}
      </Field>
      <Field id="segmento" label="Segmento" error={errors.segmento}>
        {(a) => (
          <select {...a} key={values.segmento ?? "inicial"} name="segmento" defaultValue={values.segmento ?? segmentoInicial ?? ""} className={CONTROL_CLASS}>
            <option value="">Selecione</option>
            {(Object.keys(SEGMENTO_LABEL) as Segmento[]).map((s) => (
              <option key={s} value={s}>
                {SEGMENTO_LABEL[s]}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="tipoObra" label="Tipo de obra" error={errors.tipoObra}>
        {(a) => <input {...a} name="tipoObra" type="text" defaultValue={values.tipoObra} className={CONTROL_CLASS} />}
      </Field>
      <Field id="local" label="Local da obra" error={errors.local}>
        {(a) => <input {...a} name="local" type="text" defaultValue={values.local} className={CONTROL_CLASS} />}
      </Field>
      <Field id="mensagem" label="Mensagem" error={errors.mensagem}>
        {(a) => <textarea {...a} name="mensagem" rows={5} defaultValue={values.mensagem} className={CONTROL_CLASS} />}
      </Field>

      <ConsentField error={errors.consentimento}>Concordo com o uso dos meus dados para retorno do contato, conforme a</ConsentField>

      <input type="hidden" name="origem" value={values.origem ?? origem ?? ""} />

      <Honeypot />
      <TurnstileWidget />

      <div>
        <Button type="submit" disabled={pending} aria-disabled={pending}>
          {pending ? "Enviando…" : "Solicitar proposta"}
        </Button>
      </div>
    </form>
  );
}
