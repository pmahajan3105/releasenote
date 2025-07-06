export interface BrandVoice {
  id: string
  name: string
  description: string
  organization_id: string
  
  // Voice characteristics
  tone: 'professional' | 'casual' | 'technical' | 'enthusiastic' | 'formal' | 'friendly'
  personality: string[] // e.g., ['innovative', 'reliable', 'cutting-edge']
  vocabulary: {
    preferred: string[] // Words to use more often
    avoided: string[] // Words to avoid
    replacements: Record<string, string> // Word replacements
  }
  
  // Writing style
  sentenceLength: 'short' | 'medium' | 'long' | 'varied'
  paragraphStyle: 'concise' | 'detailed' | 'balanced'
  useEmojis: boolean
  useMetrics: boolean // Include numbers and percentages
  
  // Content structure preferences
  headerStyle: 'traditional' | 'creative' | 'minimal'
  bulletPointStyle: 'simple' | 'detailed' | 'action-oriented'
  
  // Brand-specific guidelines
  brandGuidelines: string
  exampleContent: string
  
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface CustomPrompt {
  id: string
  name: string
  description: string
  organization_id: string
  
  // Prompt configuration
  systemPrompt: string
  userPromptTemplate: string
  category: 'feature' | 'bugfix' | 'improvement' | 'security' | 'general'
  
  // Template variables that can be used
  variables: {
    name: string
    description: string
    required: boolean
    defaultValue?: string
    type: 'string' | 'number' | 'boolean' | 'array'
  }[]
  
  // AI behavior settings
  temperature: number // 0-1, creativity level
  maxTokens: number
  targetAudience: 'developers' | 'business' | 'users' | 'mixed'
  
  // Brand voice integration
  brandVoiceId?: string
  
  
  created_at: string
  updated_at: string
  is_active: boolean
  created_by: string
}

export interface PromptVariable {
  name: string
  value: string | number | boolean | string[]
}

export interface GenerationContext {
  organizationId: string
  brandVoice?: BrandVoice
  customPrompt?: CustomPrompt
  variables?: PromptVariable[]
  userPreferences?: {
    includeMetrics?: boolean
    includeEmojis?: boolean
    targetLength?: 'short' | 'medium' | 'long'
  }
}

export class CustomPromptEngine {
  private static instance: CustomPromptEngine
  
  public static getInstance(): CustomPromptEngine {
    if (!CustomPromptEngine.instance) {
      CustomPromptEngine.instance = new CustomPromptEngine()
    }
    return CustomPromptEngine.instance
  }

  // Brand voice utilities
  generateBrandVoicePrompt(brandVoice: BrandVoice): string {
    let prompt = `You are writing release notes that embody the following brand voice:\n\n`
    
    prompt += `**Tone**: ${brandVoice.tone}\n`
    prompt += `**Personality**: ${brandVoice.personality.join(', ')}\n\n`
    
    if (brandVoice.vocabulary.preferred.length > 0) {
      prompt += `**Preferred vocabulary**: Use words like: ${brandVoice.vocabulary.preferred.join(', ')}\n`
    }
    
    if (brandVoice.vocabulary.avoided.length > 0) {
      prompt += `**Avoid these words**: ${brandVoice.vocabulary.avoided.join(', ')}\n`
    }
    
    if (Object.keys(brandVoice.vocabulary.replacements).length > 0) {
      prompt += `**Word replacements**: ${Object.entries(brandVoice.vocabulary.replacements)
        .map(([from, to]) => `"${from}" → "${to}"`)
        .join(', ')}\n`
    }
    
    prompt += `\n**Writing style**:\n`
    prompt += `- Sentence length: ${brandVoice.sentenceLength}\n`
    prompt += `- Paragraph style: ${brandVoice.paragraphStyle}\n`
    prompt += `- Use emojis: ${brandVoice.useEmojis ? 'Yes' : 'No'}\n`
    prompt += `- Include metrics: ${brandVoice.useMetrics ? 'Yes' : 'No'}\n`
    
    prompt += `\n**Structure preferences**:\n`
    prompt += `- Header style: ${brandVoice.headerStyle}\n`
    prompt += `- Bullet points: ${brandVoice.bulletPointStyle}\n`
    
    if (brandVoice.brandGuidelines) {
      prompt += `\n**Brand guidelines**:\n${brandVoice.brandGuidelines}\n`
    }
    
    if (brandVoice.exampleContent) {
      prompt += `\n**Example of our voice**:\n${brandVoice.exampleContent}\n`
    }
    
    prompt += `\nWrite release notes that perfectly match this brand voice and style.`
    
    return prompt
  }

  // Custom prompt processing
  processCustomPrompt(customPrompt: CustomPrompt, variables: PromptVariable[] = []): {
    systemPrompt: string
    userPrompt: string
  } {
    let systemPrompt = customPrompt.systemPrompt
    let userPrompt = customPrompt.userPromptTemplate
    
    // Replace variables in both prompts
    for (const variable of variables) {
      const placeholder = `{${variable.name}}`
      const value = String(variable.value)
      
      systemPrompt = systemPrompt.replace(new RegExp(placeholder, 'g'), value)
      userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), value)
    }
    
    // Add default values for missing required variables
    for (const varDef of customPrompt.variables) {
      if (varDef.required && varDef.defaultValue) {
        const placeholder = `{${varDef.name}}`
        const hasValue = variables.some(v => v.name === varDef.name)
        
        if (!hasValue) {
          const defaultValue = String(varDef.defaultValue)
          systemPrompt = systemPrompt.replace(new RegExp(placeholder, 'g'), defaultValue)
          userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), defaultValue)
        }
      }
    }
    
    return { systemPrompt, userPrompt }
  }

  // Generate comprehensive prompt with brand voice + custom prompt
  generateEnhancedPrompt(context: GenerationContext, content: string): {
    systemPrompt: string
    userPrompt: string
    metadata: {
      temperature: number
      maxTokens: number
      targetAudience: string
    }
  } {
    let systemPrompt = ''
    let userPrompt = content
    let temperature = 0.7
    let maxTokens = 2000
    let targetAudience = 'mixed'

    // Add brand voice if available
    if (context.brandVoice) {
      systemPrompt += this.generateBrandVoicePrompt(context.brandVoice) + '\n\n'
    }

    // Add custom prompt if available
    if (context.customPrompt) {
      const processed = this.processCustomPrompt(context.customPrompt, context.variables)
      systemPrompt += processed.systemPrompt
      userPrompt = processed.userPrompt
      
      temperature = context.customPrompt.temperature
      maxTokens = context.customPrompt.maxTokens
      targetAudience = context.customPrompt.targetAudience
    }

    // Add user preferences
    if (context.userPreferences) {
      let preferencesPrompt = '\n**Additional preferences**:\n'
      
      if (context.userPreferences.includeMetrics !== undefined) {
        preferencesPrompt += `- Include metrics and numbers: ${context.userPreferences.includeMetrics ? 'Yes' : 'No'}\n`
      }
      
      if (context.userPreferences.includeEmojis !== undefined) {
        preferencesPrompt += `- Use emojis: ${context.userPreferences.includeEmojis ? 'Yes' : 'No'}\n`
      }
      
      if (context.userPreferences.targetLength) {
        preferencesPrompt += `- Target length: ${context.userPreferences.targetLength}\n`
      }
      
      systemPrompt += preferencesPrompt
    }

    // Fallback system prompt if none provided
    if (!systemPrompt.trim()) {
      systemPrompt = 'You are an expert at writing professional release notes. Create clear, engaging, and informative release notes based on the provided information.'
    }

    return {
      systemPrompt: systemPrompt.trim(),
      userPrompt: userPrompt.trim(),
      metadata: {
        temperature,
        maxTokens,
        targetAudience
      }
    }
  }

  // Validation utilities
  validateBrandVoice(brandVoice: Partial<BrandVoice>): string[] {
    const errors: string[] = []
    
    if (!brandVoice.name?.trim()) {
      errors.push('Brand voice name is required')
    }
    
    if (!brandVoice.tone) {
      errors.push('Tone is required')
    }
    
    if (!brandVoice.personality || brandVoice.personality.length === 0) {
      errors.push('At least one personality trait is required')
    }
    
    return errors
  }

  validateCustomPrompt(customPrompt: Partial<CustomPrompt>): string[] {
    const errors: string[] = []
    
    if (!customPrompt.name?.trim()) {
      errors.push('Prompt name is required')
    }
    
    if (!customPrompt.systemPrompt?.trim()) {
      errors.push('System prompt is required')
    }
    
    if (!customPrompt.userPromptTemplate?.trim()) {
      errors.push('User prompt template is required')
    }
    
    if (customPrompt.temperature !== undefined && (customPrompt.temperature < 0 || customPrompt.temperature > 1)) {
      errors.push('Temperature must be between 0 and 1')
    }
    
    if (customPrompt.maxTokens !== undefined && (customPrompt.maxTokens < 100 || customPrompt.maxTokens > 8000)) {
      errors.push('Max tokens must be between 100 and 8000')
    }
    
    return errors
  }
}

