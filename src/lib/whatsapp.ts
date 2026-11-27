const DEFAULT_MESSAGE = "Olá! Vim pelo site da DT e quero falar com o comercial.";

function messageFor(pathname: string, pageTitle?: string): string {
  const title = pageTitle?.trim();
  if (!title) return DEFAULT_MESSAGE;
  if (/^\/obras\/[^/]+\/?$/.test(pathname)) return `Olá! Vi a obra ${title} no site da DT e quero falar com o comercial.`;
  if (/^\/servicos\/[^/]+\/?$/.test(pathname)) return `Olá! Vi o serviço ${title} no site da DT e quero falar com o comercial.`;
  return DEFAULT_MESSAGE;
}

/** URL wa.me com mensagem contextual; pura (o título da página vem de quem chama). */
export function buildWhatsAppUrl(phone: string, pathname: string, pageTitle?: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(messageFor(pathname, pageTitle))}`;
}

/** "5514981734581" → "+55 (14) 98173-4581" (celular BR). Outros formatos voltam como "+dígitos". */
export function formatWhatsAppDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(d);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : `+${d}`;
}
