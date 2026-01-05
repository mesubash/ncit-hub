-- Add email verification and OAuth fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS google_account_verified BOOLEAN DEFAULT FALSE;

-- Create OTP tokens table for email verification and password reset
CREATE TABLE IF NOT EXISTS public.otp_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email CITEXT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('email_verification', 'password_reset', 'account_recovery')),
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    is_used BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for OTP tokens
CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_id ON public.otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON public.otp_tokens(email);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_code ON public.otp_tokens(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires_at ON public.otp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_purpose ON public.otp_tokens(purpose);

-- Enable RLS for OTP tokens
ALTER TABLE public.otp_tokens ENABLE ROW LEVEL SECURITY;

-- OTP tokens policies
CREATE POLICY "Users can view their own OTP tokens"
ON public.otp_tokens FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service can create OTP tokens (no auth required)"
ON public.otp_tokens FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own OTP tokens"
ON public.otp_tokens FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OTP tokens"
ON public.otp_tokens FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add timestamp trigger for OTP tokens
CREATE TRIGGER set_timestamp_otp_tokens
    BEFORE UPDATE ON public.otp_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- OTP Helper Functions
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS VARCHAR(6) AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_tokens 
  WHERE expires_at < NOW() 
  AND is_used = FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_otp(
  p_email CITEXT,
  p_otp_code VARCHAR(6),
  p_purpose TEXT
) RETURNS TABLE(success BOOLEAN, message TEXT, user_id UUID) AS $$
DECLARE
  v_otp_record RECORD;
  v_attempts INT;
BEGIN
  -- Get the OTP record
  SELECT * INTO v_otp_record
  FROM public.otp_tokens
  WHERE email = p_email
    AND otp_code = p_otp_code
    AND purpose = p_purpose
    AND is_used = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  -- OTP not found or expired
  IF v_otp_record IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid or expired OTP'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check max attempts
  IF v_otp_record.attempts >= v_otp_record.max_attempts THEN
    RETURN QUERY SELECT FALSE, 'Maximum attempts exceeded'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Increment attempts
  UPDATE public.otp_tokens
  SET attempts = attempts + 1,
      verified_at = NOW(),
      is_used = TRUE,
      updated_at = NOW()
  WHERE id = v_otp_record.id;

  -- Return success
  RETURN QUERY SELECT TRUE, 'OTP verified successfully'::TEXT, v_otp_record.user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions for OTP functions
GRANT EXECUTE ON FUNCTION generate_otp_code() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_otps() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_otp(CITEXT, VARCHAR, TEXT) TO authenticated, anon;

-- Grant insert permissions for OTP tokens
GRANT INSERT ON TABLE public.otp_tokens TO authenticated, anon;
