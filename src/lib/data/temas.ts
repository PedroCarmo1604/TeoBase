import type { Database, NivelLeitura } from '@/types/database.types'
import { type DataResult, type TypedSupabaseClient, fail, ok } from './types'

type Tema = Database['public']['Tables']['temas']['Row']
type TemaInput = {
  slug: string
  titulo: string
  descricao?: string | null
  categoria: string
  nivel_leitura?: NivelLeitura
  destaque_inicial?: boolean
}

export async function listTemas(client: TypedSupabaseClient): Promise<DataResult<Tema[]>> {
  const { data, error } = await client.from('temas').select('*').order('titulo')
  if (error) return fail(error.message)
  return ok(data)
}

export async function getTemaBySlug(
  client: TypedSupabaseClient,
  slug: string
): Promise<DataResult<Tema>> {
  const { data, error } = await client.from('temas').select('*').eq('slug', slug).single()
  if (error) return fail(error.message)
  return ok(data)
}

export async function createTema(
  client: TypedSupabaseClient,
  input: TemaInput
): Promise<DataResult<Tema>> {
  const { data, error } = await client.from('temas').insert(input).select().single()
  if (error) return fail(error.message)
  return ok(data)
}

export async function updateTema(
  client: TypedSupabaseClient,
  id: string,
  input: Partial<TemaInput>
): Promise<DataResult<Tema>> {
  const { data, error } = await client.from('temas').update(input).eq('id', id).select().single()
  if (error) return fail(error.message)
  return ok(data)
}

export async function deleteTema(
  client: TypedSupabaseClient,
  id: string
): Promise<DataResult<null>> {
  const { error } = await client.from('temas').delete().eq('id', id)
  if (error) return fail(error.message)
  return ok(null)
}
