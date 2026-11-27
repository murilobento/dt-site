/**
 * Descobre quais campos de um schema chamam `Rule.required()`, sem rodar o Studio:
 * a função de validação recebe um Rule falso que só registra as chamadas.
 */
interface FieldLike { name: string; validation?: unknown; fields?: FieldLike[] }

function calls(validation: unknown): string[] {
  if (!validation) return [];
  const fns = Array.isArray(validation) ? validation : [validation];
  const seen: string[] = [];
  const rule: unknown = new Proxy(function () {}, {
    get: (_t, prop) => () => {
      seen.push(String(prop));
      return rule;
    },
  });
  for (const fn of fns) if (typeof fn === 'function') (fn as (r: unknown) => unknown)(rule);
  return seen;
}

export function requiredFields(def: { fields?: readonly unknown[] }, nested?: string): string[] {
  const top = (def.fields ?? []) as FieldLike[];
  const fields = nested ? top.find((f) => f.name === nested)?.fields : top;
  return (fields ?? []).filter((f) => calls(f.validation).includes('required')).map((f) => f.name);
}