// Default brand voices for inspiration
export const DEFAULT_BRAND_VOICES: Partial<BrandVoice>[] = [
  {
    name: 'Professional & Authoritative',
    description: 'Clear, confident, and business-focused communication',
    tone: 'professional',
    personality: ['reliable', 'expert', 'trustworthy'],
    vocabulary: {
      preferred: ['enhanced', 'optimized', 'streamlined', 'robust', 'comprehensive'],
      avoided: ['awesome', 'cool', 'super', 'amazing'],
      replacements: { 'fixed': 'resolved', 'made': 'implemented' }
    },
    sentenceLength: 'medium',
    paragraphStyle: 'balanced',
    useEmojis: false,
    useMetrics: true,
    headerStyle: 'traditional',
    bulletPointStyle: 'detailed'
  },
  {
    name: 'Friendly & Approachable',
    description: 'Warm, conversational, and user-friendly tone',
    tone: 'friendly',
    personality: ['helpful', 'approachable', 'supportive'],
    vocabulary: {
      preferred: ['improved', 'better', 'easier', 'smoother', 'helpful'],
      avoided: ['deprecated', 'terminated', 'eliminated'],
      replacements: { 'users': 'you', 'implemented': 'added' }
    },
    sentenceLength: 'short',
    paragraphStyle: 'concise',
    useEmojis: true,
    useMetrics: false,
    headerStyle: 'creative',
    bulletPointStyle: 'simple'
  },
  {
    name: 'Technical & Precise',
    description: 'Detailed, accurate, and developer-focused communication',
    tone: 'technical',
    personality: ['precise', 'thorough', 'analytical'],
    vocabulary: {
      preferred: ['implemented', 'refactored', 'optimized', 'deprecated', 'migrated'],
      avoided: ['awesome', 'great', 'nice', 'cool'],
      replacements: { 'changed': 'modified', 'better': 'optimized' }
    },
    sentenceLength: 'varied',
    paragraphStyle: 'detailed',
    useEmojis: false,
    useMetrics: true,
    headerStyle: 'minimal',
    bulletPointStyle: 'detailed'
  }
]

