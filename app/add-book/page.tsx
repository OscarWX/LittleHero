'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AnimatedProgressBar from '@/components/animated-progress-bar';
import {
  fetchUserChildProfiles,
  type ChildProfile,
} from '@/lib/db/child-profiles';
import { createDraftBook } from '@/lib/db/books';
import { useAuth } from '@/hooks/use-auth';

export default function AddBookPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load profiles from backend
  useEffect(() => {
    const loadProfiles = async () => {
      if (authLoading || !user) return;

      try {
        setIsLoading(true);
        const userProfiles = await fetchUserChildProfiles();
        setProfiles(userProfiles);
      } catch (e) {
        console.error('Error loading profiles:', e);
        setError('Failed to load profiles');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, [user, authLoading]);

  // Handle profile selection
  const toggleProfileSelection = (profileId: string) => {
    setSelectedProfiles(prev => {
      if (prev.includes(profileId)) {
        return prev.filter(id => id !== profileId);
      } else {
        return [...prev, profileId];
      }
    });
  };

  // Format character list for display
  const formatCharacterList = () => {
    if (selectedProfiles.length === 0) return '';

    const selectedProfileNames = selectedProfiles.map(id => {
      const profile = profiles.find(p => p.id === id);
      return profile?.name || '';
    });

    if (selectedProfileNames.length === 1) {
      return selectedProfileNames[0];
    } else if (selectedProfileNames.length === 2) {
      return `${selectedProfileNames[0]} and ${selectedProfileNames[1]}`;
    } else {
      const lastProfile = selectedProfileNames.pop();
      return `${selectedProfileNames.join(', ')}, and ${lastProfile}`;
    }
  };

  // Handle next button click
  const handleNext = async () => {
    if (selectedProfiles.length === 0) return;

    try {
      setIsLoading(true);

      // Create a draft book with selected profiles
      const characterNames = selectedProfiles
        .map(id => {
          const profile = profiles.find(p => p.id === id);
          return profile?.name || '';
        })
        .filter(Boolean);

      const title = `A Story About ${formatCharacterList()}`;
      const book = await createDraftBook(title, selectedProfiles);

      // Navigate to theme page with book ID
      router.push(`/add-book/theme?bookId=${book.id}`);
    } catch (e) {
      console.error('Error creating book:', e);
      setError('Failed to create book');
      setIsLoading(false);
    }
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      // Clear local loading state so that the spinner is not shown forever
      setIsLoading(false);
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-[#FFF8E8]'>
        <div className='text-lg text-gray-600 nunito-font'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-[#FFF8E8] p-6'>
        <div className='text-red-600 nunito-font mb-4'>{error}</div>
        <Link href='/dashboard' className='text-blue-600 underline nunito-font'>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className='flex flex-col min-h-screen bg-[#FFF8E8]'>
        <header className='p-4 flex items-center'>
          <Link href='/dashboard' className='text-gray-800'>
            <ArrowLeft size={24} />
          </Link>
          <h1 className='text-xl font-bold text-gray-900 ml-4'>Create Book</h1>
        </header>

        <main className='flex-1 p-6 flex flex-col items-center justify-center'>
          <div className='bg-white p-6 rounded-lg shadow-sm text-center max-w-sm'>
            <p className='text-gray-700 nunito-font mb-4'>
              You need to create at least one profile before creating a book.
            </p>
            <Link
              href='/add-profile'
              className='inline-block py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font'
            >
              Create Profile
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-[#FFF8E8]'>
      {/* Progress bar */}
      <AnimatedProgressBar progress={16.7} flowKey='book-creation' />

      {/* Header */}
      <header className='p-4 flex items-center'>
        <Link href='/dashboard' className='text-gray-800'>
          <ArrowLeft size={24} />
        </Link>
        <h1 className='text-xl font-bold text-gray-900 ml-4'>Create Book</h1>
      </header>

      {/* Content */}
      <main className='flex-1 p-6'>
        <div className='max-w-md mx-auto'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 junegull-font text-center'>
            CHOOSE YOUR CHARACTERS
          </h2>

          {/* Profile selection */}
          <div className='grid grid-cols-2 gap-4 mb-8'>
            {profiles.map(profile => (
              <div
                key={profile.id}
                className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedProfiles.includes(profile.id)
                    ? 'bg-yellow-100 border-2 border-yellow-400'
                    : 'bg-white border-2 border-transparent hover:bg-gray-50'
                }`}
                onClick={() => toggleProfileSelection(profile.id)}
              >
                <div className='w-20 h-20 rounded-full flex items-center justify-center mb-2 overflow-hidden bg-gradient-to-br from-yellow-200 to-orange-200'>
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.name}
                      width={80}
                      height={80}
                      className='object-cover w-full h-full'
                    />
                  ) : (
                    <span className='text-white text-2xl font-bold'>
                      {profile.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className='text-gray-900 nunito-font text-center'>
                  {profile.name}
                </span>
              </div>
            ))}
          </div>

          {/* Selection summary */}
          {selectedProfiles.length > 0 && (
            <div className='bg-white p-4 rounded-lg mb-8 text-center'>
              <p className='text-gray-800 nunito-font'>
                This is a story about{' '}
                <span className='font-bold'>{formatCharacterList()}</span>
              </p>
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={selectedProfiles.length === 0 || isLoading}
            className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Creating Book...' : 'Next: Story Theme'}
          </button>
        </div>
      </main>
    </div>
  );
}
