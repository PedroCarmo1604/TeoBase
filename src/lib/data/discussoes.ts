import type { Database, DiscussaoTipo } from '@/types/database.types'
import { type DataResult, type TypedSupabaseClient, fail, ok } from './types'

type Discussao = Database['public']['Tables']['discussoes']['Row']

type CriarDiscussaoTemaInput = {
  tipo: 'tema'
  tema_id: string
  titulo: string
  autor_id: string
}

type CriarDiscussaoGeralInput = {
  tipo: 'geral'
  titulo: string
  autor_id: string
}

export type CriarDiscussaoInput = CriarDiscussaoTemaInput | CriarDiscussaoGeralInput

export async function listDiscussoesGerais(
  client: TypedSupabaseClient
): Promise<DataResult<Discussao[]>> {
  const { data, error } = await client
    .from('discussoes')
    .select('*')
    .eq('tipo', 'geral')
    .order('criado_em', { ascending: false })
  if (error) return fail(error.message)
  return ok(data)
}

export async function listDiscussoesByTema(
  client: TypedSupabaseClient,
  temaId: string
): Promise<DataResult<Discussao[]>> {
  const { data, error } = await client
    .from('discussoes')
    .select('*')
    .eq('tema_id', temaId)
    .order('criado_em', { ascending: false })
  if (error) return fail(error.message)
  return ok(data)
}

export async function getDiscussao(
  client: TypedSupabaseClient,
  id: string
): Promise<DataResult<Discussao>> {
  const { data, error } = await client.from('discussoes').select('*').eq('id', id).single()
  if (error) return fail(error.message)
  return ok(data)
}

export async function createDiscussao(
  client: TypedSupabaseClient,
  input: CriarDiscussaoInput
): Promise<DataResult<Discussao>> {
  const { data, error } = await client
    .from('discussoes')
    .insert({
      tipo: input.tipo as DiscussaoTipo,
      tema_id: input.tipo === 'tema' ? input.tema_id : null,
      titulo: input.titulo,
      autor_id: input.autor_id,
    })
    .select()
    .single()
  if (error) return fail(error.message)
  return ok(data)
}
