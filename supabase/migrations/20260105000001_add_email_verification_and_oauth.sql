-- Add email verification and OAuth columns to profiles table
-- Migration: Add Email Verification and OAuth Support

-- Add new columns to profiles table if they don't exist
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

-- Create indexes for OTP tokens for better query performance
CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_id ON public.otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON public.otp_tokens(email);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_code ON public.otp_tokens(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires_at ON public.otp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_purpose ON public.otp_tokens(purpose);

-- Enable RLS for otp_tokens
ALTER TABLE public.otp_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own OTP tokens
CREATE POLICY "Users can view their own OTP tokens"
ON public.otp_tokens
FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.email() = email OR
  auth.role() = 'authenticated'
);

-- RLS Policy: Service role can manage OTP tokens
CREATE POLICY "Service role can manage OTP tokens"
ON public.otp_tokens
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create function to clean up expired OTP tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_tokens
  WHERE expires_at < NOW()
  AND is_used = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate OTP code
CREATE OR REPLACE FUNCTION public.generate_otp_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  otp_code VARCHAR(6);
BEGIN
  otp_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN otp_code;
END;
$$ LANGUAGE plpgsql;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_otp(
  p_email CITEXT,
  p_otp_code VARCHAR(6),
  p_purpose TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID
) AS $$
DECLARE
  v_otp_record RECORD;
  v_user_id UUID;
BEGIN
  -- Find the OTP token
  SELECT * INTO v_otp_record
  FROM public.otp_tokens
  WHERE email = p_email
  AND otp_code = p_otp_code
  AND purpose = p_purpose
  AND is_used = FALSE
  AND expires_at > NOW()
  AND attempts < max_attempts
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_otp_record IS NULL THEN
    -- Try to find the user for the error response
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE email = p_email
    LIMIT 1;

    RETURN QUERY SELECT FALSE, 'Invalid or expired OTP'::TEXT, v_user_id;
    RETURN;
  END IF;

  -- Mark OTP as used
  UPDATE public.otp_tokens
  SET is_used = TRUE,
      verified_at = NOW(),
      updated_at = NOW()
  WHERE id = v_otp_record.id;

  -- Mark email as verified if this was an email verification OTP
  IF p_purpose = 'email_verification' THEN
    UPDATE public.profiles
    SET email_verified = TRUE,
        email_verified_at = NOW(),
        updated_at = NOW()
    WHERE email = p_email;
  END IF;

  RETURN QUERY SELECT TRUE, 'OTP verified successfully'::TEXT, v_otp_record.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create OTP token
CREATE OR REPLACE FUNCTION public.create_otp_token(
  p_email CITEXT,
  p_purpose TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  otp_code VARCHAR(6),
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_otp_code VARCHAR(6);
  v_new_id UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate OTP code
  v_otp_code := public.generate_otp_code();
  v_expires_at := NOW() + INTERVAL '10 minutes';

  -- Insert OTP token
  INSERT INTO public.otp_tokens (
    user_id,
    email,
    otp_code,
    purpose,
    expires_at
  ) VALUES (
    p_user_id,
    p_email,
    v_otp_code,
    p_purpose,
    v_expires_at
  )
  RETURNING otp_tokens.id INTO v_new_id;

  RETURN QUERY SELECT v_new_id, v_otp_code, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_otp_code() TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_otp(CITEXT, VARCHAR(6), TEXT) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.create_otp_token(CITEXT, TEXT, UUID) TO service_role, authenticated;
