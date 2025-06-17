import { createSupabaseClient } from '@/lib/supabase'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfilePayload {
  full_name?: string
  email?: string
}

export async function fetchCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // First try to get existing profile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      return await ensureProfileExists(user.id, user.email || '')
    }
    throw new Error(error.message)
  }

  return data
}

export async function ensureProfileExists(userId: string, email: string): Promise<Profile> {
  const supabase = createSupabaseClient()
  
  // First try to get the profile again (in case it was created between calls)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (existingProfile) {
    return existingProfile
  }
  
  // Use upsert to handle race conditions
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: null,
      email: email,
    }, {
      onConflict: 'id'
    })
    .select()
    .single()

  if (error) {
    // If there's still a conflict, try to fetch the existing profile
    if (error.code === '23505') { // unique constraint violation
      const { data: conflictProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (conflictProfile) {
        return conflictProfile
      }
    }
    throw new Error(error.message)
  }
  return data
}

export async function updateProfile(userId: string, payload: UpdateProfilePayload): Promise<Profile> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
} 