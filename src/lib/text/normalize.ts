/** Minúsculas, sem acento, espaços colapsados e aparados. */
export function normalizeForSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
