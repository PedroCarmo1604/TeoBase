import type { Database, TipoRegistro } from '@/types/database.types'
import { type DataResult, type TypedSupabaseClient, fail, ok } from './types'

type Comentario = Database['public']['Tables']['comentarios']['Row']

type CriarComentarioInput = {
  discussao_id: string
  autor_id: string
  texto: string
  fonte_citada?: string | null
  tipo_registro?: TipoRegistro | null
  resposta_a?: string | null
}

export async function listComentariosByDiscussao(
  client: TypedSupabaseClient,
  discussaoId: string
): Promise<DataResult<Comentario[]>> {
  const { data, error } = await client
    .from('comentarios')
    .select('*')
    .eq('discussao_id', discussaoId)
    .order('criado_em', { ascending: true })
  if (error) return fail(error.message)
  return ok(data)
}

export async function createComentario(
  client: TypedSupabaseClient,
  input: CriarComentarioInput
): Promise<DataResult<Comentario>> {
  const { data, error } = await client.from('comentarios').insert(input).select().single()
  if (error) return fail(error.message)
  return ok(data)
}
