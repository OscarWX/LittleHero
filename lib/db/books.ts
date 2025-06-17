import { createSupabaseClient } from '@/lib/supabase'
import { ChildProfile } from './child-profiles'
import { generateChildrenStory, type GeneratedStory } from '@/lib/openai'

export interface Book {
  id: string
  user_id: string
  title: string
  status: 'draft' | 'creating' | 'generating-story' | 'creating-pictures' | 'processing' | 'ready'
  cover_url: string | null
  theme: string | null
  qualities: string[] | null
  magical_details: string | null
  magical_image_url: string | null
  special_memories: string | null
  special_memories_image_url: string | null
  narrative_style: string | null
  creation_data: any | null
  story_content: string | null
  generation_prompt: string | null
  created_at: string
}

export interface BookWithProfiles extends Book {
  child_profiles: ChildProfile[]
}

export interface CreateBookPayload {
  title: string
  status?: 'draft' | 'creating' | 'generating-story' | 'creating-pictures' | 'processing' | 'ready'
  cover_url?: string
  theme?: string
  qualities?: string[]
  magical_details?: string
  magical_image_url?: string
  special_memories?: string
  special_memories_image_url?: string
  narrative_style?: string
  creation_data?: any
  story_content?: string
  generation_prompt?: string
  profile_ids?: string[] // Child profile IDs to associate with this book
}

export interface UpdateBookPayload extends Partial<CreateBookPayload> {
  id: string
}

export interface BookPage {
  id: number
  book_id: string
  page_number: number
  image_url: string | null
  text_content: string | null
  created_at: string
}

export async function fetchUserBooks(): Promise<BookWithProfiles[]> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  // Fetch books
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (booksError) {
    throw new Error(booksError.message)
  }

  if (!books || books.length === 0) {
    return []
  }

  // Fetch associated child profiles for each book
  const booksWithProfiles: BookWithProfiles[] = []
  
  for (const book of books) {
    const { data: profileLinks, error: profileLinksError } = await supabase
      .from('book_profiles')
      .select(`
        child_profiles (*)
      `)
      .eq('book_id', book.id)

    if (profileLinksError) {
      throw new Error(profileLinksError.message)
    }

    const childProfiles = profileLinks?.map((link: any) => link.child_profiles).filter(Boolean) || []

    booksWithProfiles.push({
      ...book,
      child_profiles: childProfiles
    })
  }

  return booksWithProfiles
}

export async function fetchBookById(bookId: string): Promise<BookWithProfiles | null> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch book
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .eq('user_id', user.id) // Ensure user can only access their own books
    .single()

  if (bookError) {
    if (bookError.code === 'PGRST116') {
      return null // Book not found
    }
    throw new Error(bookError.message)
  }

  // Fetch associated child profiles
  const { data: profileLinks, error: profileLinksError } = await supabase
    .from('book_profiles')
    .select(`
      child_profiles (*)
    `)
    .eq('book_id', bookId)

  if (profileLinksError) {
    throw new Error(profileLinksError.message)
  }

  const childProfiles = profileLinks?.map((link: any) => link.child_profiles).filter(Boolean) || []

  return {
    ...book,
    child_profiles: childProfiles
  }
}

export async function createBook(payload: CreateBookPayload): Promise<BookWithProfiles> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { profile_ids, ...bookData } = payload

  // Create book
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({
      user_id: user.id,
      ...bookData,
    })
    .select()
    .single()

  if (bookError) {
    throw new Error(bookError.message)
  }

  // Associate child profiles if provided
  if (profile_ids && profile_ids.length > 0) {
    const bookProfileLinks = profile_ids.map(profileId => ({
      book_id: book.id,
      profile_id: profileId
    }))

    const { error: linkError } = await supabase
      .from('book_profiles')
      .insert(bookProfileLinks)

    if (linkError) {
      throw new Error(linkError.message)
    }
  }

  // Return the created book with profiles
  return await fetchBookById(book.id) as BookWithProfiles
}

export async function updateBook(payload: UpdateBookPayload): Promise<BookWithProfiles> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { id, profile_ids, ...updateData } = payload

  // Update book
  const { data: book, error: bookError } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only update their own books
    .select()
    .single()

  if (bookError) {
    throw new Error(bookError.message)
  }

  // Update profile associations if provided
  if (profile_ids !== undefined) {
    // Remove existing associations
    await supabase
      .from('book_profiles')
      .delete()
      .eq('book_id', id)

    // Add new associations
    if (profile_ids.length > 0) {
      const bookProfileLinks = profile_ids.map(profileId => ({
        book_id: id,
        profile_id: profileId
      }))

      const { error: linkError } = await supabase
        .from('book_profiles')
        .insert(bookProfileLinks)

      if (linkError) {
        throw new Error(linkError.message)
      }
    }
  }

  // Return the updated book with profiles
  return await fetchBookById(id) as BookWithProfiles
}

export async function deleteBook(bookId: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId)
    .eq('user_id', user.id) // Ensure user can only delete their own books

  if (error) {
    throw new Error(error.message)
  }
}

