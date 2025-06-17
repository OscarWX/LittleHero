import { NextRequest, NextResponse } from 'next/server'
import { 
  fetchUserChildProfiles, 
  createChildProfile, 
  updateChildProfile, 
  deleteChildProfile,
  type CreateChildProfilePayload,
  type UpdateChildProfilePayload 
} from '@/lib/db/child-profiles'

// GET /api/profiles - Fetch all user's child profiles
export async function GET() {
  try {
    const profiles = await fetchUserChildProfiles()
    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

// POST /api/profiles - Create a new child profile
export async function POST(request: NextRequest) {
  try {
    const payload: CreateChildProfilePayload = await request.json()
    const profile = await createChildProfile(payload)
    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profiles - Update a child profile
export async function PUT(request: NextRequest) {
  try {
    const payload: UpdateChildProfilePayload = await request.json()
    const profile = await updateChildProfile(payload)
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// DELETE /api/profiles - Delete a child profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('id')
    
    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    await deleteChildProfile(profileId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
} 