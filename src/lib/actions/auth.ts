'use server'

import * as z from 'zod'
import { createClient } from '@/lib/supabase/server'

export type AuthFormState = {
  errors?: {
    nome?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string
} | undefined

const SignupSchema = z.object({
  nome: z.string().trim().min(2, { error: 'Nome deve ter ao menos 2 caracteres.' }),
  email: z.email({ error: 'Informe um email válido.' }).trim(),
  password: z
    .string()
    .min(8, { error: 'A senha deve ter ao menos 8 caracteres.' })
    .regex(/[a-zA-Z]/, { error: 'A senha deve conter ao menos uma letra.' })
    .regex(/[0-9]/, { error: 'A senha deve conter ao menos um número.' }),
})

const LoginSchema = z.object({
  email: z.email({ error: 'Informe um email válido.' }).trim(),
  password: z.string().min(1, { error: 'Informe a senha.' }),
})

export async function signup(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validatedFields = SignupSchema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors }
  }

  const { nome, email, password } = validatedFields.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome } },
  })

  if (error) {
    return { message: error.message }
  }

  return { message: 'Cadastro realizado. Verifique seu email para confirmar a conta.' }
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors }
  }

  const { email, password } = validatedFields.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { message: error.message }
  }

  return undefined
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
