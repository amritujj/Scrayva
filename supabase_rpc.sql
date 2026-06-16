-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- This function atomically decrements the user's credits inside the raw_user_meta_data JSONB column.
-- It is designed to be called securely by your Next.js backend API using the service role key.

CREATE OR REPLACE FUNCTION decrement_user_credits(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{credits}',
    (COALESCE((raw_user_meta_data->>'credits')::int, 0) - 1)::text::jsonb
  )
  WHERE id = user_uuid;
END;
$$;
