import { NextRequest, NextResponse } from 'next/server'
import { generateStoryForBook } from '@/lib/db/books'

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

    const book = await generateStoryForBook(bookId)

    return NextResponse.json(book, { status: 200 })
  } catch (error) {
    console.error('Error generating story:', error)
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { error: `Failed to generate story: ${message}` },
      { status: 500 }
    )
  }
} 