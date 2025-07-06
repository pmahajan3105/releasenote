-- Create oauth_states table for OAuth flow state management
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_provider ON oauth_states(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

-- Add RLS policy
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own OAuth states
CREATE POLICY "Users can access their own oauth states" ON oauth_states
    FOR ALL USING (auth.uid() = user_id);

-- Add function to clean up expired states
CREATE OR REPLACE FUNCTION clean_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$;

-- Comment on table
COMMENT ON TABLE oauth_states IS 'Stores OAuth state parameters for security validation during OAuth flows';