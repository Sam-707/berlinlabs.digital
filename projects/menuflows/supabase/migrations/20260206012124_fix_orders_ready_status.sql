-- Fix: Add 'ready' status to orders table constraint
-- This allows orders to move from 'cooking' to 'ready' status

-- Drop existing constraint if it exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with 'ready' status included
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending', 'confirmed', 'cooking', 'ready', 'served'));

-- Verify the constraint was added
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
  AND conname LIKE '%status%';
