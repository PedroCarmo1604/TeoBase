import type { Database } from '@/types/database.types'
import { type DataResult, type TypedSupabaseClient, fail, ok } from './types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdateInput = Partial<
  Pick<Profile, 'nome' | 'tradicao_declarada' | 'bio' | 'foto_url'>
>

export async function getProfile(
  client: TypedSupabaseClient,
  userId: string
): Promise<DataResult<Profile>> {
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single()
  if (error) return fail(error.message)
  return ok(data)
}

export async function updateProfile(
  client: TypedSupabaseClient,
  userId: string,
  input: ProfileUpdateInput
): Promise<DataResult<Profile>> {
  const { data, error } = await client
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single()
  if (error) return fail(error.message)
  return ok(data)
}

export async function listDiscussoesDoUsuario(
  client: TypedSupabaseClient,
  userId: string
): Promise<DataResult<Database['public']['Tables']['discussoes']['Row'][]>> {
  const { data, error } = await client
    .from('discussoes')
    .select('*')
    .eq('autor_id', userId)
    .order('criado_em', { ascending: false })
  if (error) return fail(error.message)
  return ok(data)
}
