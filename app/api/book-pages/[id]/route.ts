import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// PUT /api/book-pages/[id] – update a single book_page (e.g., add image_url)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pageId = Number(params.id);
  if (isNaN(pageId)) {
    return NextResponse.json({ error: 'Invalid page id' }, { status: 400 });
  }

  try {
    const { image_url } = await request.json();

    if (!image_url || typeof image_url !== 'string') {
      return NextResponse.json(
        { error: 'image_url is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User must be authenticated' },
        { status: 401 }
      );
    }

    // Fetch the page
    const { data: page, error: pageError } = await supabase
      .from('book_pages')
      .select('id, book_id')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify the user owns the parent book
    const { data: parentBook, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', page.book_id)
      .eq('user_id', user.id)
      .single();

    if (bookError || !parentBook) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the image_url
    const { error: updateError } = await supabase
      .from('book_pages')
      .update({ image_url })
      .eq('id', pageId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // After update, check if all pages for the book now have images
    const { data: remaining } = await supabase
      .from('book_pages')
      .select('id')
      .eq('book_id', page.book_id)
      .is('image_url', null);

    if (remaining && remaining.length === 0) {
      // All pages illustrated – mark book ready
      await supabase
        .from('books')
        .update({ status: 'ready' })
        .eq('id', page.book_id)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating page image:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}
