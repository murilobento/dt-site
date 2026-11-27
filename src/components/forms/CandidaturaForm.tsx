"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitCandidatura, type CandidaturaFormState } from "@/app/compliance/actions";
import { Button } from "@/components/ui/Button";
import { CONTROL_CLASS, Field } from "./Field";
import { ConsentField, Honeypot, recoverAfterError, TurnstileWidget } from "./FormGuards";

export const SUCCESS = "Recebemos sua candidatura. Se houver uma vaga compatível, entraremos em contato.";

/** Id do campo "Área de interesse": os botões das vagas apontam para ele. */
export const AREA_FIELD_ID = "area";

export function CandidaturaForm({ areas }: { areas: string[] }) {
  const [state, action, pending] = useActionState<CandidaturaFormState, FormData>(submitCandidatura, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const values = state.status === "error" ? state.values : {};
  const errors = state.status === "error" ? state.fieldErrors : {};

  useEffect(() => {
    if (state.status === "error") recoverAfterError(formRef.current);
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-md border border-primary bg-surface-container-low p-6 font-body text-body-lg text-on-surface">
        {SUCCESS}
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="flex flex-col gap-4" aria-busy={pending}>
      {state.status === "error" && state.message && (
        <div role="alert" tabIndex={-1} data-form-message className="rounded-md border border-error p-4 font-body text-body-md text-error">
          <p>{state.message}</p>
        </div>
      )}

      <Field id="nome" label="Nome completo" error={errors.nome}>
        {(a) => <input {...a} name="nome" type="text" autoComplete="name" defaultValue={values.nome} className={CONTROL_CLASS} />}
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="email" label="E-mail" error={errors.email}>
          {(a) => <input {...a} name="email" type="email" autoComplete="email" defaultValue={values.email} className={CONTROL_CLASS} />}
        </Field>
        <Field id="telefone" label="Telefone / WhatsApp" error={errors.telefone}>
          {(a) => <input {...a} name="telefone" type="tel" autoComplete="tel" defaultValue={values.telefone} className={CONTROL_CLASS} />}
        </Field>
      </div>
      <Field id={AREA_FIELD_ID} label="Área de interesse" error={errors.area}>
        {(a) => (
          // A chave remonta o select após um erro: `defaultValue` só vale na montagem.
          <select {...a} key={values.area ?? "inicial"} name="area" defaultValue={values.area ?? ""} className={CONTROL_CLASS}>
            <option value="">Selecione</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="resumo" label="Resumo de experiência / Link para currículo" error={errors.resumo}>
        {(a) => (
          <textarea
            {...a}
            name="resumo"
            rows={4}
            defaultValue={values.resumo}
            placeholder="Informe registro profissional (CREA/CRT/MTE), obras relevantes e disponibilidade para viagens."
            className={CONTROL_CLASS}
          />
        )}
      </Field>

      <ConsentField error={errors.consentimento}>
        Concordo com o uso dos meus dados para processos seletivos da DT, conforme a
      </ConsentField>

      <Honeypot />
      <TurnstileWidget />

      <Button type="submit" disabled={pending} aria-disabled={pending} className="w-full">
        {pending ? "Enviando…" : "Enviar candidatura"}
      </Button>
    </form>
  );
}
