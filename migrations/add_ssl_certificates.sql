-- SSL certificate management tables
CREATE TABLE IF NOT EXISTS ssl_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  certificate TEXT NOT NULL,
  private_key TEXT NOT NULL,
  certificate_chain TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  provider TEXT DEFAULT 'letsencrypt',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, domain)
);

-- SSL verification challenges table for ACME protocol
CREATE TABLE IF NOT EXISTS ssl_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  challenge_type TEXT DEFAULT 'dns-01',
  challenge_token TEXT NOT NULL,
  challenge_response TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ssl_certificates_org_domain ON ssl_certificates(organization_id, domain);
CREATE INDEX IF NOT EXISTS idx_ssl_certificates_expires_at ON ssl_certificates(expires_at) WHERE auto_renew = true;
CREATE INDEX IF NOT EXISTS idx_ssl_challenges_domain_status ON ssl_challenges(domain, status);
CREATE INDEX IF NOT EXISTS idx_ssl_challenges_expires_at ON ssl_challenges(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE ssl_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssl_challenges ENABLE ROW LEVEL SECURITY;

-- RLS policies for ssl_certificates
CREATE POLICY "Users can view SSL certificates for their organization" ON ssl_certificates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage SSL certificates for their organization" ON ssl_certificates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- RLS policies for ssl_challenges
CREATE POLICY "Users can view SSL challenges for their organization" ON ssl_challenges
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage SSL challenges for their organization" ON ssl_challenges
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ssl_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ssl_certificates_updated_at 
  BEFORE UPDATE ON ssl_certificates 
  FOR EACH ROW EXECUTE FUNCTION update_ssl_certificates_updated_at();

-- Function to clean up expired challenges
CREATE OR REPLACE FUNCTION cleanup_expired_ssl_challenges()
RETURNS void AS $$
BEGIN
    DELETE FROM ssl_challenges 
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ language 'plpgsql';

-- Add SSL status to organizations view (optional)
CREATE OR REPLACE VIEW organization_ssl_status AS
SELECT 
  o.id,
  o.name,
  o.custom_domain,
  o.domain_verified,
  CASE 
    WHEN sc.id IS NOT NULL AND sc.expires_at > NOW() THEN true
    ELSE false
  END as ssl_enabled,
  CASE 
    WHEN sc.id IS NULL THEN 'no_certificate'
    WHEN sc.expires_at <= NOW() THEN 'expired'
    WHEN sc.expires_at <= NOW() + INTERVAL '30 days' THEN 'expiring_soon'
    ELSE 'active'
  END as ssl_status,
  sc.expires_at as ssl_expires_at,
  sc.auto_renew as ssl_auto_renew,
  sc.provider as ssl_provider
FROM organizations o
LEFT JOIN ssl_certificates sc ON o.id = sc.organization_id AND o.custom_domain = sc.domain;

-- Grant permissions on the view
GRANT SELECT ON organization_ssl_status TO authenticated;