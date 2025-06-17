'use client'

import { createSupabaseClient } from '@/lib/supabase'
import { ensureProfileExists, fetchCurrentUserProfile, type Profile } from '@/lib/db/profiles'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const supabase = createSupabaseClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        if (session?.user) {
          // Set user immediately, fetch profile in background
          setState({
            user: session.user,
            profile: null,
            loading: false,
            error: null
          })

          // Fetch profile in background (don't block the UI)
          try {
            const profile = await fetchCurrentUserProfile()
            setState(prev => ({ ...prev, profile }))
          } catch (profileError) {
            console.error('Error fetching profile:', profileError)
            // Don't set error state, just leave profile as null
          }
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Authentication error',
          loading: false 
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Set user immediately
          setState({
            user: session.user,
            profile: null,
            loading: false,
            error: null
          })

          // Fetch profile in background
          try {
            const profile = await fetchCurrentUserProfile()
            setState(prev => ({ ...prev, profile }))
          } catch (profileError) {
            console.error('Error fetching profile on auth change:', profileError)
            // Don't block the UI with profile errors
          }
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return state
}

export async function signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // If user is created, ensure profile exists
    if (data.user) {
      try {
        await ensureProfileExists(data.user.id, email)
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't fail sign up if profile creation fails
      }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sign up failed' 
    }
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Ensure profile exists after sign in
    if (data.user) {
      try {
        await ensureProfileExists(data.user.id, email)
      } catch (profileError) {
        console.error('Error ensuring profile exists:', profileError)
        // Don't fail sign in if profile check fails
      }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sign in failed' 
    }
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sign out failed' 
    }
  }
} 