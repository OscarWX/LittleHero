import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { STORAGE_BUCKETS } from '@/lib/storage'

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

    // If the book is still in creating-pictures, verify if all images now exist in storage.
    if (book.status === 'creating-pictures') {
      // Count pages expected
      const { data: pages } = await supabase
        .from('book_pages')
        .select('id, page_number, image_url')
        .eq('book_id', book.id)
        .order('page_number')

      if (pages && pages.length > 0) {
        let complete = true

        for (const page of pages) {
          // If DB already has image_url, assume OK
          if (page.image_url) continue

          // Otherwise, look for any file in book-pages/{book.id}/{page.page_number}/
          const { data: objects, error: listError } = await supabase.storage
            .from(STORAGE_BUCKETS.BOOK_PAGES)
            .list(`${book.id}/${page.page_number}`, { limit: 1 })

          if (listError || !objects || objects.length === 0) {
            complete = false
            break
          }

          // Optionally, store first file path as image_url
          const foundPath = `${book.id}/${page.page_number}/${objects[0].name}`
          await supabase.from('book_pages').update({ image_url: foundPath }).eq('id', page.id)
        }

        if (complete) {
          await supabase
            .from('books')
            .update({ status: 'ready' })
            .eq('id', book.id)
            .eq('user_id', user.id)

          book.status = 'ready' // reflect immediately
        }
      }
    }

    return NextResponse.json({ book: { ...book, child_profiles: childProfiles } })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
} 