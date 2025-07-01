import { NextRequest, NextResponse } from 'next/server';
import { fetchChildProfileById } from '@/lib/db/child-profiles';

// GET /api/profiles/[id] - Fetch a specific child profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await fetchChildProfileById(params.id);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
