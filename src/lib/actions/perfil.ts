'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { updateProfile } from '@/lib/data/perfil'
import { type DataResult, fail } from '@/lib/data/types'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function updateProfileAction(input: {
  nome?: string
  tradicao_declarada?: string | null
  bio?: string | null
  foto_url?: string | null
}): Promise<DataResult<Profile>> {
  const user = await getCurrentUser()
  if (!user) return fail('É necessário estar autenticado para editar o perfil.')

  const supabase = await createClient()
  return updateProfile(supabase, user.id, input)
}
