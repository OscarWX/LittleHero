import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

export interface SupabaseConfig {
  readonly url: string
  readonly anonKey: string
}

function getConfig(): SupabaseConfig {
  // Prefer the public environment variables, but fall back to generic
  // SUPABASE_* names so that existing environments that have not yet
  // been migrated continue to work without changes.
  return {
    url:
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) as string,
    anonKey:
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY) as string,
  }
}

// For client-side operations that need session persistence
export function createSupabaseClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    // Browser environment - use auth helpers for session persistence
    const { url, anonKey } = getConfig()
    return createBrowserSupabaseClient({
      supabaseUrl: url,
      supabaseKey: anonKey,
    })
  } else {
    // Server environment - use regular client
    const { url, anonKey } = getConfig()
    return createClient(url, anonKey)
  }
} 