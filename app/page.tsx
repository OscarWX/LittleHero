import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Little Hero - Children's Storytelling App",
  description: 'Turn your child into the hero of their own story',
};

export default function LandingPage() {
  return (
    <div className='flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 overflow-hidden relative'>
      {/* Background shapes */}
      <div className='absolute top-0 left-0 w-64 h-64 rounded-full bg-orange-200 -translate-x-1/2 -translate-y-1/4' />
      <div className='absolute top-1/4 right-0 w-72 h-72 rounded-full bg-yellow-200 translate-x-1/3' />
      <div className='absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-green-200 -translate-y-1/4' />
      <div className='absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-green-200 translate-y-1/2' />

      {/* Content container */}
      <div className='flex flex-col items-center justify-between min-h-screen py-12 px-6 z-10 max-w-md w-full'>
        {/* Header */}
        <div className='flex flex-col items-center text-center mt-8'>
          <h1 className='text-4xl sm:text-5xl font-bold tracking-wider text-gray-900 junegull-font'>
            LITTLE HERO
          </h1>
          <h2 className='text-lg sm:text-xl font-bold mt-3 text-gray-800 nunito-font max-w-xs'>
            Turn your child into the hero of their own story
          </h2>
        </div>

        {/* Hero image */}
        <div className='flex-1 flex items-center justify-center my-8'>
          <div className='relative w-64 h-64 sm:w-80 sm:h-80'>
            <Image
              src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E5%B0%81%E9%9D%A2%E5%9B%BE%E7%89%87-fXn87dWKL27TelytyHeC5BPupvhRHR.png'
              alt='Flying cartoon child superhero'
              fill
              className='object-contain'
              priority
            />
          </div>
        </div>

        {/* Buttons */}
        <div className='flex flex-col w-full gap-4 mb-8 max-w-xs'>
          <Link
            href='/sign-in'
            className='w-full py-4 px-6 bg-yellow-200 hover:bg-yellow-300 text-gray-900 font-bold rounded-full transition-colors duration-300 nunito-font text-lg text-center'
          >
            Sign In
          </Link>
          <Link
            href='/sign-up'
            className='w-full py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-full transition-colors duration-300 nunito-font text-lg text-center'
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
