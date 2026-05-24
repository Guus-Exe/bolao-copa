import { z } from "zod"

import { GAME_STAGES } from "@/lib/constants"

export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um email valido.")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Informe um email completo (ex: .com, .com.br)."),
  password: z.string().min(6, "A senha precisa ter no minimo 6 caracteres.")
})


export const predictionSchema = z.object({
  gameId: z.string().uuid(),
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20)
})

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(4, "O apelido precisa ter pelo menos 4 caracteres.")
    .max(20, "O apelido pode ter no maximo 20 caracteres.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, numeros e underscore.")
})

export const signUpSchema = authSchema.merge(usernameSchema)

export const accountEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um email valido.")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Informe um email completo (ex: .com, .com.br).")
})

export const passwordUpdateSchema = z
  .object({
    password: z.string().min(6, "A senha precisa ter no minimo 6 caracteres."),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"]
  })

export const chatMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Digite uma mensagem.")
    .max(500, "A mensagem pode ter no maximo 500 caracteres.")
})

export const adminGameSchema = z.object({
  home_team: z.string().trim().min(2, "Informe o time da casa."),
  away_team: z.string().trim().min(2, "Informe o time visitante."),
  home_flag: z.string().trim().min(1, "Informe a flag do time da casa.").max(8),
  away_flag: z.string().trim().min(1, "Informe a flag do time visitante.").max(8),
  match_date: z
    .string()
    .min(1, "Informe a data do jogo.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Informe uma data valida."
    }),
  stage: z.enum(GAME_STAGES),
  group_name: z
    .string()
    .trim()
    .max(20, "O grupo pode ter no maximo 20 caracteres.")
    .optional()
    .nullable(),
  api_fixture_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().optional().nullable()
  )
})

export const adminResultSchema = z.object({
  gameId: z.string().uuid(),
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
  isFinished: z.boolean()
})

export const adminUserToggleSchema = z.object({
  userId: z.string().uuid(),
  value: z.boolean()
})
