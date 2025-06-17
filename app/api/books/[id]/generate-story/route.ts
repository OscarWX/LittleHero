import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { generateChildrenStory } from '@/lib/openai'

// Helper to fetch a book together with its child profiles for the current user
async function fetchBookWithProfiles(supabase: any, bookId: string, userId: string) {
  // Fetch the book
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select(
      `*,
        book_profiles:book_profiles(child_profiles:child_profiles(*))
      `
    )
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()

  if (bookError) {
    throw new Error(bookError.message)
  }

  const child_profiles = (book.book_profiles || []).map((link: any) => link.child_profiles)

  return { ...book, child_profiles }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Authenticated Supabase client
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

    // Fetch book and associated profiles
    const book = await fetchBookWithProfiles(supabase, bookId, user.id)

    // Validate creation data
    if (!book.theme || !book.qualities || !book.magical_details || !book.special_memories || !book.narrative_style) {
      return NextResponse.json(
        { error: 'Book creation data is incomplete' },
        { status: 400 }
      )
    }

    // Update status to generating-story
    await supabase
      .from('books')
      .update({ status: 'generating-story' })
      .eq('id', bookId)
      .eq('user_id', user.id)

    let updatedBook
    try {
      // Generate story via OpenAI
      const generatedStory = await generateChildrenStory(
        book.child_profiles,
        book.theme,
        book.qualities,
        book.magical_details,
        book.special_memories,
        book.narrative_style
      )

      // Persist generated story
      const { data, error: updateError } = await supabase
        .from('books')
        .update({
          title: generatedStory.title,
          story_content: JSON.stringify(generatedStory),
          status: 'creating-pictures',
        })
        .eq('id', bookId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(updateError.message)
      }

      updatedBook = data

      // Insert pages
      for (const page of generatedStory.pages) {
        await supabase.from('book_pages').insert({
          book_id: bookId,
          page_number: page.pageNumber,
          text_content: page.text,
          image_url: null,
        })
      }

    } catch (err) {
      // On error, revert status back to creating
      await supabase
        .from('books')
        .update({ status: 'creating' })
        .eq('id', bookId)
        .eq('user_id', user.id)

      throw err
    }

    // Re-fetch with profiles for response
    const finalBook = await fetchBookWithProfiles(supabase, bookId, user.id)

    return NextResponse.json({ book: finalBook }, { status: 200 })
  } catch (error) {
    console.error('Error generating story:', error)
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { error: `Failed to generate story: ${message}` },
      { status: 500 }
    )
  }
} 