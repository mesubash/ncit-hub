-- Add semester column to profiles table
-- This replaces the old 'year' column with 'semester' (1-8)

-- Check if semester column exists, if not add it
DO $$ 
BEGIN
    -- Try to add the semester column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'semester'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN semester INTEGER CHECK (semester BETWEEN 1 AND 8);
        
        RAISE NOTICE 'Added semester column to profiles table';
    ELSE
        RAISE NOTICE 'Semester column already exists';
    END IF;
    
    -- If there's an old 'year' column, migrate data and drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'year'
    ) THEN
        -- Migrate year data to semester (year 1 = semester 1-2, year 2 = semester 3-4, etc.)
        UPDATE public.profiles 
        SET semester = CASE 
            WHEN year = 1 THEN 1
            WHEN year = 2 THEN 3
            WHEN year = 3 THEN 5
            WHEN year = 4 THEN 7
            ELSE semester
        END
        WHERE year IS NOT NULL AND semester IS NULL;
        
        -- Drop the old year column
        ALTER TABLE public.profiles DROP COLUMN year;
        
        RAISE NOTICE 'Migrated year to semester and dropped year column';
    END IF;
END $$;

-- Verify the change
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name IN ('semester', 'year');
