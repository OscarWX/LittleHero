import { NextRequest, NextResponse } from 'next/server'
import { 
  createDraftBook, 
  updateBookCreationData, 
  completeBookCreation,
  type BookCreationData 
} from '@/lib/db/books'

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

    const book = await updateBookCreationData(bookId, data)
    console.log('PUT /api/books/creation - Success:', book.id)
    return NextResponse.json({ book })
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
    const { bookId, status, creationData }: { 
      bookId: string, 
      status?: string,
      creationData?: BookCreationData 
    } = await request.json()
    
    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // If creationData is provided, use the complete book creation function
    if (creationData) {
      const book = await completeBookCreation(bookId, creationData)
      return NextResponse.json({ book })
    }
    
    // Otherwise, just update with the provided data (e.g., status)
    const updateData: any = {}
    if (status) {
      updateData.status = status
    }
    
    const book = await updateBookCreationData(bookId, updateData)
    return NextResponse.json({ book })
  } catch (error) {
    console.error('Error completing book creation:', error)
    return NextResponse.json(
      { error: 'Failed to complete book creation' },
      { status: 500 }
    )
  }
} 