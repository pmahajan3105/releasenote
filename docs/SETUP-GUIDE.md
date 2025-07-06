# Azure OpenAI & Resend Setup Guide

**Release Notes Generator - Complete Setup Instructions**  
*Version: 1.1 | Last Updated: July 2025*

---

## Table of Contents

1. [Overview](#overview)
2. [Azure OpenAI Setup](#azure-openai-setup)
3. [Resend Email Setup](#resend-email-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Testing & Verification](#testing--verification)
7. [Production Configuration](#production-configuration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides step-by-step instructions for setting up Azure OpenAI and Resend services for the Release Notes Generator project. You'll learn how to create accounts, configure services, and integrate them into your application.

### Prerequisites

- Azure account with active subscription
- Node.js 18+ installed
- PostgreSQL database (or Supabase account)
- Basic understanding of environment variables

### Services We'll Configure

1. **Azure OpenAI** - GPT-4o-mini for AI text generation
2. **Resend** - Professional email delivery service
3. **Supabase** - Database and authentication (optional)

---

## Azure OpenAI Setup

### Step 1: Create Azure OpenAI Resource

1. **Sign in to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create OpenAI Resource**
   ```bash
   # Option 1: Using Azure Portal
   - Click "Create a resource"
   - Search for "OpenAI"
   - Click "Azure OpenAI"
   - Click "Create"
   ```

3. **Configure Resource Settings**
   ```
   Subscription: [Your subscription]
   Resource Group: release-notes-rg (create new)
   Region: East US (recommended for GPT-4o-mini)
   Name: release-notes-openai
   Pricing Tier: Standard S0
   ```

4. **Complete Resource Creation**
   - Click "Review + create"
   - Wait for deployment to complete (2-3 minutes)
   - Click "Go to resource"

### Step 2: Deploy GPT-4o-mini Model

1. **Access Azure OpenAI Studio**
   - In your OpenAI resource, click "Go to Azure OpenAI Studio"
   - Or visit [oai.azure.com](https://oai.azure.com)

2. **Create Model Deployment**
   ```bash
   # Navigate to Deployments
   - Click "Deployments" in left sidebar
   - Click "Create new deployment"
   
   # Configure deployment
   Model: gpt-4o-mini
   Deployment name: gpt-4o-mini
   Model version: Latest
   Deployment type: Standard
   Tokens per minute rate limit: 30K (adjust based on needs)
   ```

3. **Verify Deployment**
   - Wait for deployment status to show "Succeeded"
   - Note the deployment name (you'll need this later)

### Step 3: Get API Credentials

1. **Retrieve API Key**
   ```bash
   # In Azure OpenAI Studio
   - Click "API keys" in left sidebar
   - Copy "Key 1" (keep this secure!)
   ```

2. **Get Endpoint URL**
   ```bash
   # Format: https://[resource-name].openai.azure.com/
   # Example: https://release-notes-openai.openai.azure.com/
   ```

3. **Note API Version**
   ```bash
   # Current stable version: 2024-06-01
   # Check latest at: https://docs.microsoft.com/en-us/azure/ai-services/openai/reference
   ```

### Step 4: Test Azure OpenAI Connection

**Quick Test Script** (`test-azure-openai.js`)
```javascript
const { OpenAIApi } = require('@azure/openai');

async function testAzureOpenAI() {
  const client = new OpenAIApi(
    'https://your-resource.openai.azure.com/', // Your endpoint
    'your-api-key', // Your API key
    '2024-06-01' // API version
  );

  try {
    const response = await client.getChatCompletions(
      'gpt-4o-mini', // Your deployment name
      {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Generate a test release note.' }
        ],
        max_tokens: 150,
        temperature: 0.7
      }
    );

    console.log('✅ Azure OpenAI connected successfully!');
    console.log('Response:', response.choices[0].message.content);
    console.log('Tokens used:', response.usage.total_tokens);
  } catch (error) {
    console.error('❌ Azure OpenAI connection failed:', error.message);
  }
}

testAzureOpenAI();
```

---

## Resend Email Setup

### Step 1: Create Resend Account

1. **Sign Up for Resend**
   - Go to [resend.com](https://resend.com)
   - Click "Get started for free"
   - Sign up with your email address

2. **Verify Your Account**
   - Check your email for verification link
   - Complete account verification

3. **Choose a Plan**
   ```bash
   Free Tier: 3,000 emails/month (perfect for development)
   Pro Plan: $20/month for 50,000 emails
   Business Plan: Custom pricing for higher volumes
   ```

### Step 2: Domain Setup (Recommended)

1. **Add Your Domain**
   ```bash
   # In Resend Dashboard
   - Go to "Domains" section
   - Click "Add Domain"
   - Enter your domain (e.g., yourdomain.com)
   ```

2. **Configure DNS Records**
   ```bash
   # Add these DNS records to your domain provider:
   
   # SPF Record (TXT)
   Name: @
   Value: v=spf1 include:spf.resend.com ~all
   
   # DKIM Record (TXT) 
   Name: resend._domainkey
   Value: [Provided by Resend - unique for your domain]
   
   # DMARC Record (TXT)
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

3. **Verify Domain**
   - Wait for DNS propagation (can take up to 48 hours)
   - Click "Verify" in Resend dashboard
   - Status should change to "Verified"

### Step 3: Get API Key

1. **Create API Key**
   ```bash
   # In Resend Dashboard
   - Go to "API Keys" section
   - Click "Create API Key"
   - Name: Release Notes Generator
   - Permission: Full access (or Send access for production)
   - Click "Create"
   ```

2. **Copy API Key**
   - Copy the API key (starts with `re_`)
   - Store securely - you won't see it again!

### Step 4: Test Resend Integration

**Quick Test Script** (`test-resend.js`)
```javascript
const { Resend } = require('resend');

async function testResend() {
  const resend = new Resend('your-api-key-here');

  try {
    const result = await resend.emails.send({
      from: 'noreply@yourdomain.com', // Use your verified domain
      to: 'test@example.com',
      subject: 'Test Email from Release Notes Generator',
      html: `
        <h1>Test Successful! 🎉</h1>
        <p>Your Resend integration is working correctly.</p>
        <p>You can now send professional release note emails!</p>
      `,
      text: 'Test Successful! Your Resend integration is working correctly.'
    });

    console.log('✅ Resend email sent successfully!');
    console.log('Email ID:', result.data.id);
  } catch (error) {
    console.error('❌ Resend email failed:', error.message);
  }
}

testResend();
```

---

## Environment Configuration

### Step 1: Environment Variables Setup

**Create/Update `.env` file:**
```bash
# ======================================
# AZURE OPENAI CONFIGURATION
# ======================================
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-06-01

# ======================================
# RESEND EMAIL CONFIGURATION
# ======================================
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
EMAIL_FROM=noreply@yourdomain.com

# ======================================
# DATABASE CONFIGURATION (Supabase)
# ======================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ======================================
# APPLICATION CONFIGURATION
# ======================================
NODE_ENV=development
SERVER_HOST=http://localhost:3001
CLIENT_HOST=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ======================================
# SECURITY
# ======================================
JWT_SECRET=your_super_secure_jwt_secret_key_here
SESSION_SECRET=your_super_secure_session_secret_here
BCRYPT_ROUNDS=12

# ======================================
# OPTIONAL: THIRD-PARTY INTEGRATIONS
# ======================================
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret
LINEAR_CLIENT_ID=your_linear_client_id
LINEAR_CLIENT_SECRET=your_linear_client_secret
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
```

### Step 2: Production Environment Setup

**For production, also add:**
```bash
# ======================================
# PRODUCTION OVERRIDES
# ======================================
NODE_ENV=production
SERVER_HOST=https://api.yourdomain.com
CLIENT_HOST=https://yourdomain.com
COOKIE_DOMAIN=.yourdomain.com

# ======================================
# MONITORING & LOGGING
# ======================================
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_for_error_tracking

# ======================================
# RATE LIMITING
# ======================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Install Dependencies

```bash
# Core AI and Email dependencies
npm install @azure/openai resend

# Additional dependencies for full functionality
npm install dotenv
npm install nodemailer # backup email service
npm install jsonwebtoken # for secure tokens
npm install bcryptjs # for password hashing

# Development dependencies
npm install --save-dev @types/jsonwebtoken
```

---

## Database Setup

### Option 1: Supabase Setup (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up/login and create new project
   - Choose a region close to your users

2. **Configure Database Schema**
   ```sql
   -- Create organizations table
   CREATE TABLE organizations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     domain TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     organization_id UUID REFERENCES organizations(id),
     email_verified BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create release_notes table
   CREATE TABLE release_notes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     slug TEXT NOT NULL,
     version TEXT,
     status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
     organization_id UUID REFERENCES organizations(id),
     author_id UUID REFERENCES users(id),
     published_at TIMESTAMP WITH TIME ZONE,
     scheduled_for TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(organization_id, slug)
   );

   -- Create notification_preferences table
   CREATE TABLE notification_preferences (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) UNIQUE,
     email_enabled BOOLEAN DEFAULT TRUE,
     release_notes BOOLEAN DEFAULT TRUE,
     major_releases BOOLEAN DEFAULT TRUE,
     minor_releases BOOLEAN DEFAULT FALSE,
     security_updates BOOLEAN DEFAULT TRUE,
     email_frequency TEXT DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'daily', 'weekly')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create indexes for performance
   CREATE INDEX idx_release_notes_organization ON release_notes(organization_id);
   CREATE INDEX idx_release_notes_status ON release_notes(status);
   CREATE INDEX idx_release_notes_published_at ON release_notes(published_at);
   CREATE INDEX idx_users_organization ON users(organization_id);
   ```

3. **Enable Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE release_notes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Organizations are viewable by members" ON organizations
     FOR SELECT USING (id IN (
       SELECT organization_id FROM users WHERE id = auth.uid()
     ));

   CREATE POLICY "Users can view their own data" ON users
     FOR SELECT USING (id = auth.uid() OR organization_id IN (
       SELECT organization_id FROM users WHERE id = auth.uid()
     ));

   CREATE POLICY "Release notes are viewable by organization members" ON release_notes
     FOR SELECT USING (organization_id IN (
       SELECT organization_id FROM users WHERE id = auth.uid()
     ));
   ```

### Option 2: PostgreSQL Setup

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   createdb release_notes_dev
   createdb release_notes_test
   createdb release_notes_prod
   ```

3. **Run Migrations**
   ```bash
   # If using Sequelize
   npx sequelize-cli db:migrate

   # If using custom SQL
   psql release_notes_dev < schema.sql
   ```

---

## Testing & Verification

### Step 1: Integration Test Script

**Create `test-integration.js`:**
```javascript
const { OpenAIApi } = require('@azure/openai');
const { Resend } = require('resend');
require('dotenv').config();

async function runIntegrationTests() {
  console.log('🧪 Running Release Notes Generator Integration Tests...\n');

  // Test 1: Azure OpenAI
  console.log('1️⃣ Testing Azure OpenAI connection...');
  try {
    const openai = new OpenAIApi(
      process.env.AZURE_OPENAI_ENDPOINT,
      process.env.AZURE_OPENAI_API_KEY,
      process.env.AZURE_OPENAI_API_VERSION
    );

    const response = await openai.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      {
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates release notes.' },
          { role: 'user', content: 'Generate a brief release note for a bug fix update.' }
        ],
        max_tokens: 150,
        temperature: 0.7
      }
    );

    console.log('✅ Azure OpenAI: Connected successfully');
    console.log(`   Generated content: ${response.choices[0].message.content.substring(0, 100)}...`);
    console.log(`   Tokens used: ${response.usage.total_tokens}`);
  } catch (error) {
    console.error('❌ Azure OpenAI: Connection failed');
    console.error(`   Error: ${error.message}`);
  }

  console.log('');

  // Test 2: Resend Email
  console.log('2️⃣ Testing Resend email service...');
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: 'test@example.com', // Change to your email for actual test
      subject: 'Release Notes Generator - Integration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7F56D9;">🎉 Integration Test Successful!</h1>
          <p>Your Release Notes Generator is properly configured with:</p>
          <ul>
            <li>✅ Azure OpenAI (GPT-4o-mini)</li>
            <li>✅ Resend Email Service</li>
          </ul>
          <p>You're ready to start generating and sending professional release notes!</p>
        </div>
      `,
      text: 'Integration Test Successful! Your Release Notes Generator is properly configured.'
    });

    console.log('✅ Resend: Email service working');
    console.log(`   Email ID: ${result.data?.id || 'Unknown'}`);
  } catch (error) {
    console.error('❌ Resend: Email service failed');
    console.error(`   Error: ${error.message}`);
  }

  console.log('');

  // Test 3: Environment Variables
  console.log('3️⃣ Checking environment variables...');
  const requiredVars = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_DEPLOYMENT_NAME',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length === 0) {
    console.log('✅ Environment: All required variables set');
  } else {
    console.error('❌ Environment: Missing required variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
  }

  console.log('\n🏁 Integration test completed!');
}

// Run the tests
runIntegrationTests().catch(console.error);
```

### Step 2: Run Tests

```bash
# Install test dependencies
npm install dotenv

# Run integration tests
node test-integration.js
```

### Step 3: Verify Application Startup

```bash
# Start development server
npm run dev

# Check endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ai/test
```

---

## Production Configuration

### Step 1: Environment Security

1. **Use Environment Variable Services**
   ```bash
   # Vercel
   vercel env add AZURE_OPENAI_API_KEY

   # Netlify
   netlify env:set AZURE_OPENAI_API_KEY your_key_here

   # Railway
   railway variables set AZURE_OPENAI_API_KEY=your_key_here

   # Heroku
   heroku config:set AZURE_OPENAI_API_KEY=your_key_here
   ```

2. **Secure Secrets Management**
   ```bash
   # Azure Key Vault (recommended for Azure deployments)
   # AWS Secrets Manager (for AWS deployments)
   # HashiCorp Vault (for self-hosted)
   ```

### Step 2: Production Optimizations

**AI Service Optimizations:**
```javascript
// Production AI configuration
const productionConfig = {
  azure: {
    openai: {
      // Use connection pooling
      maxConcurrentRequests: 10,
      requestTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      
      // Cost optimization
      defaultMaxTokens: 1000, // Reduced for cost control
      defaultTemperature: 0.5, // More deterministic
      
      // Monitoring
      enableMetrics: true,
      logRequests: true
    }
  }
};
```

**Email Service Optimizations:**
```javascript
// Production email configuration
const emailConfig = {
  resend: {
    // Rate limiting
    maxEmailsPerMinute: 100,
    maxEmailsPerHour: 1000,
    
    // Batch processing
    batchSize: 50,
    batchDelay: 1000,
    
    // Monitoring
    enableDeliveryTracking: true,
    enableBounceHandling: true
  }
};
```

### Step 3: Monitoring & Alerting

**Health Check Endpoint:**
```javascript
// /api/health
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      azure_openai: await checkAzureOpenAI(),
      resend: await checkResend(),
      database: await checkDatabase()
    }
  };

  const allHealthy = Object.values(health.services)
    .every(service => service.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json(health);
});
```

**Metrics Collection:**
```javascript
// Cost and usage tracking
const metrics = {
  ai: {
    requestsCount: 0,
    tokensUsed: 0,
    costTotal: 0.0,
    averageResponseTime: 0
  },
  email: {
    emailsSent: 0,
    deliveryRate: 0.98,
    bounceRate: 0.02
  }
};
```

---

## Troubleshooting

### Common Azure OpenAI Issues

**Issue 1: 401 Unauthorized**
```bash
# Check:
- API key is correct and not expired
- Endpoint URL is correct
- API version is supported
- Resource is not paused or deleted

