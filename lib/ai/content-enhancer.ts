export interface ContentSuggestion {
  id: string
  type: 'clarity' | 'tone' | 'engagement' | 'structure' | 'grammar'
  title: string
  description: string
  originalText: string
  suggestedText: string
  confidence: number // 0-1
  reasoning: string
}

export interface ContentAnalysis {
  readabilityScore: number // 0-100 (Flesch reading ease)
  toneAnalysis: {
    detected: 'professional' | 'casual' | 'technical' | 'enthusiastic' | 'formal'
    confidence: number
    suggestions: string[]
  }
  engagementScore: number // 0-100
  structureScore: number // 0-100
  suggestions: ContentSuggestion[]
  wordCount: number
  estimatedReadingTime: number // minutes
}

export interface ContentImprovementOptions {
  targetTone?: 'professional' | 'casual' | 'technical' | 'enthusiastic' | 'formal'
  targetAudience?: 'developers' | 'business' | 'users' | 'mixed'
  improvementTypes?: ('clarity' | 'tone' | 'engagement' | 'structure' | 'grammar')[]
  maxSuggestions?: number
}

export class ContentEnhancer {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Analyze content readability using simplified Flesch Reading Ease
  private calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const words = text.split(/\s+/).filter(w => w.length > 0).length
    const syllables = this.countSyllables(text)

    if (sentences === 0 || words === 0) return 0

    const avgSentenceLength = words / sentences
    const avgSyllablesPerWord = syllables / words

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
    
