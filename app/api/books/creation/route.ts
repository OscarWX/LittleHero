import { NextRequest, NextResponse } from 'next/server'
import { 
  createDraftBook,
  type BookCreationData 
} from '@/lib/db/books'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// POST /api/books/creation - Create a draft book
export async function POST(request: NextRequest) {
  try {
    const { title, profileIds } = await request.json()
    
    if (!title || !profileIds || !Array.isArray(profileIds)) {
      return NextResponse.json(
        { error: 'Title and profile IDs are required' },
        { status: 400 }
      )
    }

    const book = await createDraftBook(title, profileIds)
    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    console.error('Error creating draft book:', error)
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}

// PUT /api/books/creation - Update book creation data
export async function PUT(request: NextRequest) {
  try {
    const { bookId, ...data } = await request.json()
    
    console.log('PUT /api/books/creation - Request data:', { bookId, data })
    
    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase client with proper error handling
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get user session with better error handling
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    console.log('Authentication check:', { user: user?.id, authError })

    if (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed: ' + authError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('No user found in session')
      return NextResponse.json(
        { error: 'User must be authenticated. Please sign in again.' },
        { status: 401 }
      )
    }

    // First, verify the book exists and belongs to the user
    const { data: existingBook, error: fetchError } = await supabase
      .from('books')
      .select('id, user_id')
      .eq('id', bookId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching book:', fetchError)
      return NextResponse.json(
        { error: 'Book not found or access denied: ' + fetchError.message },
        { status: 404 }
      )
    }

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    // Update the book with better error handling
    console.log('Updating book with data:', data)
    const { error: updateError } = await supabase
      .from('books')
      .update(data)
      .eq('id', bookId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating book:', updateError)
      return NextResponse.json(
        { error: 'Failed to update book: ' + updateError.message },
        { status: 500 }
      )
    }

    // Fetch the updated book together with its child profiles
    const { data: book, error: fetchUpdatedError } = await supabase
      .from('books')
      .select(
        `*,
          book_profiles:book_profiles(child_profiles:child_profiles(*))
        `
      )
      .eq('id', bookId)
      .eq('user_id', user.id)
      .single()

    if (fetchUpdatedError) {
      console.error('Error fetching updated book:', fetchUpdatedError)
      return NextResponse.json(
        { error: 'Book updated but failed to fetch: ' + fetchUpdatedError.message },
        { status: 500 }
      )
    }

    // Flatten the child_profiles array structure
    const childProfiles = (book?.book_profiles || []).map((link: any) => link.child_profiles)

    console.log('Successfully updated book:', book.id)
    return NextResponse.json({ book: { ...book, child_profiles: childProfiles } })
  } catch (error) {
    console.error('Error updating book creation data:', error)
    return NextResponse.json(
      { error: `Failed to update book data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// PATCH /api/books/creation - Complete book creation or update status
export async function PATCH(request: NextRequest) {
  try {
    const { bookId, status, creationData } = await request.json()
    
    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

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

    // Decide what should be updated
    const updateData: any = {}
    if (status) updateData.status = status

    if (creationData) {
      // Map the incoming creationData fields onto the DB columns
      updateData.theme = creationData.theme
      updateData.qualities = creationData.qualities
      updateData.magical_details = creationData.magicalDetails
      updateData.magical_image_url = creationData.magicalImageUrl
      updateData.special_memories = creationData.specialMemories
      updateData.special_memories_image_url = creationData.specialMemoriesImageUrl
      updateData.narrative_style = creationData.narrativeStyle
      updateData.creation_data = creationData
    }

    // Perform the update
    const { error: updateError } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', bookId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Fetch the updated book
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select(
        `*,
          book_profiles:book_profiles(child_profiles:child_profiles(*))
        `
      )
      .eq('id', bookId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    const childProfiles = (book?.book_profiles || []).map((link: any) => link.child_profiles)

    return NextResponse.json({ book: { ...book, child_profiles: childProfiles } })
  } catch (error) {
    console.error('Error completing book creation:', error)
    return NextResponse.json(
      { error: 'Failed to complete book creation' },
      { status: 500 }
    )
  }
} 