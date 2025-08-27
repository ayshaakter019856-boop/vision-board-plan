-- Add status column to accounts table to support folders (active, expired, problem)
ALTER TABLE public.accounts 
ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Add check constraint to ensure valid status values
ALTER TABLE public.accounts 
ADD CONSTRAINT accounts_status_check 
CHECK (status IN ('active', 'expired', 'problem'));

-- Create index for better performance when filtering by status
CREATE INDEX idx_accounts_status ON public.accounts(status);
CREATE INDEX idx_accounts_user_status ON public.accounts(user_id, status);