    return Math.max(0, Math.min(100, score))
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/)
    let totalSyllables = 0

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '')
      if (cleanWord.length === 0) continue

      // Simple syllable counting heuristic
      const vowelGroups = cleanWord.match(/[aeiouy]+/g) || []
      let syllables = vowelGroups.length

      // Adjust for silent 'e'
      if (cleanWord.endsWith('e') && syllables > 1) {
        syllables--
      }

      totalSyllables += Math.max(1, syllables)
    }

    return totalSyllables
  }

  // Detect tone based on word patterns and structure
  private detectTone(text: string): { detected: ContentAnalysis['toneAnalysis']['detected'], confidence: number } {
    const lowerText = text.toLowerCase()
    
    const patterns = {
      professional: [
        /\b(furthermore|therefore|however|consequently|moreover)\b/g,
        /\b(implementation|functionality|enhancement|optimization)\b/g,
        /\b(we are pleased to|we have improved|this update includes)\b/g
      ],
      casual: [
        /\b(hey|awesome|cool|amazing|super|great news)\b/g,
        /[!]{2,}|[?]{2,}/g,
        /\b(you'll love|check out|excited to)\b/g
      ],
      technical: [
        /\b(api|database|algorithm|architecture|configuration)\b/g,
        /\b(deprecated|refactored|optimized|implemented|migrated)\b/g,
        /`[^`]+`/g // code snippets
      ],
      enthusiastic: [
        /\b(exciting|thrilled|delighted|amazing|incredible)\b/g,
        /[!]+/g,
        /\b(can't wait|so excited|love to)\b/g
      ],
      formal: [
        /\b(pursuant to|in accordance with|hereby|whereas)\b/g,
        /\b(shall|must|will be|is required)\b/g,
        /\b(please note|kindly|respectfully)\b/g
      ]
    }

    const scores = Object.entries(patterns).map(([tone, patternList]) => {
      const matchCount = patternList.reduce((count, pattern) => {
        const matches = lowerText.match(pattern) || []
        return count + matches.length
      }, 0)
      
      return { tone, score: matchCount }
    })

    const maxScore = Math.max(...scores.map(s => s.score))
    const topTone = scores.find(s => s.score === maxScore)

    if (maxScore === 0) {
      return { detected: 'professional', confidence: 0.3 }
    }

    const confidence = Math.min(0.9, maxScore / (text.split(/\s+/).length / 10))
    
    return {
      detected: topTone?.tone as ContentAnalysis['toneAnalysis']['detected'] || 'professional',
      confidence: Math.max(0.3, confidence)
    }
  }

  private calculateEngagementScore(text: string): number {
    let score = 50 // base score

    // Check for engaging elements
    const hasQuestions = /\?/.test(text)
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(text)
    const hasCallsToAction = /\b(try|check out|learn more|get started|discover)\b/i.test(text)
    const hasBulletPoints = /^[\s]*[-*•]/m.test(text)
    const hasNumbers = /\b\d+%|\b\d+x\b|\b\d+\.\d+\b/.test(text)

    if (hasQuestions) score += 10
    if (hasEmojis) score += 8
    if (hasCallsToAction) score += 12
    if (hasBulletPoints) score += 8
    if (hasNumbers) score += 10

    // Penalize very long sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = text.split(/\s+/).length / sentences.length
    if (avgSentenceLength > 25) score -= 10
    if (avgSentenceLength > 35) score -= 10

    return Math.max(0, Math.min(100, score))
  }

  private calculateStructureScore(text: string): number {
    let score = 50 // base score

    const hasHeaders = /^#{1,6}\s+/m.test(text)
    const hasBulletPoints = /^[\s]*[-*•]/m.test(text)
    const hasNumberedLists = /^\d+\.\s+/m.test(text)
    const hasParagraphs = text.split('\n\n').length > 1
    const hasCodeBlocks = /```[\s\S]*?```/.test(text)

    if (hasHeaders) score += 15
    if (hasBulletPoints) score += 10
    if (hasNumberedLists) score += 10
    if (hasParagraphs) score += 10
    if (hasCodeBlocks) score += 5

    // Check paragraph length variety
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0)
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length
    
    if (avgParagraphLength > 20 && avgParagraphLength < 80) score += 10

    return Math.max(0, Math.min(100, score))
  }

  private generateSuggestions(
    text: string, 
    analysis: Partial<ContentAnalysis>,
    options: ContentImprovementOptions
  ): ContentSuggestion[] {
    const suggestions: ContentSuggestion[] = []
    const improvementTypes = options.improvementTypes || ['clarity', 'tone', 'engagement', 'structure']

    // Clarity suggestions
    if (improvementTypes.includes('clarity')) {
      // Check for overly complex sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      for (const sentence of sentences) {
        const wordCount = sentence.split(/\s+/).length
        if (wordCount > 30) {
          suggestions.push({
            id: this.generateId(),
            type: 'clarity',
            title: 'Simplify long sentence',
            description: 'This sentence is quite long and might be hard to follow',
            originalText: sentence.trim(),
            suggestedText: 'Consider breaking this into 2-3 shorter sentences',
            confidence: 0.7,
            reasoning: 'Shorter sentences improve readability and comprehension'
          })
        }
      }

      // Check for passive voice
      const passivePatterns = [/\bis\s+\w+ed\b/g, /\bwas\s+\w+ed\b/g, /\bwere\s+\w+ed\b/g]
      for (const pattern of passivePatterns) {
        const matches = text.match(pattern)
        if (matches && matches.length > 2) {
          suggestions.push({
            id: this.generateId(),
            type: 'clarity',
            title: 'Consider using active voice',
            description: 'Multiple instances of passive voice detected',
            originalText: matches.join(', '),
            suggestedText: 'Use active voice where possible (e.g., "We improved" instead of "Improvements were made")',
            confidence: 0.6,
            reasoning: 'Active voice is more direct and engaging'
          })
        }
      }
    }

    // Tone suggestions
    if (improvementTypes.includes('tone') && options.targetTone) {
      const currentTone = analysis.toneAnalysis?.detected
      if (currentTone && currentTone !== options.targetTone) {
        suggestions.push({
          id: this.generateId(),
          type: 'tone',
          title: `Adjust tone to be more ${options.targetTone}`,
          description: `Current tone appears ${currentTone}, but target is ${options.targetTone}`,
          originalText: text.substring(0, 100) + '...',
          suggestedText: this.getToneSuggestion(options.targetTone),
          confidence: 0.8,
          reasoning: `${options.targetTone} tone better matches your target audience`
        })
      }
    }

    // Engagement suggestions
    if (improvementTypes.includes('engagement')) {
      if ((analysis.engagementScore || 0) < 60) {
        if (!/\?/.test(text)) {
          suggestions.push({
            id: this.generateId(),
            type: 'engagement',
            title: 'Add questions to engage readers',
            description: 'Questions can help connect with your audience',
            originalText: '',
            suggestedText: 'Consider adding: "What does this mean for you?" or "Ready to try it?"',
            confidence: 0.6,
            reasoning: 'Questions increase reader engagement and participation'
          })
        }

        if (!/\b(try|check out|learn more|get started)\b/i.test(text)) {
          suggestions.push({
            id: this.generateId(),
            type: 'engagement',
            title: 'Add call-to-action',
            description: 'Guide readers on what to do next',
            originalText: '',
            suggestedText: 'Add phrases like "Try it now", "Learn more", or "Get started"',
            confidence: 0.7,
            reasoning: 'Clear calls-to-action guide user behavior'
          })
        }
      }
    }

    // Structure suggestions
    if (improvementTypes.includes('structure')) {
      if ((analysis.structureScore || 0) < 60) {
        if (!/^#{1,6}\s+/m.test(text)) {
          suggestions.push({
            id: this.generateId(),
            type: 'structure',
            title: 'Add section headers',
            description: 'Headers help organize content and improve scanability',
            originalText: '',
            suggestedText: 'Use headers like "## New Features", "## Bug Fixes", "## Improvements"',
            confidence: 0.8,
            reasoning: 'Headers make content easier to scan and navigate'
          })
        }

        if (!/^[\s]*[-*•]/m.test(text) && text.split(/\s+/).length > 50) {
          suggestions.push({
            id: this.generateId(),
            type: 'structure',
            title: 'Use bullet points',
            description: 'Break down information into digestible points',
            originalText: '',
            suggestedText: 'Convert long paragraphs into bullet points for better readability',
            confidence: 0.7,
            reasoning: 'Bullet points improve content scanability'
          })
        }
      }
    }

    return suggestions.slice(0, options.maxSuggestions || 10)
  }

  private getToneSuggestion(targetTone: string): string {
    const suggestions = {
      professional: 'Use formal language, avoid contractions, include specific details and business value',
      casual: 'Use conversational language, contractions, and friendly expressions like "you\'ll love"',
      technical: 'Include technical details, API changes, implementation notes, and code examples',
      enthusiastic: 'Use exciting language, exclamation points, and words like "amazing", "exciting"',
      formal: 'Use structured language, avoid casual expressions, include official terminology'
    }
    
    return suggestions[targetTone as keyof typeof suggestions] || 'Adjust language to match target tone'
  }

  async analyzeContent(text: string, options: ContentImprovementOptions = {}): Promise<ContentAnalysis> {
    if (!text.trim()) {
      throw new Error('Content cannot be empty')
    }

    const readabilityScore = this.calculateReadabilityScore(text)
    const toneAnalysis = this.detectTone(text)
    const engagementScore = this.calculateEngagementScore(text)
    const structureScore = this.calculateStructureScore(text)
    
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
    const estimatedReadingTime = Math.max(1, Math.round(wordCount / 200)) // 200 WPM average

    const analysis: ContentAnalysis = {
      readabilityScore,
      toneAnalysis: {
        detected: toneAnalysis.detected,
        confidence: toneAnalysis.confidence,
        suggestions: []
      },
      engagementScore,
      structureScore,
      suggestions: [],
      wordCount,
      estimatedReadingTime
    }

    // Generate suggestions based on analysis
    analysis.suggestions = this.generateSuggestions(text, analysis, options)

    // Add tone suggestions to tone analysis
    if (options.targetTone && toneAnalysis.detected !== options.targetTone) {
      analysis.toneAnalysis.suggestions.push(
        `Consider adjusting tone to be more ${options.targetTone}`
      )
    }

    return analysis
  }

  async improveSentence(sentence: string, improvementType: ContentSuggestion['type']): Promise<string> {
    // This would typically call an AI service, but for now we'll provide rule-based improvements
    
    switch (improvementType) {
      case 'clarity':
        // Remove unnecessary words and simplify
        return sentence
          .replace(/\b(very|really|quite|rather|pretty)\s+/g, '')
          .replace(/\bin order to\b/g, 'to')
          .replace(/\bdue to the fact that\b/g, 'because')
          
      case 'engagement':
        // Add more engaging language
        if (!sentence.includes('!') && !sentence.includes('?')) {
          return sentence.trim().replace(/\.$/, '!')
        }
        return sentence
        
      case 'structure':
        // Improve sentence structure
        return sentence.replace(/,\s*and\s+/g, ', ')
        
      default:
        return sentence
    }
  }
}

export const contentEnhancer = new ContentEnhancer()