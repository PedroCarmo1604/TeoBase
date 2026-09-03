// Verificação de conectividade com o Supabase, sem depender de nenhuma UI.
// Uso:
//   npm run verify          -> checagens de leitura (não escreve nada no banco)
//   npm run verify -- --write -> além disso, roda um fluxo de escrita de ponta a
//                                 ponta (cria um usuário de teste, uma discussão
//                                 geral e um comentário) para validar RLS e triggers.
//
// Requer NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local.

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database.types'

config({ path: '.env.local', quiet: true })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local')
  process.exit(1)
}

const supabase = createClient<Database>(url, anonKey)

const shouldWrite = process.argv.includes('--write')

async function step(label: string, fn: () => Promise<void>) {
  process.stdout.write(`- ${label}... `)
  try {
    await fn()
    console.log('OK')
  } catch (err) {
    console.log('FALHOU')
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  }
}

async function main() {
  console.log(`Conectando a ${url}\n`)

  // A chave anônima roda como role "anon", e as policies de temas/leituras são
  // "to authenticated" — então mesmo com dados no banco, essas queries voltam
  // 0 linhas por RLS, não por a tabela estar vazia ou não existir. O único
  // sinal confiável que dá pra checar aqui sem um usuário autenticado é a
  // ausência do erro PGRST205 (tabela/coluna não encontrada no schema cache),
  // que indicaria a migration não aplicada.
  await step('tabela "temas" existe no schema (contagem real exige sessão autenticada)', async () => {
    const { error } = await supabase.from('temas').select('id').limit(1)
    if (error) throw error
  })

  await step(
    'tabela "leituras_recomendadas" existe no schema (contagem real exige sessão autenticada)',
    async () => {
      const { error } = await supabase.from('leituras_recomendadas').select('id').limit(1)
      if (error) throw error
    }
  )

  await step('acesso anônimo a "discussoes" é bloqueado pela RLS (esperado)', async () => {
    const { data, error } = await supabase.from('discussoes').select('id').limit(1)
    if (error) throw error
    // RLS não gera erro: apenas filtra as linhas. Sem sessão autenticada, a
    // policy "authenticated" deve fazer a query retornar zero linhas.
    if (data.length > 0) throw new Error('leitura sem autenticação retornou linhas')
  })

  if (!shouldWrite) {
    console.log(
      '\nChecagens de leitura concluídas (confirmam schema + RLS, não o conteúdo real de ' +
        'temas/leituras — para isso, rode uma contagem no SQL Editor). Rode com --write para ' +
        'testar o fluxo de escrita.'
    )
    return
  }

  const testEmail = `teobase.verify.${Date.now()}@gmail.com`
  const testPassword = 'SenhaForte#123'

  console.log(`\nFluxo de escrita (usuário de teste: ${testEmail})`)

  await step('signup cria usuário e dispara trigger de profile', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: { data: { nome: 'Usuário de Verificação' } },
    })
    if (error) throw error
    if (!data.user) throw new Error('signup não retornou usuário')
  })

  await step('login com o usuário recém-criado', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    if (error) throw error
  })

  let profileId: string | null = null

  await step('profile foi criado automaticamente pelo trigger', async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('sem usuário autenticado')
    profileId = user.id

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (error) throw error
    if (data.nome !== 'Usuário de Verificação') throw new Error('nome do profile não bateu')
  })

  let discussaoId: string | null = null

  await step('cria discussão geral', async () => {
    if (!profileId) throw new Error('profileId ausente')
    const { data, error } = await supabase
      .from('discussoes')
      .insert({ tipo: 'geral', titulo: '[verify] discussão de teste', autor_id: profileId })
      .select()
      .single()
    if (error) throw error
    discussaoId = data.id
  })

  await step('comenta na discussão', async () => {
    if (!discussaoId || !profileId) throw new Error('ids ausentes')
    const { error } = await supabase.from('comentarios').insert({
      discussao_id: discussaoId,
      autor_id: profileId,
      texto: '[verify] comentário de teste',
    })
    if (error) throw error
  })

  await step('lê a discussão e o comentário de volta', async () => {
    if (!discussaoId) throw new Error('discussaoId ausente')
    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .eq('discussao_id', discussaoId)
    if (error) throw error
    if (data.length !== 1) throw new Error(`esperado 1 comentário, veio ${data.length}`)
  })

  console.log(
    '\nFluxo de escrita concluído. O usuário e os registros de teste (prefixo "[verify]") ' +
      'continuam no banco — apague manualmente pelo dashboard se quiser um projeto limpo.'
  )
}

main()
