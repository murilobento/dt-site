const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

let warned = false;

/**
 * Valida o token do Cloudflare Turnstile no servidor. Sem `TURNSTILE_SECRET_KEY` a checagem
 * é pulada (dev/e2e offline) com um único aviso; com a chave, qualquer falha significa recusa.
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (!warned) {
      warned = true;
      console.warn("[leads] TURNSTILE_SECRET_KEY ausente: verificação do Turnstile desativada.");
    }
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
