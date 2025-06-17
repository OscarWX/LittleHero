import { NextRequest, NextResponse } from 'next/server'
import { fetchBookById } from '@/lib/db/books'

// GET /api/books/[id] - Fetch a specific book
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await fetchBookById(params.id)
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
} 