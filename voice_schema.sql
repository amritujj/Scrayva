-- Execute this in your Supabase SQL Editor

-- 1. Create the voice_agents table
CREATE TABLE voice_agents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  phone_number text,
  language text DEFAULT 'English',
  working_hours text,
  services text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for voice_agents
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own agents" ON voice_agents FOR ALL USING (auth.uid() = user_id);

-- 2. Create the appointments table
CREATE TABLE appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES voice_agents(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  phone text,
  service text,
  date_time timestamp with time zone NOT NULL,
  status text DEFAULT 'confirmed',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view appointments for their agents" ON appointments FOR SELECT USING (
  agent_id IN (SELECT id FROM voice_agents WHERE user_id = auth.uid())
);