# Solution:
- Regenerate API key in Azure portal
- Verify endpoint format: https://[resource-name].openai.azure.com/
```

**Issue 2: 429 Rate Limit Exceeded**
```bash
# Symptoms:
- "Rate limit exceeded" errors
- Requests timing out

# Solutions:
- Increase TPM (Tokens Per Minute) limit in Azure
- Implement request queuing
- Add exponential backoff retry logic
```

**Issue 3: Model Not Found**
```bash
# Check:
- Deployment name matches exactly
- Model is successfully deployed
- Deployment is not stopped

# Solution:
- Verify deployment in Azure OpenAI Studio
- Redeploy model if necessary
```

### Common Resend Issues

**Issue 1: Domain Not Verified**
```bash
# Symptoms:
- Emails not sending
- "Domain not verified" errors

# Solutions:
- Check DNS records are correctly set
- Wait for DNS propagation (up to 48 hours)
- Use resend.dev domain for testing
```

**Issue 2: High Bounce Rate**
```bash
# Causes:
- Invalid email addresses
- Poor sender reputation
- Missing SPF/DKIM records

# Solutions:
- Validate email addresses before sending
- Use double opt-in for subscriptions
- Monitor delivery analytics in Resend dashboard
```

### Environment Variable Issues

**Issue: Variables Not Loading**
```bash
# Check:
1. .env file is in correct location
2. Variables are properly formatted (no spaces around =)
3. .env file is not in .gitignore for production
4. Process restart after changes

