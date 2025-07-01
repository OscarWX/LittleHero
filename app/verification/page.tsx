'use client';

import type React from 'react';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerificationPage() {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate verification process
    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect to dashboard after successful verification
      router.push('/dashboard');
    }, 1500);
  };

  const handleResend = () => {
    setResendMessage('Verification code resent!');
    setTimeout(() => setResendMessage(''), 3000);
  };

  return (
    <div className='flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 overflow-hidden relative'>
      {/* Background shapes */}
      <div className='absolute top-0 left-0 w-64 h-64 rounded-full bg-orange-200 -translate-x-1/2 -translate-y-1/4' />
      <div className='absolute top-1/4 right-0 w-72 h-72 rounded-full bg-yellow-200 translate-x-1/3' />
      <div className='absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-green-200 -translate-y-1/4' />
      <div className='absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-green-200 translate-y-1/2' />

      {/* Content container */}
      <div className='flex flex-col items-center justify-between min-h-screen py-8 px-6 z-10 max-w-md w-full'>
        {/* Back button */}
        <div className='self-start'>
          <Link
            href='/sign-up'
            className='flex items-center text-gray-700 hover:text-gray-900 transition-colors'
          >
            <ArrowLeft className='w-5 h-5 mr-1' />
            <span className='nunito-font font-bold'>Back</span>
          </Link>
        </div>

        {/* Header */}
        <div className='flex flex-col items-center text-center mt-4 mb-8'>
          <h1 className='text-3xl sm:text-4xl font-bold tracking-wider text-gray-900 junegull-font'>
            LITTLE HERO
          </h1>
          <h2 className='text-xl font-bold mt-3 text-gray-800 nunito-font'>
            Verify Your Email
          </h2>
        </div>

        {/* Verification Form */}
        <div className='w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg'>
          <div className='flex justify-center mb-6'>
            <div className='bg-yellow-100 p-4 rounded-full'>
              <Mail className='h-10 w-10 text-yellow-600' />
            </div>
          </div>

          <h3 className='text-xl font-bold text-gray-900 nunito-font mb-2 text-center'>
            Enter Verification Code
          </h3>

          <p className='text-gray-700 text-center mb-6'>
            We've sent a verification code to your email address. Please enter
            the code below to verify your account.
          </p>

          <form onSubmit={handleVerifySubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label
                htmlFor='verificationCode'
                className='block text-gray-800 nunito-font font-bold'
              >
                Verification Code
              </label>
              <input
                id='verificationCode'
                type='text'
                placeholder='Enter 6-digit code'
                className='w-full px-4 py-3 rounded-full border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font text-center tracking-widest'
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <button
              type='submit'
              className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-full transition-colors duration-300 nunito-font text-lg'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Sign Up'}
            </button>
          </form>

          <div className='mt-4 text-center'>
            <button
              className='text-gray-700 hover:text-gray-900 font-bold nunito-font'
              onClick={handleResend}
            >
              Don't get it?{' '}
              <span className='text-yellow-600 hover:text-yellow-700'>
                Resend!
              </span>
            </button>
            {resendMessage && (
              <p className='text-green-600 text-sm mt-2 nunito-font'>
                {resendMessage}
              </p>
            )}
          </div>
        </div>

        <div className='mt-6 mb-4 text-center text-xs text-gray-700 nunito-font'>
          © 2025 Little Hero. All rights reserved.
        </div>
      </div>
    </div>
  );
}
