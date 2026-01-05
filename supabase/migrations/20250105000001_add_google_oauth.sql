-- Google OAuth integration migration
-- Note: email_verified and google_id columns are already added in the OTP migration
-- This migration adds any additional OAuth-related configurations

-- Create OAuth providers table for future extensibility
CREATE TABLE IF NOT EXISTS public.oauth_providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'github', 'microsoft')),
    provider_user_id TEXT NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    raw_user_meta JSONB,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

-- Create indexes for OAuth providers
CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id ON public.oauth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_providers_provider ON public.oauth_providers(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_providers_provider_user_id ON public.oauth_providers(provider_user_id);

-- Enable RLS for OAuth providers
ALTER TABLE public.oauth_providers ENABLE ROW LEVEL SECURITY;

-- OAuth providers policies
CREATE POLICY "Users can view their own OAuth connections"
ON public.oauth_providers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own OAuth connections"
ON public.oauth_providers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth connections"
ON public.oauth_providers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth connections"
ON public.oauth_providers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add timestamp trigger for OAuth providers
CREATE TRIGGER set_timestamp_oauth_providers
    BEFORE UPDATE ON public.oauth_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Helper function to link OAuth provider
CREATE OR REPLACE FUNCTION link_oauth_provider(
  p_user_id UUID,
  p_provider TEXT,
  p_provider_user_id TEXT,
  p_email TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_raw_user_meta JSONB DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  INSERT INTO public.oauth_providers (
    user_id,
    provider,
    provider_user_id,
    email,
    full_name,
    avatar_url,
    raw_user_meta
  ) VALUES (
    p_user_id,
    p_provider,
    p_provider_user_id,
    p_email,
    p_full_name,
    p_avatar_url,
    p_raw_user_meta
  )
  ON CONFLICT (provider, provider_user_id) 
  DO UPDATE SET 
    last_used_at = NOW(),
    updated_at = NOW()
  RETURNING true, 'OAuth provider linked successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get or create user from OAuth
CREATE OR REPLACE FUNCTION get_or_create_oauth_user(
  p_provider TEXT,
  p_provider_user_id TEXT,
  p_email CITEXT,
  p_full_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_raw_user_meta JSONB DEFAULT NULL
) RETURNS TABLE(user_id UUID, is_new_user BOOLEAN) AS $$
DECLARE
  v_user_id UUID;
  v_is_new BOOLEAN := FALSE;
  v_provider_record RECORD;
BEGIN
  -- Check if OAuth provider already exists
  SELECT * INTO v_provider_record
  FROM public.oauth_providers
  WHERE provider = p_provider
    AND provider_user_id = p_provider_user_id;

  IF v_provider_record IS NOT NULL THEN
    -- Update last_used_at and return existing user
    UPDATE public.oauth_providers
    SET last_used_at = NOW()
    WHERE provider = p_provider
      AND provider_user_id = p_provider_user_id;
    
    RETURN QUERY SELECT v_provider_record.user_id, FALSE;
    RETURN;
  END IF;

  -- Check if email already exists in profiles
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    -- Create new user - will be handled by auth trigger
    v_is_new := TRUE;
  END IF;

  RETURN QUERY SELECT v_user_id, v_is_new;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions for OAuth functions
GRANT EXECUTE ON FUNCTION link_oauth_provider(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_oauth_user(TEXT, TEXT, CITEXT, TEXT, TEXT, JSONB) TO authenticated, anon;

-- Grant permissions for OAuth providers table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.oauth_providers TO authenticated;
