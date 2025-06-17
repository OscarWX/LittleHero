/* ----------------------------------------------------------------------
 *  LITTLE HERO – INITIAL DATABASE MIGRATION
 *  Run this file first in the Supabase SQL editor.
 *  Simple table creation with Row-Level Security.
 * --------------------------------------------------------------------*/

-- 1. CHILD PROFILES ----------------------------------------------------
create table public.child_profiles (
  id          uuid                        primary key default gen_random_uuid(),
  user_id     uuid                        not null references auth.users(id) on delete cascade,
  name        text                        not null,
  gender      text                        check (gender in ('boy','girl')),
  birthday    date,
  appearance  jsonb,
  special_traits text,
  favorite_thing text,
  avatar_url  text,
  created_at  timestamptz                 default now()
);

alter table public.child_profiles enable row level security;

create policy "Parents manage own child profiles" on public.child_profiles
  for all
  using  ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- 2. BOOKS -------------------------------------------------------------
create table public.books (
  id          uuid            primary key default gen_random_uuid(),
  user_id     uuid            not null references auth.users(id) on delete cascade,
  title       text            not null,
  status      text            default 'draft',
  cover_url   text,
  created_at  timestamptz     default now()
);

alter table public.books enable row level security;

create policy "Parents manage own books" on public.books
  for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- 3. BOOK ↔ CHILD PROFILES (Many-to-Many) ------------------------------
create table public.book_profiles (
  book_id    uuid  references public.books(id) on delete cascade,
  profile_id uuid  references public.child_profiles(id) on delete cascade,
  primary key (book_id, profile_id)
);

alter table public.book_profiles enable row level security;

create policy "Parents manage own book-profile links" on public.book_profiles
  for all
  using (
    auth.uid() in (
      select user_id from public.books where books.id = book_profiles.book_id
    )
  );

-- 4. BOOK PAGES --------------------------------------------------------
create table public.book_pages (
  id           bigint generated always as identity primary key,
  book_id      uuid references public.books(id) on delete cascade,
  page_number  int  not null,
  image_url    text,
  text_content text,
  created_at   timestamptz default now(),
  unique (book_id, page_number)
);

alter table public.book_pages enable row level security;

create policy "Parents manage own book pages" on public.book_pages
  for all
  using (
    auth.uid() in (
      select user_id from public.books where books.id = book_pages.book_id
    )
  );

-- 5. INDEXES -----------------------------------------------------------
create index idx_child_profiles_user_id on public.child_profiles(user_id);
create index idx_books_user_id on public.books(user_id);
create index idx_book_pages_book_id on public.book_pages(book_id);
create index idx_book_pages_book_page on public.book_pages(book_id, page_number);

-- Done ----------------------------------------------------------------- 