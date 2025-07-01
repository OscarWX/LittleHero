'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AnimatedProgressBar from '@/components/animated-progress-bar';

export default function AddProfilePage() {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | ''>('');
  const [birthday, setBirthday] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store the form data in localStorage to access in later steps
    const profileData = {
      name: childName,
      gender,
      birthday,
    };

    localStorage.setItem('tempProfileData', JSON.stringify(profileData));

    // Navigate to the next page
    router.push('/add-profile/appearance');
  };

  return (
    <div className='flex flex-col min-h-screen bg-[#FFF8E8]'>
      {/* Progress bar */}
      <AnimatedProgressBar progress={33.3} flowKey='profile-creation' />

      {/* Header */}
      <header className='p-4 flex items-center'>
        <Link href='/dashboard' className='text-gray-800'>
          <ArrowLeft size={24} />
        </Link>
        <h1 className='text-xl font-bold text-gray-900 ml-4'>Add Profile</h1>
      </header>

      {/* Content */}
      <main className='flex-1 p-6'>
        <div className='max-w-md mx-auto'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 junegull-font text-center'>
            LET'S MEET YOUR LITTLE HERO!
          </h2>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label
                htmlFor='childName'
                className='block text-gray-800 nunito-font font-bold'
              >
                Child's Name
              </label>
              <input
                id='childName'
                type='text'
                placeholder="Enter your child's name"
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                value={childName}
                onChange={e => setChildName(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-gray-800 nunito-font font-bold'>
                Gender
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <button
                  type='button'
                  className={`py-3 px-4 rounded-lg border-2 ${
                    gender === 'boy'
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setGender('boy')}
                >
                  <span className='nunito-font'>Boy</span>
                </button>
                <button
                  type='button'
                  className={`py-3 px-4 rounded-lg border-2 ${
                    gender === 'girl'
                      ? 'bg-pink-100 border-pink-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setGender('girl')}
                >
                  <span className='nunito-font'>Girl</span>
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='birthday'
                className='block text-gray-800 nunito-font font-bold'
              >
                Birthday
              </label>
              <input
                id='birthday'
                type='date'
                className='w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                required
              />
            </div>

            <button
              type='submit'
              className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font text-lg mt-8'
            >
              Next
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
