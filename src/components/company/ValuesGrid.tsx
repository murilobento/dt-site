type Valor = { titulo: string; descricao: string };

export function ValuesGrid({ valores }: { valores: Valor[] }) {
  return (
    <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {valores.map((v) => (
        <li key={v.titulo} className="rounded-md border border-outline-variant bg-surface-container-lowest p-6">
          <h3 className="font-title text-title-lg text-on-surface">{v.titulo}</h3>
          <p className="mt-2 font-body text-body-md text-pretty text-on-surface-variant">{v.descricao}</p>
        </li>
      ))}
    </ul>
  );
}
