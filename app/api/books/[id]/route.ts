import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// GET /api/books/[id] - Fetch a specific book
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'User must be authenticated' },
        { status: 401 }
      )
    }

    // Fetch book with profiles
    const { data: book, error } = await supabase
      .from('books')
      .select(
        `*,
          book_profiles:book_profiles(child_profiles:child_profiles(*))
        `
      )
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        )
      }
      throw new Error(error.message)
    }

    const childProfiles = (book?.book_profiles || []).map((link: any) => link.child_profiles)

    return NextResponse.json({ book: { ...book, child_profiles: childProfiles } })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
} 