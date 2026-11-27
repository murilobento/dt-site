import { z } from "zod";
import { EMAIL_ERROR } from "./schema";

const required = (msg: string, max = 200) => z.string({ error: msg }).trim().min(1, msg).max(max, msg);

/** Áreas fixas do formulário; as vagas abertas do CMS entram além destas. */
export const AREAS_GENERICAS = [
  "Engenharia Rodoviária / Pavimentação",
  "Segurança do Trabalho",
  "Obras e Edificações",
  "Administrativo",
] as const;

/** Áreas aceitas: títulos das vagas abertas (CMS) mais as genéricas, sem repetição. */
export function areasPermitidas(vagas: { titulo: string }[]): string[] {
  return [...new Set([...vagas.map((v) => v.titulo), ...AREAS_GENERICAS])];
}

export const AREA_ERROR = "Escolha a área de interesse.";

export const candidaturaSchema = z.object({
  nome: required("Informe seu nome."),
  email: z.string({ error: EMAIL_ERROR }).trim().pipe(z.email({ error: EMAIL_ERROR })),
  telefone: z
    .string({ error: "Informe um telefone com DDD." })
    .trim()
    .max(40, "Informe um telefone com DDD.")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
  area: required(AREA_ERROR),
  resumo: required("Conte um pouco da sua experiência ou cole o link do currículo.", 5000),
  consentimento: z.literal(true, { error: "É preciso aceitar para analisarmos sua candidatura." }),
});

export type Candidatura = z.infer<typeof candidaturaSchema>;
