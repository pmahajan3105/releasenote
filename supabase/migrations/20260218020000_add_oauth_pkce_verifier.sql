-- Add PKCE verifier storage for OAuth flows (S256 code challenge)
ALTER TABLE oauth_states
ADD COLUMN IF NOT EXISTS pkce_verifier TEXT;

COMMENT ON COLUMN oauth_states.pkce_verifier IS 'PKCE code verifier associated with this OAuth state (S256)';