export async function fetchBookPages(bookId: string): Promise<BookPage[]> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  // Verify user owns the book
  const book = await fetchBookById(bookId)
  if (!book) {
    throw new Error('Book not found or access denied')
  }

  const { data, error } = await supabase
    .from('book_pages')
    .select('*')
    .eq('book_id', bookId)
    .order('page_number', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function createBookPage(bookId: string, pageNumber: number, imageUrl?: string, textContent?: string): Promise<BookPage> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Verify user owns the book
  const book = await fetchBookById(bookId)
  if (!book) {
    throw new Error('Book not found or access denied')
  }

  const { data, error } = await supabase
    .from('book_pages')
    .insert({
      book_id: bookId,
      page_number: pageNumber,
      image_url: imageUrl || null,
      text_content: textContent || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Book creation data management functions
export async function updateBookCreationData(
  bookId: string, 
  data: Partial<Pick<CreateBookPayload, 'theme' | 'qualities' | 'magical_details' | 'magical_image_url' | 'special_memories' | 'special_memories_image_url' | 'narrative_style' | 'creation_data'>> & { status?: string }
): Promise<BookWithProfiles> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('updateBookCreationData - User:', user?.id, 'BookId:', bookId, 'Data:', data)
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Filter data to only include columns that exist in basic books table
  // This handles the case where the book creation migration hasn't been run yet
  const basicColumns = ['status', 'title', 'cover_url']
  const filteredData: any = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (basicColumns.includes(key)) {
      filteredData[key] = value
    }
  }

  // Try to update with all data first, fall back to basic columns if migration not run
  let error
  
  // First try with all data
  const { error: fullUpdateError } = await supabase
    .from('books')
    .update(data)
    .eq('id', bookId)
    .eq('user_id', user.id)

  if (fullUpdateError) {
    console.log('Full update failed, trying basic columns only:', fullUpdateError.message)
    
    // If the error is about missing columns, try with just basic columns
    if (fullUpdateError.message.includes('column') && Object.keys(filteredData).length > 0) {
      const { error: basicUpdateError } = await supabase
        .from('books')
        .update(filteredData)
        .eq('id', bookId)
        .eq('user_id', user.id)
      
      if (basicUpdateError) {
        console.error('updateBookCreationData - Database error:', basicUpdateError)
        throw new Error(basicUpdateError.message)
      }
    } else {
      console.error('updateBookCreationData - Database error:', fullUpdateError)
      throw new Error(fullUpdateError.message)
    }
  }

  // Return the updated book
  const updatedBook = await fetchBookById(bookId) as BookWithProfiles
  console.log('updateBookCreationData - Success, returning book:', updatedBook?.id)
  return updatedBook
}

export async function generateStoryForBook(bookId: string): Promise<BookWithProfiles> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Get the book with all creation data
  const book = await fetchBookById(bookId)
  if (!book) {
    throw new Error('Book not found')
  }

  // Validate that book has all required creation data
  if (!book.theme || !book.qualities || !book.magical_details || !book.special_memories || !book.narrative_style) {
    throw new Error('Book creation data is incomplete')
  }

  // Update status to generating-story
  await supabase
    .from('books')
    .update({ status: 'generating-story' })
    .eq('id', bookId)
    .eq('user_id', user.id)

  try {
    // Generate the story using OpenAI
    const generatedStory = await generateChildrenStory(
      book.child_profiles,
      book.theme,
      book.qualities,
      book.magical_details,
      book.special_memories,
      book.narrative_style
    )

    // Update book with generated story
    const { error: updateError } = await supabase
      .from('books')
      .update({
        title: generatedStory.title,
        story_content: JSON.stringify(generatedStory),
        status: 'creating-pictures'
      })
      .eq('id', bookId)
      .eq('user_id', user.id)

    if (updateError) {
      throw new Error(`Failed to save generated story: ${updateError.message}`)
    }

    // Create book pages with generated content
    for (const page of generatedStory.pages) {
      await createBookPage(
        bookId,
        page.pageNumber,
        undefined, // No image URL yet
        page.text
      )
    }

    // Return the updated book
    return await fetchBookById(bookId) as BookWithProfiles

  } catch (error) {
    // Update status back to creating if generation fails
    await supabase
      .from('books')
      .update({ status: 'creating' })
      .eq('id', bookId)
      .eq('user_id', user.id)

    throw error
  }
}

export async function createDraftBook(title: string, profileIds: string[]): Promise<BookWithProfiles> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Create book with draft status
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({
      user_id: user.id,
      title,
      status: 'creating'
    })
    .select()
    .single()

  if (bookError) {
    throw new Error(bookError.message)
  }

  // Associate child profiles
  if (profileIds.length > 0) {
    const bookProfileLinks = profileIds.map(profileId => ({
      book_id: book.id,
      profile_id: profileId
    }))

    const { error: linkError } = await supabase
      .from('book_profiles')
      .insert(bookProfileLinks)

    if (linkError) {
      throw new Error(linkError.message)
    }
  }

  // Return the created book with profiles
  return await fetchBookById(book.id) as BookWithProfiles
}

export interface BookCreationData {
  selectedProfiles: string[]
  theme: string
  qualities: string[]
  magicalDetails: string
  magicalImageUrl?: string
  specialMemories: string
  specialMemoriesImageUrl?: string
  narrativeStyle: string
}

export async function completeBookCreation(
  bookId: string, 
  creationData: BookCreationData
): Promise<BookWithProfiles> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Update book with all creation data
  const { error } = await supabase
    .from('books')
    .update({
      theme: creationData.theme,
      qualities: creationData.qualities,
      magical_details: creationData.magicalDetails,
      magical_image_url: creationData.magicalImageUrl,
      special_memories: creationData.specialMemories,
      special_memories_image_url: creationData.specialMemoriesImageUrl,
      narrative_style: creationData.narrativeStyle,
      creation_data: creationData,
      status: 'generating-story'
    })
    .eq('id', bookId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  // Return the updated book
  return await fetchBookById(bookId) as BookWithProfiles
} 