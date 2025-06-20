import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// GET /api/books/[id]/pages - Fetch all pages for a book
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

    // Verify user owns the book
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (bookError || !book) {
      return NextResponse.json(
        { error: 'Book not found or access denied' },
        { status: 404 }
      )
    }

    // Fetch pages
    const { data: pages, error: pagesError } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', params.id)
      .order('page_number')

    if (pagesError) {
      throw new Error(pagesError.message)
    }

    return NextResponse.json({ pages: pages || [] })
  } catch (error) {
    console.error('Error fetching book pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book pages' },
      { status: 500 }
    )
  }
} 