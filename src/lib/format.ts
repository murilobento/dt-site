const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"] as const;

/** `142000` → `"142.000"` (ponto de milhar, independente do locale do runtime). */
export function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatMes(ym: string): string {
  const [ano, mes] = ym.split("-");
  return `${MESES[Number(mes) - 1]}/${ano}`;
}

/** `"2024-05","2029-05"` → `"mai/2024 a mai/2029"`; sem término → `"desde mai/2024"`. */
export function formatPeriodo(inicio: string, termino?: string): string {
  return termino ? `${formatMes(inicio)} a ${formatMes(termino)}` : `desde ${formatMes(inicio)}`;
}
