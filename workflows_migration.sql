-- Supabase Migration: Create Workflows Table
-- Run this script in the Supabase SQL Editor to create the workflows table with RLS.

CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  prompt text NOT NULL,
  status text DEFAULT 'active',
  last_run text DEFAULT 'Never',
  last_run_ms bigint DEFAULT 0,
  schedule text,
  destination text,
  webhook_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own workflows
CREATE POLICY "Users can insert their own workflows" 
ON public.workflows FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own workflows" 
ON public.workflows FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" 
ON public.workflows FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" 
ON public.workflows FOR DELETE 
USING (auth.uid() = user_id);
