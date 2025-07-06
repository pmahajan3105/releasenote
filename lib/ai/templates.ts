export interface AITemplate {
  id: string
  name: string
  description: string
  category: 'traditional' | 'modern' | 'technical' | 'marketing' | 'changelog' | 'minimal'
  icon: string
  systemPrompt: string
  userPromptTemplate: string
  outputFormat: 'markdown' | 'html'
  tone: 'professional' | 'casual' | 'technical' | 'enthusiastic' | 'formal'
  targetAudience: 'developers' | 'business' | 'users' | 'mixed'
  exampleOutput?: string
}

export const AI_TEMPLATES: AITemplate[] = [
  {
    id: 'traditional',
    name: 'Traditional Release Notes',
    description: 'Classic, professional format focused on clear feature descriptions and bug fixes',
    category: 'traditional',
    icon: '📋',
    tone: 'professional',
    targetAudience: 'mixed',
    outputFormat: 'markdown',
    systemPrompt: `You are an expert technical writer creating traditional release notes. Your writing should be:
- Clear and professional
- Well-structured with proper headings
- Feature-focused with business value explanations
- Include technical details when relevant
- Use standard release notes conventions`,
    userPromptTemplate: `Create traditional release notes for version {version} based on these changes:

{changes}

Format with these sections:
## 🚀 New Features
## 🔧 Improvements  
## 🐛 Bug Fixes
## ⚠️ Breaking Changes (if any)
## 📝 Technical Notes (if any)

Each item should include:
- Clear description of the change
- Business value or user benefit
- Technical details when relevant`,
    exampleOutput: `## 🚀 New Features

### Dashboard Analytics
Added comprehensive analytics dashboard showing user engagement metrics and release note performance. This helps teams understand which updates resonate most with their audience.

### Automated Email Notifications
Release notes are now automatically sent to subscribers when published, improving communication and user engagement.

## 🔧 Improvements

### Enhanced Mobile Experience
Improved responsive design and touch interactions for better mobile usability.

### Faster Page Load Times
Optimized assets and implemented caching, reducing initial page load by 40%.`
  },

  {
    id: 'modern',
    name: 'Modern & Visual',
    description: 'Contemporary style with emojis, visual elements, and engaging language',
    category: 'modern',
    icon: '✨',
    tone: 'enthusiastic',
    targetAudience: 'users',
    outputFormat: 'markdown',
    systemPrompt: `You are creating modern, engaging release notes with a fresh, contemporary style. Your writing should be:
- Energetic and engaging with emojis
- User-focused with clear benefits
- Visually appealing with good formatting
- Conversational but professional
- Include excitement about improvements`,
    userPromptTemplate: `Create modern, engaging release notes for version {version} with these updates:

{changes}

Style guidelines:
- Use emojis strategically for visual appeal
- Write in an enthusiastic but professional tone
- Focus on user benefits and excitement
- Include visual breaks and formatting
- Make it scannable and engaging`,
    exampleOutput: `# ✨ What's New in v2.1.0

We're excited to share some amazing updates that will make your experience even better! 🎉

## 🎯 New Features

**📊 Analytics Dashboard**
Get insights into how your release notes are performing! See which updates your users love most and track engagement over time.

**📧 Smart Email Notifications** 
Your subscribers will now automatically receive beautifully formatted emails when you publish new releases. No more manual sending! 

## 🚀 Improvements

**📱 Mobile Experience** → Now 2x better on mobile devices
**⚡ Performance** → Pages load 40% faster 
**🎨 Design** → Cleaner, more modern interface

Keep the feedback coming – we love hearing from you! 💙`
  },

  {
    id: 'technical',
    name: 'Developer-Focused',
    description: 'Detailed technical information for developers and technical teams',
    category: 'technical',
    icon: '⚙️',
    tone: 'technical',
    targetAudience: 'developers',
    outputFormat: 'markdown',
    systemPrompt: `You are writing technical release notes for developers and technical teams. Your content should be:
- Technically precise and detailed
- Include implementation details and breaking changes
- Reference APIs, dependencies, and technical specifications
- Use proper technical terminology
- Include migration guidance when needed`,
    userPromptTemplate: `Generate technical release notes for version {version} covering these changes:

{changes}

Include technical details such as:
- API changes and new endpoints
- Breaking changes with migration paths
- Performance improvements with metrics
- Dependency updates
- Configuration changes
- Security patches

Format for technical audience with appropriate detail level.`,
    exampleOutput: `# Release Notes v2.1.0

## API Changes

### New Endpoints
- \`GET /api/v2/analytics\` - Returns release note performance metrics
- \`POST /api/v2/notifications/subscribe\` - Batch subscribe users to release notifications

### Breaking Changes
- \`GET /api/v1/releases\` response format changed:
  - \`publishedAt\` field renamed to \`published_at\` 
  - \`authorId\` field renamed to \`author_id\`
  - Migration: Update client code to use new field names

## Performance Improvements
- Database query optimization: 60% reduction in average response time
- Asset bundling: 40% reduction in bundle size (285KB → 171KB)
- Implemented Redis caching for frequently accessed release notes

## Security Updates
- Updated dependencies with security patches:
  - \`express\` 4.18.1 → 4.18.2 (fixes CVE-2022-24999)
  - \`jsonwebtoken\` 8.5.1 → 9.0.0 (fixes timing attack vulnerability)

## Migration Guide
1. Update API client field mappings
2. Test authentication flows (JWT implementation updated)
3. Clear Redis cache after deployment`
  },

  {
    id: 'marketing',
    name: 'Marketing-Focused',
    description: 'Benefit-driven content highlighting business value and user impact',
    category: 'marketing',
    icon: '🎯',
    tone: 'enthusiastic',
    targetAudience: 'business',
    outputFormat: 'markdown',
    systemPrompt: `You are creating marketing-focused release notes that highlight business value and user benefits. Your content should:
- Focus on user benefits and business value
- Use persuasive, benefit-driven language
- Include metrics and results when possible
- Appeal to business stakeholders
- Emphasize ROI and competitive advantages`,
    userPromptTemplate: `Create marketing-focused release notes for version {version} featuring these updates:

{changes}

Emphasize:
- Business value and ROI
- User benefits and improved experience
- Competitive advantages
- Metrics and improvements
- Customer success stories when relevant

Write for business stakeholders and decision-makers.`,
    exampleOutput: `# Driving Better Results with v2.1.0 🚀

Transform how you connect with your users and measure your success with these powerful new capabilities.

## 📈 Boost Engagement by 3x

**New Analytics Dashboard**
Finally understand what resonates with your audience. Our new analytics show which release notes drive the most engagement, helping you craft more effective communications and improve user adoption.

**Automated Email Campaigns** 
Stop losing potential engagement. Automatically notify your entire user base when you ship new features, increasing awareness by an average of 250% according to our beta customers.

## 💼 Business Impact

- **40% faster page loads** = Better user experience and higher conversion
- **Streamlined mobile experience** = Reach 60% more users effectively  
- **Professional email notifications** = Improved brand perception and user retention

## ROI Highlights
Early adopters report:
- 3x increase in feature adoption rates
- 50% reduction in support tickets about new features
- 25% improvement in user satisfaction scores

*Ready to see similar results? These features are available now for all plans.*`
  },

  {
    id: 'changelog',
    name: 'Structured Changelog',
    description: 'Standardized changelog format following semantic versioning conventions',
    category: 'changelog',
    icon: '📝',
    tone: 'formal',
    targetAudience: 'developers',
    outputFormat: 'markdown',
    systemPrompt: `You are creating a structured changelog following standard conventions. Your format should:
- Follow semantic versioning principles
- Use standardized categories (Added, Changed, Deprecated, Removed, Fixed, Security)
- Be concise but informative
- Include version numbers and dates
- Follow Keep a Changelog format`,
    userPromptTemplate: `Generate a structured changelog entry for version {version} released on {date} with these changes:

{changes}

Use standard changelog categories:
- Added: New features
- Changed: Changes in existing functionality  
- Deprecated: Features that will be removed
- Removed: Features removed in this release
- Fixed: Bug fixes
- Security: Security improvements

Keep entries concise but informative.`,
    exampleOutput: `# Changelog

## [2.1.0] - 2024-01-15

### Added
- Analytics dashboard for tracking release note performance
- Automated email notification system for subscribers
- Mobile-responsive design improvements
- Redis caching for improved performance

### Changed
- API response format for /api/v1/releases endpoint
- Updated authentication flow with enhanced security
- Improved error handling throughout application

### Fixed
- Mobile navigation menu not closing on link click
- Email template rendering issues in Outlook
- Performance issue with large release note lists
- Cache invalidation bug affecting real-time updates

### Security
- Updated dependencies to address security vulnerabilities
- Enhanced JWT token validation
- Added rate limiting to API endpoints`
  },

  {
    id: 'minimal',
    name: 'Minimal & Clean',
    description: 'Simple, concise format with essential information only',
    category: 'minimal',
    icon: '⚡',
    tone: 'casual',
    targetAudience: 'mixed',
    outputFormat: 'markdown',
    systemPrompt: `You are creating minimal, clean release notes. Your content should be:
- Extremely concise and to the point
- Easy to scan quickly
- Focus on the most important changes only
- Use simple, clear language
- Minimal formatting but well-organized`,
    userPromptTemplate: `Create minimal, clean release notes for version {version} with these changes:

{changes}

Guidelines:
- Keep descriptions brief and essential
- Focus on user-facing changes
- Use simple formatting
- Group similar changes
- Omit technical details unless critical`,
    exampleOutput: `# v2.1.0

**New**
- Analytics dashboard
- Email notifications
- Better mobile experience

**Improved** 
- 40% faster loading
- Cleaner interface
- More reliable notifications

**Fixed**
- Mobile menu issues
- Email formatting problems
- Performance with large lists

[View full details →](link-to-detailed-notes)`
  }
]

export function getTemplateById(id: string): AITemplate | undefined {
  return AI_TEMPLATES.find(template => template.id === id)
}

export function getTemplatesByCategory(category: AITemplate['category']): AITemplate[] {
  return AI_TEMPLATES.filter(template => template.category === category)
}

export function getTemplatesByAudience(audience: AITemplate['targetAudience']): AITemplate[] {
  return AI_TEMPLATES.filter(template => template.targetAudience === audience)
}

export function formatPrompt(template: AITemplate, variables: Record<string, string>): string {
  let prompt = template.userPromptTemplate
  
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  
  return prompt
}