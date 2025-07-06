/**
 * Test script to verify Azure OpenAI integration
 * Run with: node scripts/test-azure-openai.js
 */

require('dotenv').config();

const { OpenAIApi } = require('@azure/openai');

async function testAzureOpenAI() {
  try {
    console.log('🧪 Testing Azure OpenAI Integration...');
    
    // Check environment variables
    const requiredEnvVars = [
      'AZURE_OPENAI_API_KEY',
      'AZURE_OPENAI_ENDPOINT',
      'AZURE_OPENAI_DEPLOYMENT_NAME'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
    
    console.log('✅ Environment variables configured');
    
    // Initialize client
    const client = new OpenAIApi(process.env.AZURE_OPENAI_ENDPOINT, {
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-06-01'
    });
    
    console.log('✅ Azure OpenAI client initialized');
    
    // Test generation
    const testCommits = [
      {
        message: 'Add user authentication with JWT tokens',
        sha: 'abc123',
        type: 'feature'
      },
      {
        message: 'Fix bug in password reset functionality',
        sha: 'def456', 
        type: 'bugfix'
      },
      {
        message: 'Improve database query performance',
        sha: 'ghi789',
        type: 'improvement'
      }
    ];
    
    const messages = [
      {
        role: 'system',
        content: 'You are an expert at writing professional release notes. Generate clean, well-formatted release notes based on the provided commits.'
      },
      {
        role: 'user',
        content: `Generate release notes for these commits:\n\n${testCommits.map(c => `- ${c.message} (${c.sha})`).join('\n')}\n\nFormat as professional HTML with clear sections.`
      }
    ];
    
    console.log('🔄 Generating test release notes...');
    
    const result = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      {
        messages,
        maxTokens: 1000,
        temperature: 0.7
      }
    );
    
    const generatedContent = result.choices[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error('No content generated from Azure OpenAI');
    }
    
    console.log('✅ Azure OpenAI generation successful!');
    console.log('\n📄 Generated Release Notes:');
    console.log('=' .repeat(50));
    console.log(generatedContent);
    console.log('=' .repeat(50));
    
    // Test usage info
    if (result.usage) {
      console.log('\n📊 Usage Statistics:');
      console.log(`- Prompt tokens: ${result.usage.promptTokens}`);
      console.log(`- Completion tokens: ${result.usage.completionTokens}`);
      console.log(`- Total tokens: ${result.usage.totalTokens}`);
    }
    
    console.log('\n🎉 Azure OpenAI integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Azure OpenAI test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAzureOpenAI();