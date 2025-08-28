-- Create a table for Netflix accounts
CREATE TABLE public.netflix_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  profile_name TEXT,
  profile_pin TEXT,
  note TEXT,
  category TEXT NOT NULL,
  order_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.netflix_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own netflix accounts" 
ON public.netflix_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own netflix accounts" 
ON public.netflix_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own netflix accounts" 
ON public.netflix_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own netflix accounts" 
ON public.netflix_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_netflix_accounts_updated_at
BEFORE UPDATE ON public.netflix_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();