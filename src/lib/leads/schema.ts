import { z } from "zod";
import { DISCIPLINAS, type Disciplina } from "@/lib/disciplinas";

export const EMAIL_ERROR = "Confira o e-mail. Ele precisa ter @ e um domínio, como nome@empresa.com.br.";

const required = (msg: string, max = 200) => z.string({ error: msg }).trim().min(1, msg).max(max, msg);

export const leadSchema = z.object({
  nome: required("Informe seu nome."),
  empresa: required("Informe a empresa."),
  email: z.string({ error: EMAIL_ERROR }).trim().pipe(z.email({ error: EMAIL_ERROR })),
  telefone: z
    .string({ error: "Informe um telefone com DDD." })
    .trim()
    .max(40, "Informe um telefone com DDD.")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
  disciplina: z.enum(DISCIPLINAS as [Disciplina, ...Disciplina[]], { error: "Escolha a disciplina principal." }),
  cidadeUf: z.string().trim().max(200).optional(),
  escopo: required("Descreva o escopo, o prazo ou o número do edital.", 5000),
  consentimento: z.literal(true, { error: "É preciso aceitar para enviarmos sua mensagem." }),
  origem: z.string().trim().max(100).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
