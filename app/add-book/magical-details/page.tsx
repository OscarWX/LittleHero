'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedProgressBar from '@/components/animated-progress-bar';

export default function MagicalDetailsPage() {
  const router = useRouter();
  const [bookId, setBookId] = useState<string>('');
  const [magicalDetails, setMagicalDetails] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

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

  const handleNext = async () => {
    if (!bookId) return;

    try {
      setIsLoading(true);

      // Save magical details to backend
      const response = await fetch('/api/books/creation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          magical_details: magicalDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save magical details');
      }

      // Navigate to the next page with bookId
      router.push(`/add-book/special-memories?bookId=${bookId}`);
    } catch (error) {
      console.error('Error saving magical details:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className='p-6 text-center'>Loading...</div>;
  }

  return (
    <div className='flex flex-col min-h-screen bg-[#FFF8E8]'>
      <AnimatedProgressBar progress={66.7} flowKey='book-creation' />

      <header className='p-4 flex items-center'>
        <Link href='/add-book/qualities' className='text-gray-800'>
          <ArrowLeft size={24} />
        </Link>
        <h1 className='text-xl font-bold text-gray-900 ml-4'>
          Your Magical Detail
        </h1>
      </header>

      <main className='flex-1 p-6'>
        <div className='max-w-md mx-auto'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 junegull-font text-center'>
            ADD ONE MAGICAL TOUCH (OPTIONAL)
          </h2>

          <div className='bg-white p-4 rounded-lg mb-6 border border-gray-200'>
            <p className='text-gray-700 nunito-font mb-4'>
              Want to add a little magic to the story? You can describe one
              magical item, power, or creature that brings a special sparkle to
              the adventure.
            </p>

            <textarea
              placeholder="Describe one magical detail you'd like to include... (optional)"
              className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font mb-4'
              rows={4}
              value={magicalDetails}
              onChange={e => setMagicalDetails(e.target.value)}
            />
          </div>

          <div className='flex gap-4'>
            <button
              onClick={handleNext}
              className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg'
            >
              Next: Special Memories
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
