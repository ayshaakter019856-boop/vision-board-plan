-- Add completed field to notes table
ALTER TABLE public.notes 
ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance when filtering by completed status
CREATE INDEX idx_notes_completed ON public.notes(completed);
CREATE INDEX idx_notes_user_completed ON public.notes(user_id, completed);