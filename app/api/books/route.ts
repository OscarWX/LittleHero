import { NextRequest, NextResponse } from 'next/server';
import {
  createBook,
  updateBook,
  deleteBook,
  type CreateBookPayload,
  type UpdateBookPayload,
} from '@/lib/db/books';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Helper to fetch all books for the authenticated user along with child profiles
async function getUserBooks() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: books, error: booksError } = await supabase
    .from('books')
    .select(
      `*,
        book_profiles:book_profiles(id, child_profiles:child_profiles(*))
      `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (booksError) {
    throw new Error(booksError.message);
  }

  // Flatten child profile links
  return (books || []).map((b: any) => ({
    ...b,
    child_profiles: (b.book_profiles || []).map(
      (link: any) => link.child_profiles
    ),
  }));
}

// GET /api/books - Fetch all user's books
export async function GET() {
  try {
    const books = await getUserBooks();
    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const payload: CreateBookPayload = await request.json();
    const book = await createBook(payload);
    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}

// PUT /api/books - Update a book
export async function PUT(request: NextRequest) {
  try {
    const payload: UpdateBookPayload = await request.json();
    const book = await updateBook(payload);
    return NextResponse.json({ book });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE /api/books - Delete a book
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('id');

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    await deleteBook(bookId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
