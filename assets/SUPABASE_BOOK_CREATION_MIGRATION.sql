/* ----------------------------------------------------------------------
 *  LITTLE HERO – BOOK CREATION DATA MIGRATION
 *  Run this file to add book creation fields to the books table.
 *  This extends the existing books table to store all creation data.
 * --------------------------------------------------------------------*/

-- Add book creation data fields to the books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS theme text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS qualities jsonb;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS magical_details text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS magical_image_url text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS special_memories text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS special_memories_image_url text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS narrative_style text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS creation_data jsonb; -- For storing any additional data
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS story_content text; -- For generated story
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS generation_prompt text; -- For storing the prompt used

-- Update status field to include creation statuses
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_status_check;
ALTER TABLE public.books ADD CONSTRAINT books_status_check 
  CHECK (status IN ('draft', 'creating', 'generating-story', 'creating-pictures', 'processing', 'ready'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);

-- Done ----------------------------------------------------------------- 