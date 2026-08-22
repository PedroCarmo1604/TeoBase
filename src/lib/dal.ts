import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/data/perfil'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const result = await getProfile(supabase, user.id)
  return result.error ? null : result.data
})
