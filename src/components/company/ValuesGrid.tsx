type Valor = { titulo: string; descricao: string };

export function ValuesGrid({ valores }: { valores: Valor[] }) {
  return (
    <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {valores.map((v) => (
        <li key={v.titulo} className="rounded-lg border border-border bg-surface-default p-6">
          <h3 className="text-xl text-text-primary">{v.titulo}</h3>
          <p className="mt-2 text-base text-text-secondary">{v.descricao}</p>
        </li>
      ))}
    </ul>
  );
}
