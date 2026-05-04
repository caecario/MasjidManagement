-- Migration: Replace latitude/longitude/calculation_method with provinsi/kabkota
-- Run this in your Supabase SQL Editor

-- 1. Add new columns
ALTER TABLE mosque_config ADD COLUMN IF NOT EXISTS provinsi TEXT DEFAULT 'DKI Jakarta';
ALTER TABLE mosque_config ADD COLUMN IF NOT EXISTS kabkota TEXT DEFAULT 'Kota Jakarta';

-- 2. Drop old columns (optional — only if you're sure they're no longer needed)
ALTER TABLE mosque_config DROP COLUMN IF EXISTS latitude;
ALTER TABLE mosque_config DROP COLUMN IF EXISTS longitude;
ALTER TABLE mosque_config DROP COLUMN IF EXISTS calculation_method;

-- 3. Add theme column
ALTER TABLE mosque_config ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'ruby_red';
