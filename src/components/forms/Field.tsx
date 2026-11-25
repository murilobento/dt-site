import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: (a11y: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
};

export const CONTROL_CLASS =
  "mt-2 block min-h-12 w-full rounded-control border border-border bg-surface-default px-4 py-2 text-base text-text-primary aria-[invalid=true]:border-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";

/** Rótulo + controle + erro ligados por `for`/`aria-describedby`; `children` recebe os atributos de a11y. */
export function Field({ id, label, error, children }: FieldProps) {
  const errorId = `${id}-erro`;
  return (
    <div>
      <label htmlFor={id} className="text-base font-semibold text-text-primary">
        {label}
      </label>
      {children({ id, ...(error ? { "aria-invalid": true as const, "aria-describedby": errorId } : {}) })}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
