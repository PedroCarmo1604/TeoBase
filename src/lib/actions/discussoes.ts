'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { createDiscussao } from '@/lib/data/discussoes'
import { type DataResult, fail } from '@/lib/data/types'
import type { Database } from '@/types/database.types'

type Discussao = Database['public']['Tables']['discussoes']['Row']

type CriarDiscussaoActionInput =
  | { tipo: 'tema'; tema_id: string; titulo: string }
  | { tipo: 'geral'; titulo: string }

export async function createDiscussaoAction(
  input: CriarDiscussaoActionInput
): Promise<DataResult<Discussao>> {
  const user = await getCurrentUser()
  if (!user) return fail('É necessário estar autenticado para criar uma discussão.')

  const supabase = await createClient()
  return createDiscussao(supabase, { ...input, autor_id: user.id })
}
