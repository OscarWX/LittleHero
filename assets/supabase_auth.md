# Little Hero - Supabase Authentication Setup

This guide contains the minimal configuration needed to fix authentication issues in Little Hero.

## 1. Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Database Schema

Ensure you have the following tables in your Supabase database:

### Profiles Table

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 3. Authentication Policies

Enable email authentication in your Supabase dashboard:

1. Go to Authentication → Providers
2. Enable Email provider
3. Save changes

## 4. Installation Instructions

After setting up the code changes, run:

```bash
cd "little hero"
pnpm install
```

This will install the new auth helper dependencies:

- @supabase/auth-helpers-nextjs
- @supabase/auth-helpers-react

## 5. Changes Made

The following minimal changes were made to fix authentication persistence:

1. **Added auth helper dependencies** to package.json
2. **Updated Supabase client** in `lib/supabase.ts` to use auth helpers
3. **Created SupabaseProvider** in `components/supabase-provider.tsx`
4. **Updated root layout** to include the provider with server-side session
5. **Added middleware** for automatic authentication routing
6. **Kept existing auth hook** - `hooks/use-auth.ts` should now work properly with session persistence

## 6. How It Works

- The `SessionContextProvider` handles automatic session persistence across page reloads
- The middleware manages authentication routing automatically
- Your existing `use-auth.ts` hook will now work with persistent sessions
- Once logged in, users will stay logged in until they explicitly sign out or the session expires

## 7. Testing

After installation and setup:

1. Sign up for a new account
2. Close the browser and reopen
3. Navigate to the app - you should automatically be signed in
4. Authentication state should persist across page reloads and browser sessions
