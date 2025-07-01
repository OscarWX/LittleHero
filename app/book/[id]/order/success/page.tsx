'use client';

import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  return (
    <div className='min-h-screen bg-[#FFF8E8] flex flex-col'>
      <header className='p-4 flex items-center'>
        <button
          onClick={() => router.push(`/book/${bookId}/preview`)}
          className='text-gray-800 flex items-center'
        >
          <ArrowLeft size={24} />
          <span className='ml-2 text-sm text-gray-600'>Back to Preview</span>
        </button>
      </header>

      <main className='flex-1 px-4 pb-24 max-w-md mx-auto flex flex-col items-center justify-center text-center'>
        <CheckCircle size={64} className='text-green-500 mb-6' />
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Order Placed!</h1>
        <p className='text-gray-700 nunito-font mb-6'>
          Your storybook is being printed and will be on its way soon. ✨
        </p>
        <button
          onClick={() => router.push('/dashboard?tab=books')}
          className='bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-4 px-6 rounded-full text-lg transition-colors duration-300'
        >
          Return to Dashboard
        </button>
      </main>
    </div>
  );
}