// Default custom prompts for different scenarios
export const DEFAULT_CUSTOM_PROMPTS: Partial<CustomPrompt>[] = [
  {
    name: 'Feature Release',
    description: 'Template for announcing new features',
    category: 'feature',
    systemPrompt: 'You are writing release notes for a new feature launch. Focus on user benefits, how to use the feature, and what problems it solves.',
    userPromptTemplate: `Write release notes for our new feature: {featureName}

**Feature details**: {featureDescription}
**Target users**: {targetUsers}
**Key benefits**: {keyBenefits}

Include:
- Clear explanation of what the feature does
- How users can access/use it
- Benefits and value proposition
- Any prerequisites or setup required`,
    temperature: 0.6,
    maxTokens: 1500,
    targetAudience: 'users',
    variables: [
      { name: 'featureName', description: 'Name of the new feature', required: true, type: 'string' },
      { name: 'featureDescription', description: 'Detailed description', required: true, type: 'string' },
      { name: 'targetUsers', description: 'Who will use this feature', required: false, defaultValue: 'all users', type: 'string' },
      { name: 'keyBenefits', description: 'Main benefits', required: true, type: 'string' }
    ]
  },
  {
    name: 'Bug Fix Release',
    description: 'Template for bug fix announcements',
    category: 'bugfix',
    systemPrompt: 'You are writing release notes for bug fixes. Be clear about what was broken, what\'s now fixed, and any actions users might need to take.',
    userPromptTemplate: `Write release notes for bug fixes in version {version}

**Issues resolved**: {issuesFixed}
**Impact**: {userImpact}
**Actions required**: {userActions}

Format:
- Brief summary of fixes
- Individual issue descriptions
- Any user actions needed
- Appreciation for bug reports`,
    temperature: 0.4,
    maxTokens: 1200,
    targetAudience: 'mixed',
    variables: [
      { name: 'version', description: 'Version number', required: true, type: 'string' },
      { name: 'issuesFixed', description: 'List of fixed issues', required: true, type: 'string' },
      { name: 'userImpact', description: 'How fixes affect users', required: true, type: 'string' },
      { name: 'userActions', description: 'Actions users need to take', required: false, defaultValue: 'None required', type: 'string' }
    ]
  },
  {
    name: 'Security Update',
    description: 'Template for security-related releases',
    category: 'security',
    systemPrompt: 'You are writing release notes for security updates. Be clear about the importance while avoiding technical details that could be exploited.',
    userPromptTemplate: `Write release notes for security update {version}

**Security improvements**: {securityUpdates}
**Severity**: {severity}
**Action required**: {actionRequired}

Include:
- Importance of updating
- General description of security improvements
- Clear update instructions
- Reassurance about user data protection`,
    temperature: 0.3,
    maxTokens: 1000,
    targetAudience: 'mixed',
    variables: [
      { name: 'version', description: 'Version number', required: true, type: 'string' },
      { name: 'securityUpdates', description: 'Description of security improvements', required: true, type: 'string' },
      { name: 'severity', description: 'Security update severity', required: true, type: 'string' },
      { name: 'actionRequired', description: 'What users must do', required: true, type: 'string' }
    ]
  }
]

export const customPromptEngine = CustomPromptEngine.getInstance()