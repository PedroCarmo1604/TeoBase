import type { Database } from '@/types/database.types'
import { type DataResult, type TypedSupabaseClient, fail, ok } from './types'

type LeituraRecomendada = Database['public']['Tables']['leituras_recomendadas']['Row']

export async function listLeituras(
  client: TypedSupabaseClient
): Promise<DataResult<LeituraRecomendada[]>> {
  const { data, error } = await client
    .from('leituras_recomendadas')
    .select('*')
    .order('ordem_exibicao')
  if (error) return fail(error.message)
  return ok(data)
}

export async function listLeiturasByTema(
  client: TypedSupabaseClient,
  temaId: string
): Promise<DataResult<LeituraRecomendada[]>> {
  const { data, error } = await client
    .from('leituras_recomendadas')
    .select('*')
    .eq('tema_id', temaId)
    .order('ordem_exibicao')
  if (error) return fail(error.message)
  return ok(data)
}
