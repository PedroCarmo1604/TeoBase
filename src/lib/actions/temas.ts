'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/dal'
import * as temasData from '@/lib/data/temas'
import type { NivelLeitura } from '@/types/database.types'
import type { DataResult } from '@/lib/data/types'
import { fail } from '@/lib/data/types'

type Tema = Awaited<ReturnType<typeof temasData.getTemaBySlug>>['data']

async function requireAdmin() {
  const profile = await getCurrentProfile()
  if (!profile?.is_admin) return null
  return profile
}

export async function createTemaAction(input: {
  slug: string
  titulo: string
  descricao?: string
  categoria: string
  nivel_leitura?: NivelLeitura
  destaque_inicial?: boolean
}): Promise<DataResult<Tema>> {
  const admin = await requireAdmin()
  if (!admin) return fail('Apenas administradores podem criar temas.')

  const supabase = await createClient()
  return temasData.createTema(supabase, input)
}

export async function updateTemaAction(
  id: string,
  input: Partial<{
    slug: string
    titulo: string
    descricao: string | null
    categoria: string
    nivel_leitura: NivelLeitura
    destaque_inicial: boolean
  }>
): Promise<DataResult<Tema>> {
  const admin = await requireAdmin()
  if (!admin) return fail('Apenas administradores podem editar temas.')

  const supabase = await createClient()
  return temasData.updateTema(supabase, id, input)
}

export async function deleteTemaAction(id: string): Promise<DataResult<null>> {
  const admin = await requireAdmin()
  if (!admin) return fail('Apenas administradores podem remover temas.')

  const supabase = await createClient()
  return temasData.deleteTema(supabase, id)
}
