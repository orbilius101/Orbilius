-- Add theme column to admin_code table for global theme setting
-- Run this in your Supabase SQL Editor

ALTER TABLE admin_code 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'midnight';

-- Update existing row to have the default theme
UPDATE admin_code SET theme = 'midnight' WHERE id = 1;

-- Verify the change
SELECT * FROM admin_code;
