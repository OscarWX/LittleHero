/* ----------------------------------------------------------------------
 *  LITTLE HERO – AUTH SETUP
 *  Run this file after the initial migration.
 *  Simple profile table for basic user info.
 * --------------------------------------------------------------------*/

-- 1. USER PROFILES TABLE ----------------------------------------------
-- Simple table to store basic parent/user information
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using ( auth.uid() = id );

create policy "Users can update own profile" on public.profiles
  for update using ( auth.uid() = id );

create policy "Users can insert own profile" on public.profiles
  for insert with check ( auth.uid() = id );

-- 2. OPTIONAL SETTINGS ------------------------------------------------
-- Uncomment if you want to require email confirmation:
-- update auth.config set require_email_verification = true;

-- Done ----------------------------------------------------------------- 