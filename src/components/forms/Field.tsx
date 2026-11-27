import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  /** Marca o campo como obrigatório: asterisco visual e `aria-required` no controle. */
  required?: boolean;
  children: (a11y: { id: string; "aria-required"?: true; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
};

export const CONTROL_CLASS =
  "mt-1.5 block min-h-12 w-full rounded-sm border border-outline bg-surface-container-lowest px-4 py-2.5 font-body text-body-md text-on-surface aria-[invalid=true]:border-error focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** Rótulo + controle + erro ligados por `for`/`aria-describedby`; `children` recebe os atributos de a11y. */
export function Field({ id, label, error, required, children }: FieldProps) {
  const errorId = `${id}-erro`;
  return (
    <div>
      <label htmlFor={id} className="font-label text-label-lg text-on-surface">
        {label}
        {required && (
          <span aria-hidden="true"> *</span>
        )}
      </label>
      {children({ id, ...(required ? { "aria-required": true as const } : {}), ...(error ? { "aria-invalid": true as const, "aria-describedby": errorId } : {}) })}
      {error && (
        <p id={errorId} className="mt-1.5 font-body text-body-md text-error">
          {error}
        </p>
      )}
    </div>
  );
}
