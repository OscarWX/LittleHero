'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 p-6'>
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center mb-6 junegull-font'>
          Reset Your Password
        </h1>
        {message && (
          <div className='p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm nunito-font'>
            {message}
          </div>
        )}
        {error && (
          <div className='p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm nunito-font'>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-gray-800 nunito-font font-bold mb-1'
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              placeholder='parent@example.com'
              className='w-full px-4 py-3 rounded-full border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-full transition-colors duration-300 nunito-font text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <Link
            href='/sign-in'
            className='text-gray-600 hover:text-gray-800 font-bold'
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
