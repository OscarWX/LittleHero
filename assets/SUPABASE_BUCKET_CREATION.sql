/* ----------------------------------------------------------------------
 *  LITTLE HERO – STORAGE BUCKET CREATION & RLS
 *  Run this file AFTER `SUPABASE_INITIAL_MIGRATION.sql`.
 *  Create buckets manually in Supabase Dashboard, then run the policies.
 * --------------------------------------------------------------------*/

-- Note: Create these buckets manually in Supabase Dashboard first:
-- 1. profile-photos (private)
-- 2. book-covers (public)  
-- 3. book-pages (public)
-- 4. raw-uploads (private)

-- 1. PROFILE PHOTOS POLICIES (private bucket) -------------------------
create policy "Parents upload own profile photo" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Parents update own profile photo" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Parents delete own profile photo" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Parents select own profile photo" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. BOOK COVERS POLICIES (public bucket) -----------------------------
create policy "Parents manage own book covers" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'book-covers' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public can read book covers" on storage.objects
  for select to public
  using (bucket_id = 'book-covers');

-- 3. BOOK PAGES POLICIES (public bucket) ------------------------------
create policy "Parents manage own book pages" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'book-pages' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public can read book pages" on storage.objects
  for select to public
  using (bucket_id = 'book-pages');

-- 4. RAW UPLOADS POLICIES (private bucket) ----------------------------
create policy "Parents manage own raw uploads" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'raw-uploads' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Done ----------------------------------------------------------------- 