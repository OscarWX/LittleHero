import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export interface SupabaseConfig {
  readonly url: string;
  readonly anonKey: string;
}

function getConfig(): SupabaseConfig {
  /*
   * Validate that the required environment variables are present.  In
   * development we fall back to dummy values so that the app can start even
   * when Supabase is not configured yet, but in production we want to fail
   * hard so that mis-configurations are surfaced immediately instead of
   * turning into confusing runtime errors or hanging network calls.
   */
  const isDev = process.env.NODE_ENV !== 'production';
  const isBuild =
    process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (isDev || isBuild) {
      // Provide obviously invalid placeholders so that calls will fail fast.
      // This allows the build to complete but will fail at runtime if actually used
      return {
        url: url ?? 'http://127.0.0.1/invalid-supabase-url',
        anonKey: anonKey ?? 'invalid-anon-key',
      };
    }

    throw new Error(
      'Supabase environment variables are not set. Please configure ' +
        '`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or the ' +
        'server-side equivalents) in your deployment environment.'
    );
  }

  return {
    url,
    anonKey,
  };
}

// For client-side operations that need session persistence
export function createSupabaseClient(): SupabaseClient {
  // Handle build time - return a mock client if in build environment
  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.VERCEL_ENV &&
    typeof window === 'undefined'
  ) {
    // Return a mock client for build time that won't actually work
    return createClient('http://localhost:3000', 'mock-key');
  }

  const { url, anonKey } = getConfig();

  // Cache the browser client so we don't create a new instance on every
  // component render or hook call.  This reduces the amount of network set-up
  // work that the underlying library has to perform and eliminates a source
  // of perceived latency when navigating between pages.
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    if (!(window as any).__supabase_client__) {
      // Browser environment – create once and stash on the global object.
      // Attaching to `window` avoids the need for an extra module-level var
      // that would be duplicated across Next.js route chunks.
      (window as any).__supabase_client__ = createBrowserSupabaseClient({
        supabaseUrl: url,
        supabaseKey: anonKey,
      });
    }

    return (window as any).__supabase_client__ as SupabaseClient;
  }

  // Server / edge runtime – create a new lightweight client per request.  This
  // is cheap because no connection pooling is done here.
  return createClient(url, anonKey);
}
