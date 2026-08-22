'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { createComentario } from '@/lib/data/comentarios'
import { type DataResult, fail } from '@/lib/data/types'
import type { Database, TipoRegistro } from '@/types/database.types'

type Comentario = Database['public']['Tables']['comentarios']['Row']

export async function createComentarioAction(input: {
  discussao_id: string
  texto: string
  fonte_citada?: string
  tipo_registro?: TipoRegistro
  resposta_a?: string
}): Promise<DataResult<Comentario>> {
  const user = await getCurrentUser()
  if (!user) return fail('É necessário estar autenticado para comentar.')

  const supabase = await createClient()
  return createComentario(supabase, { ...input, autor_id: user.id })
}
