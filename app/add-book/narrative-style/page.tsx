'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedProgressBar from '@/components/animated-progress-bar';

// Define narrative style options
type StyleOption = {
  id: string;
  label: string;
  description: string;
};

export default function NarrativeStylePage() {
  const router = useRouter();
  const [bookId, setBookId] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customStyle, setCustomStyle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Narrative style options
  const styleOptions: StyleOption[] = [
    {
      id: 'rhyming',
      label: 'Rhyming',
      description: 'A fun, rhythmic story with rhyming couplets',
    },
    {
      id: 'adventure',
      label: 'Adventure',
      description: 'An exciting tale with twists and turns',
    },
    {
      id: 'bedtime',
      label: 'Bedtime',
      description: 'A calm, soothing story perfect for nighttime',
    },
    {
      id: 'educational',
      label: 'Educational',
      description: 'A story that teaches concepts while entertaining',
    },
    {
      id: 'funny',
      label: 'Funny',
      description: 'A humorous tale filled with laughs',
    },
    {
      id: 'personalized',
      label: 'Personalized',
      description: 'Create your own narrative style',
    },
  ];

  // Load book data from URL parameters
  useEffect(() => {
    const loadBookData = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const bookIdParam = urlParams.get('bookId');

        if (!bookIdParam) {
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

  // Handle style selection
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    if (styleId !== 'personalized') {
      setCustomStyle('');
    }
  };

  // Handle next button click
  const handleNext = async () => {
    if (!bookId) return;

    try {
      setIsLoading(true);

      // Determine style value
      const style =
        selectedStyle === 'personalized'
          ? customStyle
          : styleOptions.find(s => s.id === selectedStyle)?.label || '';

      // Save narrative style to backend
      const response = await fetch('/api/books/creation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          narrative_style: style,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save narrative style');
      }

      // Navigate to the preview page with bookId
      router.push(`/add-book/preview?bookId=${bookId}`);
    } catch (error) {
      console.error('Error saving narrative style:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className='p-6 text-center'>Loading...</div>;
  }

  return (
    <div className='flex flex-col min-h-screen bg-[#FFF8E8]'>
      {/* Progress bar - full width now */}
      <AnimatedProgressBar progress={100} flowKey='book-creation' />

      {/* Header */}
      <header className='p-4 flex items-center'>
        <Link href='/add-book/special-memories' className='text-gray-800'>
          <ArrowLeft size={24} />
        </Link>
        <h1 className='text-xl font-bold text-gray-900 ml-4'>
          Narrative Style
        </h1>
      </header>

      {/* Content */}
      <main className='flex-1 p-6'>
        <div className='max-w-md mx-auto'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 junegull-font text-center'>
            SELECT NARRATIVE STYLE
          </h2>

          {/* Style selection */}
          <div className='space-y-4 mb-8'>
            {styleOptions.map(style => (
              <button
                key={style.id}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedStyle === style.id
                    ? 'bg-purple-100 border-2 border-purple-300'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleStyleSelect(style.id)}
              >
                <div className='flex justify-between items-center'>
                  <span className='nunito-font font-bold'>{style.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full ${selectedStyle === style.id ? 'bg-purple-500' : 'bg-gray-200'}`}
                  ></div>
                </div>
                <p className='text-gray-600 text-sm mt-1'>
                  {style.description}
                </p>
              </button>
            ))}
          </div>

          {/* Custom style input */}
          {selectedStyle === 'personalized' && (
            <div className='bg-white p-4 rounded-lg mb-8 border border-gray-200'>
              <label
                htmlFor='customStyle'
                className='block text-gray-800 nunito-font font-bold mb-2'
              >
                Describe your preferred narrative style:
              </label>
              <textarea
                id='customStyle'
                placeholder='E.g., a mystery with clues, a fairy tale with magical elements...'
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                rows={3}
                value={customStyle}
                onChange={e => setCustomStyle(e.target.value)}
              />
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={
              selectedStyle === '' ||
              (selectedStyle === 'personalized' && customStyle === '')
            }
            className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Preview Story
          </button>
        </div>
      </main>
    </div>
  );
}
