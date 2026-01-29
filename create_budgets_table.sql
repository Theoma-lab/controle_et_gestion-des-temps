-- Create table for storing Sold Hours / Budgets
CREATE TABLE IF NOT EXISTS public.client_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    client_name TEXT NOT NULL,
    year INTEGER NOT NULL DEFAULT 2025,
    mission_type TEXT, -- e.g. "Comptabilité", "Juridique"
    role_code TEXT,    -- e.g. "EC", "DM", "CM"
    hours_sold NUMERIC DEFAULT 0,
    amount_sold NUMERIC DEFAULT 0,
    
    -- Constraint to allow UPSERT (update if exists)
    CONSTRAINT client_budgets_unique_entry UNIQUE (client_name, year, mission_type, role_code)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.client_budgets ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Enable read access for all users" ON public.client_budgets
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update for authenticated users (or service role)
CREATE POLICY "Enable insert/update for all users" ON public.client_budgets
    FOR ALL USING (auth.role() = 'authenticated');
