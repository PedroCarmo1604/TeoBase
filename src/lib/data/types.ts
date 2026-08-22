import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>

export type DataResult<T> = { data: T; error: null } | { data: null; error: string }

export function ok<T>(data: T): DataResult<T> {
  return { data, error: null }
}

export function fail<T>(error: string): DataResult<T> {
  return { data: null, error }
}
