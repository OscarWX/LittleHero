import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { STORAGE_BUCKETS } from '@/lib/storage'

// POST /api/book-pages/[id]/upload - Upload an image for a specific book page
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pageId = Number(params.id)
  if (isNaN(pageId)) {
    return NextResponse.json({ error: 'Invalid page id' }, { status: 400 })
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'User must be authenticated' }, { status: 401 })
    }

    // Get the uploaded file from form data
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Fetch the page to get book info
    const { data: page, error: pageError } = await supabase
      .from('book_pages')
      .select('id, book_id, page_number')
      .eq('id', pageId)
      .single()

    if (pageError || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Verify the user owns the parent book
    const { data: parentBook, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', page.book_id)
      .eq('user_id', user.id)
      .single()

    if (bookError || !parentBook) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate file path
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `user_upload_${Date.now()}.${fileExtension}`
    const filePath = `${page.book_id}/${page.page_number}/${fileName}`

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.BOOK_PAGES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Update the page with the image URL
    const { error: updateError } = await supabase
      .from('book_pages')
      .update({ image_url: uploadData.path })
      .eq('id', pageId)

    if (updateError) {
      // Clean up uploaded file if DB update fails
      await supabase.storage
        .from(STORAGE_BUCKETS.BOOK_PAGES)
        .remove([uploadData.path])
      
      return NextResponse.json({ error: `Failed to update page: ${updateError.message}` }, { status: 500 })
    }

    // Check if all pages for the book now have images
    const { data: remainingPages } = await supabase
      .from('book_pages')
      .select('id')
      .eq('book_id', page.book_id)
      .is('image_url', null)

    if (remainingPages && remainingPages.length === 0) {
      // All pages have images – mark book ready
      await supabase
        .from('books')
        .update({ status: 'ready' })
        .eq('id', page.book_id)
        .eq('user_id', user.id)
    }

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.BOOK_PAGES)
      .getPublicUrl(uploadData.path)

    return NextResponse.json({ 
      success: true, 
      image_url: uploadData.path,
      public_url: publicUrl
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
} 