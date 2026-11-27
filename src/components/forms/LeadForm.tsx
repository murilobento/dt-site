"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLead, type LeadFormState } from "@/app/(site)/contato/actions";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/track";
import { DISCIPLINA_OPCAO, DISCIPLINAS, type Disciplina } from "@/lib/disciplinas";
import { CONTROL_CLASS, Field } from "./Field";
import { ConsentField, Honeypot, recoverAfterError, RequiredLegend, TurnstileWidget } from "./FormGuards";

const SUCCESS = "Recebemos sua mensagem. Nossa equipe responde em até 2 dias úteis.";

type LeadFormProps = {
  disciplinaInicial?: Disciplina;
  origem?: string;
  whatsappHref: string;
};

export function LeadForm({ disciplinaInicial, origem, whatsappHref }: LeadFormProps) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const values = state.status === "error" ? state.values : {};
  const errors = state.status === "error" ? state.fieldErrors : {};

  useEffect(() => {
    if (state.status === "success") {
      track("lead_submit", { segmento: state.segmento, disciplina: state.disciplina });
    }
    if (state.status !== "error") return;
    recoverAfterError(formRef.current);
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-md border border-primary bg-surface-container-low p-6 font-body text-body-lg text-on-surface">
        {SUCCESS}
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-5" aria-busy={pending}>
      {state.status === "error" && state.message && (
        <div role="alert" tabIndex={-1} data-form-message className="rounded-md border border-error p-4 font-body text-body-md text-error">
          <p>{state.message}</p>
          {state.message.includes("WhatsApp") && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline">
              Falar pelo WhatsApp (abre em nova aba)
            </a>
          )}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="nome" label="Nome completo" required error={errors.nome}>
          {(a) => <input {...a} name="nome" placeholder="Ex.: Ricardo Almeida" type="text" autoComplete="name" defaultValue={values.nome} className={CONTROL_CLASS} />}
        </Field>
        <Field id="empresa" label="Empresa / Órgão" required error={errors.empresa}>
          {(a) => <input {...a} name="empresa" placeholder="Concessionária, prefeitura ou empresa" type="text" autoComplete="organization" defaultValue={values.empresa} className={CONTROL_CLASS} />}
        </Field>
        <Field id="email" label="E-mail corporativo" required error={errors.email}>
          {(a) => <input {...a} name="email" placeholder="contato@empresa.com.br" type="email" autoComplete="email" defaultValue={values.email} className={CONTROL_CLASS} />}
        </Field>
        <Field id="telefone" label="Telefone / WhatsApp" required error={errors.telefone}>
          {(a) => <input {...a} name="telefone" placeholder="(18) 99999-0000" type="tel" autoComplete="tel" defaultValue={values.telefone} className={CONTROL_CLASS} />}
        </Field>
        <Field id="disciplina" label="Disciplina principal" required error={errors.disciplina}>
          {(a) => (
            <select {...a} key={values.disciplina ?? "inicial"} name="disciplina" defaultValue={values.disciplina ?? disciplinaInicial ?? ""} className={CONTROL_CLASS}>
              <option value="">Selecione</option>
              {DISCIPLINAS.map((d) => (
                <option key={d} value={d}>
                  {DISCIPLINA_OPCAO[d]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="cidadeUf" label="Cidade / UF da obra" error={errors.cidadeUf}>
          {(a) => <input {...a} name="cidadeUf" placeholder="Ex.: Regente Feijó — SP" type="text" autoComplete="address-level2" defaultValue={values.cidadeUf} className={CONTROL_CLASS} />}
        </Field>
      </div>
      <Field id="escopo" label="Escopo resumido, prazo ou número do edital" required error={errors.escopo}>
        {(a) => <textarea {...a} name="escopo" placeholder="Descreva extensão aproximada, área em m², tipo de intervenção ou link/código do edital." rows={4} defaultValue={values.escopo} className={CONTROL_CLASS} />}
      </Field>

      <ConsentField error={errors.consentimento}>Concordo com o uso dos meus dados para retorno do contato, conforme a</ConsentField>

      <input type="hidden" name="origem" value={values.origem ?? origem ?? ""} />

      <Honeypot />
      <TurnstileWidget />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <RequiredLegend />
        <Button type="submit" disabled={pending} aria-disabled={pending} className="w-full sm:w-auto">
          {pending ? "Enviando…" : "Enviar solicitação técnica"}
        </Button>
      </div>
    </form>
  );
}
