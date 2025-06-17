import { NextRequest, NextResponse } from 'next/server'
import { 
  fetchUserBooks, 
  createBook, 
  updateBook, 
  deleteBook,
  type CreateBookPayload,
  type UpdateBookPayload 
} from '@/lib/db/books'

// GET /api/books - Fetch all user's books
export async function GET() {
  try {
    const books = await fetchUserBooks()
    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const payload: CreateBookPayload = await request.json()
    const book = await createBook(payload)
    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}

// PUT /api/books - Update a book
export async function PUT(request: NextRequest) {
  try {
    const payload: UpdateBookPayload = await request.json()
    const book = await updateBook(payload)
    return NextResponse.json({ book })
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}

// DELETE /api/books - Delete a book
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('id')
    
    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    await deleteBook(bookId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
} 