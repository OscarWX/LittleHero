import { createSupabaseClient } from '@/lib/supabase'
import { uploadFile, STORAGE_BUCKETS, generateFileName, getFileExtension } from '@/lib/storage'

export interface ChildProfile {
  id: string
  user_id: string
  name: string
  gender: 'boy' | 'girl' | null
  birthday: string | null
  appearance: {
    hairColor?: string
    eyeColor?: string
    skinTone?: string
    otherFeatures?: string
  } | null
  special_traits: string | null
  favorite_thing: string | null
  avatar_url: string | null
  created_at: string
}

export interface CreateChildProfilePayload {
  name: string
  gender?: 'boy' | 'girl'
  birthday?: string
  appearance?: {
    hairColor?: string
    eyeColor?: string
    skinTone?: string
    otherFeatures?: string
  }
  special_traits?: string
  favorite_thing?: string
  avatar_url?: string
}

export interface UpdateChildProfilePayload extends Partial<CreateChildProfilePayload> {
  id: string
}

export async function fetchUserChildProfiles(): Promise<ChildProfile[]> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function fetchChildProfileById(profileId: string): Promise<ChildProfile | null> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', user.id) // Ensure user can only access their own profiles
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Profile not found
    }
    throw new Error(error.message)
  }

  return data
}

export async function createChildProfile(payload: CreateChildProfilePayload): Promise<ChildProfile> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      user_id: user.id,
      ...payload,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateChildProfile(payload: UpdateChildProfilePayload): Promise<ChildProfile> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { id, ...updateData } = payload

  const { data, error } = await supabase
    .from('child_profiles')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only update their own profiles
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteChildProfile(profileId: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { error } = await supabase
    .from('child_profiles')
    .delete()
    .eq('id', profileId)
    .eq('user_id', user.id) // Ensure user can only delete their own profiles

  if (error) {
    throw new Error(error.message)
  }
}

export async function uploadChildPhoto(profileId: string, file: File): Promise<string> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Create a unique filename
  const fileExt = getFileExtension(file.name)
  const fileName = generateFileName(user.id, profileId, fileExt)

  // Upload file to storage using the utility function
  const { url } = await uploadFile(STORAGE_BUCKETS.PROFILE_PHOTOS, fileName, file)

  // Update child profile with new avatar URL
  await updateChildProfile({
    id: profileId,
    avatar_url: url
  })

  return url
} 