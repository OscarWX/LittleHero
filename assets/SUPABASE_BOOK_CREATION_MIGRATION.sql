/* ----------------------------------------------------------------------
 *  LITTLE HERO – BOOK CREATION DATA MIGRATION
 *  Run this file to add book creation fields to the books table.
 *  This extends the existing books table to store all creation data.
 *  
 *  IMPORTANT: Run this migration AFTER the initial migration!
 * --------------------------------------------------------------------*/

-- First, check if the books table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'books') THEN
        RAISE EXCEPTION 'Books table does not exist! Please run SUPABASE_INITIAL_MIGRATION.sql first.';
    END IF;
END $$;

-- Add book creation data fields to the books table (with IF NOT EXISTS for safety)
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

-- Update status field to include creation statuses (safely drop and recreate constraint)
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_status_check;
ALTER TABLE public.books ADD CONSTRAINT books_status_check 
  CHECK (status IN ('draft', 'creating', 'generating-story', 'creating-pictures', 'processing', 'ready'));

-- Create index for better query performance (with IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_theme ON public.books(theme);
CREATE INDEX IF NOT EXISTS idx_books_user_status ON public.books(user_id, status);

-- Verify the migration worked
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'books' 
    AND column_name IN ('theme', 'qualities', 'magical_details', 'special_memories', 'narrative_style');
    
    IF column_count < 5 THEN
        RAISE EXCEPTION 'Migration failed! Only % out of 5 required columns were added.', column_count;
    ELSE
        RAISE NOTICE 'Migration successful! All book creation columns added.';
    END IF;
END $$;

-- Make sure RLS policies still work correctly for the new columns
-- (The existing RLS policies should automatically cover new columns)

-- Done ----------------------------------------------------------------- 