# Debug:
console.log('Loaded vars:', {
  hasAzureKey: !!process.env.AZURE_OPENAI_API_KEY,
  hasResendKey: !!process.env.RESEND_API_KEY,
  nodeEnv: process.env.NODE_ENV
});
```

### Network and Connectivity

**Issue: Timeout Errors**
```bash
# For Azure OpenAI:
- Check firewall settings
- Verify network connectivity
- Increase timeout values

# For Resend:
- Check outbound internet access
- Verify API endpoint accessibility
```

### Performance Issues

**Issue: Slow AI Responses**
```bash
# Optimization strategies:
1. Reduce max_tokens for faster responses
2. Use lower temperature for more focused outputs
3. Implement request caching
4. Use streaming for long responses
5. Consider using GPT-3.5-turbo for faster responses
```

### Cost Management

**Issue: Unexpected High Costs**
```bash
# Monitoring:
1. Track token usage per request
2. Set up billing alerts in Azure
3. Implement cost caps
4. Monitor usage patterns

# Optimization:
1. Optimize prompts to be more concise
2. Set appropriate max_tokens limits
3. Use caching for similar requests
4. Implement user quotas
```

---

## Next Steps

After completing this setup:

1. **Test the Integration**
   - Run the integration test script
   - Send test emails
   - Generate test release notes

2. **Deploy to Production**
   - Set up production environment variables
   - Configure monitoring and alerting
   - Set up proper DNS for email domain

3. **Monitor Performance**
   - Track AI usage and costs
   - Monitor email delivery rates
   - Set up health checks

4. **Optimize for Scale**
   - Implement caching strategies
   - Set up rate limiting
   - Configure auto-scaling

Your Release Notes Generator is now ready to create professional, AI-powered release notes with reliable email delivery! 🚀