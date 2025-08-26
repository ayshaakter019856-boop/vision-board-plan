-- Add subscription plan fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN current_plan TEXT DEFAULT 'Free Plan',
ADD COLUMN plan_expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days');

-- Update existing users to have Free Plan with 30 days from now
UPDATE public.profiles 
SET current_plan = 'Free Plan', 
    plan_expires_at = now() + interval '30 days'
WHERE current_plan IS NULL;