'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /*
   * We need to make sure Supabase has had a chance to exchange the URL
   * hash tokens ("#access_token=…&refresh_token=…") for a real session
   * **before** we decide whether to redirect the user away.  If we check
   * too early the session will be `null` and the component will navigate
   * back to the sign-in page even though a valid password-recovery link
   * was used.
   */

  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient();

    (async () => {
      // First pass: see if the session already exists (e.g. user was logged-in)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(!!session);
      setSessionChecked(true);
    })();

    // 2️⃣  Listen for the SIGNED_IN event which fires after Supabase parses
    //     the recovery tokens in the URL and stores them.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN') {
        setHasSession(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Once we've determined that there is *no* session, send the user back
  // to the sign-in screen.  Using a separate effect avoids calling
  // `router.push` during render which could cause React warnings.
  useEffect(() => {
    if (sessionChecked && hasSession === false) {
      router.push('/sign-in');
    }
  }, [sessionChecked, hasSession, router]);

  // While we're figuring things out show a simple loading indicator to
  // avoid a flash of the form which would then disappear.
  if (!sessionChecked && hasSession === null) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100'>
        <p className='text-lg font-semibold nunito-font'>Loading…</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password should be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Delay and redirect to sign-in
        setTimeout(() => router.push('/sign-in'), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 p-6'>
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg w-full max-w-md text-center'>
          <h1 className='text-2xl font-bold mb-4 junegull-font'>
            Password Updated
          </h1>
          <p className='nunito-font mb-2'>
            Your password has been updated successfully.
          </p>
          <p className='nunito-font'>Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 p-6'>
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center mb-6 junegull-font'>
          Set a New Password
        </h1>
        {error && (
          <div className='p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm nunito-font'>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='password'
              className='block text-gray-800 nunito-font font-bold mb-1'
            >
              New Password
            </label>
            <input
              id='password'
              type='password'
              placeholder='••••••••'
              className='w-full px-4 py-3 rounded-full border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor='confirm'
              className='block text-gray-800 nunito-font font-bold mb-1'
            >
              Confirm Password
            </label>
            <input
              id='confirm'
              type='password'
              placeholder='••••••••'
              className='w-full px-4 py-3 rounded-full border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none nunito-font'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-full transition-colors duration-300 nunito-font text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
