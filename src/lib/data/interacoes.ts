import type { TipoInteracao } from '@/types/database.types'
import { type DataResult, type TypedSupabaseClient, fail, ok } from './types'

type RegistrarInteracaoInput = {
  usuario_id: string
  tema_id: string
  tipo_interacao: TipoInteracao
}

export async function registrarInteracao(
  client: TypedSupabaseClient,
  input: RegistrarInteracaoInput
): Promise<DataResult<null>> {
  const { error } = await client.from('interacoes_usuario').insert(input)
  if (error) return fail(error.message)
  return ok(null)
}
