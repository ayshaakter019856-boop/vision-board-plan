-- Create a table for daily costing
CREATE TABLE public.costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_name TEXT NOT NULL,
  date DATE NOT NULL,
  costing_reason TEXT NOT NULL,
  costing_amount DECIMAL(10,2) NOT NULL,
  is_earning BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own costs" 
ON public.costs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own costs" 
ON public.costs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own costs" 
ON public.costs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own costs" 
ON public.costs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_costs_updated_at
BEFORE UPDATE ON public.costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();