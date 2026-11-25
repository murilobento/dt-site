import { z } from "zod";
import type { Segmento } from "@/lib/content/types";

export const EMAIL_ERROR = "Confira o e-mail. Ele precisa ter @ e um domínio, como nome@empresa.com.br.";

const SEGMENTOS = ["obras-civis", "infraestrutura"] as const satisfies readonly Segmento[];

const required = (msg: string, max = 200) => z.string({ error: msg }).trim().min(1, msg).max(max, msg);

export const leadSchema = z.object({
  nome: required("Informe seu nome."),
  empresa: required("Informe a empresa."),
  cargo: z.string().trim().max(200).optional(),
  email: z.string({ error: EMAIL_ERROR }).trim().pipe(z.email({ error: EMAIL_ERROR })),
  telefone: z
    .string({ error: "Informe um telefone com DDD." })
    .trim()
    .max(40, "Informe um telefone com DDD.")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
  segmento: z.enum(SEGMENTOS, { error: "Escolha o segmento." }),
  tipoObra: required("Informe o tipo de obra."),
  local: required("Informe o local da obra."),
  mensagem: required("Escreva uma mensagem.", 5000),
  consentimento: z.literal(true, { error: "É preciso aceitar para enviarmos sua mensagem." }),
  origem: z.string().trim().max(100).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
