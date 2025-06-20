import { createSupabaseClient } from '@/lib/supabase'

// Storage bucket names (using hyphens as required by Supabase)
export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  BOOK_COVERS: 'book-covers',
  BOOK_PAGES: 'book-pages',
  RAW_UPLOADS: 'raw-uploads',
} as const

export interface UploadResult {
  url: string
  path: string
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string
    upsert?: boolean
  }
): Promise<UploadResult> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Get signed URL for private buckets or public URL for public buckets
  let url: string
  if (bucket === STORAGE_BUCKETS.PROFILE_PHOTOS || bucket === STORAGE_BUCKETS.RAW_UPLOADS) {
    // Private bucket - use signed URL
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year expiry

    if (urlError) {
      throw new Error(`Failed to get signed URL: ${urlError.message}`)
    }
    url = signedUrlData.signedUrl
  } else {
    // Public bucket - use public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    url = publicUrl
  }

  return {
    url,
    path: uploadData.path
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export function generateFileName(userId: string, prefix: string, fileExtension: string): string {
  const timestamp = Date.now()
  return `${userId}/${prefix}_${timestamp}.${fileExtension}`
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop() || ''
}

export async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const supabase = createSupabaseClient()
  
  if (bucket === STORAGE_BUCKETS.PROFILE_PHOTOS || bucket === STORAGE_BUCKETS.RAW_UPLOADS) {
    // Private bucket - use signed URL
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24) // 24 hours expiry for display

    if (urlError) {
      throw new Error(`Failed to get signed URL: ${urlError.message}`)
    }
    return signedUrlData.signedUrl
  } else {
    // Public bucket - use public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return publicUrl
  }
}

export async function createBookPageFolderStructure(bookId: string, pageCount: number): Promise<void> {
  const supabase = createSupabaseClient()
  // No need for user session – this may run in a server context.

  // Create a placeholder file in each page folder to ensure the folder exists
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const folderPath = `${bookId}/${pageNumber}/.placeholder`
    
    try {
      // Create a minimal placeholder file
      const placeholderBlob = new Blob([''], { type: 'text/plain' })
      
      await supabase.storage
        .from(STORAGE_BUCKETS.BOOK_PAGES)
        .upload(folderPath, placeholderBlob, {
          cacheControl: '3600',
          upsert: true
        })
      
      console.log(`Created folder for book ${bookId}, page ${pageNumber}`)
    } catch (error) {
      console.error(`Error creating folder for page ${pageNumber}:`, error)
      // Continue with other folders even if one fails
    }
  }
}

export async function checkBookPageImages(bookId: string): Promise<{ pageNumber: number; hasImage: boolean }[]> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Get all pages for this book from the database
  const { data: pages, error: pagesError } = await supabase
    .from('book_pages')
    .select('page_number')
    .eq('book_id', bookId)
    .order('page_number')

  if (pagesError) {
    throw new Error(pagesError.message)
  }

  if (!pages || pages.length === 0) {
    return []
  }

  const results: { pageNumber: number; hasImage: boolean }[] = []

  for (const page of pages) {
    const prefix = `${bookId}/${page.page_number}`
    const { data: objects, error: listError } = await supabase.storage
      .from(STORAGE_BUCKETS.BOOK_PAGES)
      .list(prefix, { limit: 10 })

    const hasImage = !listError && objects && objects.some(obj => 
      obj.name !== '.placeholder' && obj.name !== '' 
    )

    results.push({
      pageNumber: page.page_number,
      hasImage: Boolean(hasImage)
    })
  }

  return results
}

export async function ensureBookFolder(bookId: string): Promise<void> {
  const supabase = createSupabaseClient()
  // No need for user session – this may run in a server context.

  const initPath = `${bookId}/.init`
  const initBlob = new Blob([''], { type: 'text/plain' })
  try {
    await supabase.storage
      .from(STORAGE_BUCKETS.BOOK_PAGES)
      .upload(initPath, initBlob, { cacheControl: '3600', upsert: true })
  } catch (err) {
    console.error('Error ensuring book folder', err)
  }
} 