'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedProgressBar from '@/components/animated-progress-bar';

// Define story theme types
type ThemeOption = {
  id: string;
  label: string;
  color: string;
};

export default function StoryThemePage() {
  const router = useRouter();
  const [bookId, setBookId] = useState<string>('');
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [customTheme, setCustomTheme] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Theme options
  const themeOptions: ThemeOption[] = [
    { id: 'adventure', label: 'Adventure', color: '#FFC107' },
    { id: 'profession', label: 'Live a Profession', color: '#2196F3' },
    { id: 'birthday', label: 'Birthday', color: '#9ECAE1' },
    { id: 'healthy', label: 'Healthy Habits', color: '#4CAF50' },
    { id: 'family', label: 'Family Love', color: '#9C27B0' },
    { id: 'friendship', label: 'Friendship', color: '#FF9800' },
    { id: 'personalized', label: 'Personalized', color: '#607D8B' },
  ];

  // Load book data from URL parameters
  useEffect(() => {
    const loadBookData = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const bookIdParam = urlParams.get('bookId');

        if (!bookIdParam) {
          // No bookId, redirect back to start
          router.push('/add-book');
          return;
        }

        setBookId(bookIdParam);
        setIsLoading(false);
      } catch (e) {
        console.error('Error loading book data', e);
        router.push('/add-book');
      }
    };

    loadBookData();
  }, [router]);

  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    if (themeId !== 'personalized') {
      setCustomTheme('');
    }
  };

  // Handle next button click
  const handleNext = async () => {
    if (!bookId) return;

    try {
      setIsLoading(true);

      // Determine theme value
      const theme =
        selectedTheme === 'personalized'
          ? customTheme
          : themeOptions.find(t => t.id === selectedTheme)?.label || '';

      console.log('Saving theme:', { bookId, theme });

      // Save theme to backend
      const response = await fetch('/api/books/creation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          theme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          'API Error:',
          response.status,
          response.statusText,
          errorData
        );
        throw new Error(
          `Failed to save theme: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`
        );
      }

      const result = await response.json();
      console.log('Theme saved successfully:', result);

      // Navigate to the next page with bookId
      router.push(`/add-book/qualities?bookId=${bookId}`);
    } catch (error) {
      console.error('Error saving theme:', error);
      alert(
        `Error saving theme: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className='p-6 text-center'>Loading...</div>;
  }

  return (
    <div className='flex flex-col min-h-screen bg-[#FFF8E8]'>
      {/* Progress bar */}
      <AnimatedProgressBar progress={33.3} flowKey='book-creation' />

      {/* Header */}
      <header className='p-4 flex items-center'>
        <Link href='/add-book' className='text-gray-800'>
          <ArrowLeft size={24} />
        </Link>
        <h1 className='text-xl font-bold text-gray-900 ml-4'>Story Theme</h1>
      </header>

      {/* Content */}
      <main className='flex-1 p-6'>
        <div className='max-w-md mx-auto'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 junegull-font text-center'>
            WHAT KIND OF STORY SHOULD WE TELL?
          </h2>

          {/* Theme selection */}
          <div className='grid grid-cols-2 gap-4 mb-8'>
            {themeOptions.map(theme => (
              <button
                key={theme.id}
                className={`p-4 rounded-lg text-center transition-colors ${
                  selectedTheme === theme.id
                    ? 'border-2 border-yellow-500'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor:
                    selectedTheme === theme.id ? `${theme.color}20` : 'white',
                }}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <span className='nunito-font font-bold'>{theme.label}</span>
              </button>
            ))}
          </div>

          {/* Custom theme input */}
          {selectedTheme === 'personalized' && (
            <div className='bg-white p-4 rounded-lg mb-8 border border-gray-200'>
              <label
                htmlFor='customTheme'
                className='block text-gray-800 nunito-font font-bold mb-2'
              >
                Tell us about your theme:
              </label>
              <textarea
                id='customTheme'
                placeholder='Describe the personalized theme for your story...'
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                rows={3}
                value={customTheme}
                onChange={e => setCustomTheme(e.target.value)}
              />
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={
              selectedTheme === '' ||
              (selectedTheme === 'personalized' && customTheme === '')
            }
            className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Next: Qualities
          </button>
        </div>
      </main>
    </div>
  );
}
