-- Migration to rename columns for consistency with application code
-- Run this in your Supabase SQL Editor if you have existing data

-- Rename prazo_inicial to prazo_dias
ALTER TABLE complaints RENAME COLUMN prazo_inicial TO prazo_dias;

-- Rename prorrogacao to prorrogacao_dias
ALTER TABLE complaints RENAME COLUMN prorrogacao TO prorrogacao_dias;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'complaints' 
  AND column_name IN ('prazo_dias', 'prorrogacao_dias')
ORDER BY column_name;
