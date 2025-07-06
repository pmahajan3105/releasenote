/**
 * CSS Validator and Sanitizer
 * Validates and sanitizes custom CSS to prevent XSS and maintain security
 */

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sanitizedCSS?: string
}

export class CSSValidator {
  // Dangerous CSS properties that could be used for XSS
  private static DANGEROUS_PROPERTIES = [
    'expression',
    'behavior',
    '-moz-binding',
    'binding',
    'javascript',
    'vbscript',
    'data:',
    'import'
  ]

  // Allowed CSS properties for safe styling
  private static ALLOWED_PROPERTIES = [
    // Layout
    'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
    'float', 'clear', 'overflow', 'overflow-x', 'overflow-y', 'visibility',
    
    // Box Model
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border', 'border-width', 'border-style', 'border-color',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    'border-radius', 'box-sizing', 'box-shadow',
    
    // Typography
    'font', 'font-family', 'font-size', 'font-weight', 'font-style',
    'font-variant', 'line-height', 'letter-spacing', 'word-spacing',
    'text-align', 'text-decoration', 'text-transform', 'text-indent',
    'text-shadow', 'white-space', 'word-wrap', 'word-break',
    
    // Colors & Backgrounds
    'color', 'background', 'background-color', 'background-image',
    'background-repeat', 'background-position', 'background-size',
    'background-attachment', 'background-clip', 'background-origin',
    'opacity', 'filter',
    
    // Flexbox
    'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
    'align-items', 'align-content', 'align-self', 'flex-grow', 'flex-shrink',
    'flex-basis', 'order',
    
    // Grid
    'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows',
    'grid-template-areas', 'grid-column', 'grid-row', 'grid-area',
    'grid-gap', 'column-gap', 'row-gap', 'justify-items', 'align-items',
    
    // Animation & Transitions
    'transition', 'transition-property', 'transition-duration',
    'transition-timing-function', 'transition-delay', 'transform',
    'transform-origin', 'animation', 'animation-name', 'animation-duration',
    'animation-timing-function', 'animation-delay', 'animation-iteration-count',
    'animation-direction', 'animation-fill-mode', 'animation-play-state',
    
    // Custom Properties (CSS Variables)
    '--brand-color', '--brand-color-hover', '--font-family', '--border-radius',
    '--shadow', '--spacing', '--text-color', '--background-color'
  ]

  // URL patterns that are safe
  private static SAFE_URL_PATTERNS = [
    /^https:\/\//,
    /^data:image\/(png|jpe?g|gif|svg\+xml);base64,/,
    /^#[a-zA-Z0-9-_]+$/  // Internal anchors
  ]

  /**
   * Validate and sanitize CSS
   */
  static validate(css: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Basic structure validation
      if (!css.trim()) {
        return {
          isValid: false,
          errors: ['CSS cannot be empty'],
          warnings: []
        }
      }

      // Check for dangerous content
      const dangerousContent = this.checkForDangerousContent(css)
      if (dangerousContent.length > 0) {
        errors.push(...dangerousContent)
      }

      // Parse and validate CSS structure
      const parseResult = this.parseCSS(css)
      if (!parseResult.isValid) {
        errors.push(...parseResult.errors)
      }
      warnings.push(...parseResult.warnings)

      // Sanitize CSS if no critical errors
      let sanitizedCSS = css
      if (errors.length === 0) {
        sanitizedCSS = this.sanitizeCSS(css)
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedCSS: errors.length === 0 ? sanitizedCSS : undefined
      }

    } catch (error) {
      return {
        isValid: false,
        errors: [`CSS parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      }
    }
  }

  /**
   * Check for dangerous CSS content
   */
  private static checkForDangerousContent(css: string): string[] {
    const errors: string[] = []
    const lowerCSS = css.toLowerCase()

    // Check for dangerous properties
    for (const dangerous of this.DANGEROUS_PROPERTIES) {
      if (lowerCSS.includes(dangerous)) {
        errors.push(`Dangerous property or value detected: ${dangerous}`)
      }
    }

    // Check for potential XSS vectors
    const xssPatterns = [
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /expression\s*\(/gi,
      /@import\s+url\(/gi,
      /behavior\s*:/gi
    ]

    for (const pattern of xssPatterns) {
      if (pattern.test(css)) {
        errors.push(`Potentially dangerous pattern detected: ${pattern.source}`)
      }
    }

    return errors
  }

  /**
   * Parse CSS and validate structure
   */
  private static parseCSS(css: string): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Remove comments
      const cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, '')
      
      // Basic bracket matching
      const openBraces = (cleanCSS.match(/\{/g) || []).length
      const closeBraces = (cleanCSS.match(/\}/g) || []).length
      
      if (openBraces !== closeBraces) {
        errors.push('Mismatched CSS braces')
      }

      // Check for valid selectors and properties
      const rules = this.extractCSSRules(cleanCSS)
      
      for (const rule of rules) {
        // Validate selector
        if (!this.isValidSelector(rule.selector)) {
          warnings.push(`Potentially unsafe selector: ${rule.selector}`)
        }

        // Validate properties
        for (const property of rule.properties) {
          if (!this.isAllowedProperty(property.name)) {
            warnings.push(`Property not in allowlist: ${property.name}`)
          }

          // Validate URLs in property values
          const urls = this.extractURLs(property.value)
          for (const url of urls) {
            if (!this.isValidURL(url)) {
              errors.push(`Invalid or unsafe URL: ${url}`)
            }
          }
        }
      }

    } catch (error) {
      errors.push(`CSS structure validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  /**
   * Extract CSS rules from CSS text
   */
  private static extractCSSRules(css: string): Array<{ selector: string; properties: Array<{ name: string; value: string }> }> {
    const rules: Array<{ selector: string; properties: Array<{ name: string; value: string }> }> = []
    
    // Simple regex-based CSS parser (for basic validation)
    const ruleRegex = /([^{]+)\{([^}]+)\}/g
    let match

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim()
      const declarations = match[2].trim()
      
      const properties: Array<{ name: string; value: string }> = []
      const propRegex = /([^:]+):([^;]+)/g
      let propMatch

      while ((propMatch = propRegex.exec(declarations)) !== null) {
        properties.push({
          name: propMatch[1].trim(),
          value: propMatch[2].trim()
        })
      }

      rules.push({ selector, properties })
    }

    return rules
  }

  /**
   * Check if a CSS selector is valid and safe
   */
  private static isValidSelector(selector: string): boolean {
    // Allow basic selectors but be restrictive
    const safeSelectors = /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*(\s*[>,+~]\s*[.#]?[a-zA-Z][a-zA-Z0-9_-]*)*(\s*:[a-zA-Z-]+(\([^)]*\))?)*$/
    const pseudoElements = /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*(::[a-zA-Z-]+)?$/
    
    return safeSelectors.test(selector.trim()) || pseudoElements.test(selector.trim())
  }

  /**
   * Check if a CSS property is allowed
   */
  private static isAllowedProperty(property: string): boolean {
    const normalizedProp = property.toLowerCase().trim()
    
    // Allow CSS custom properties (variables)
    if (normalizedProp.startsWith('--')) {
      return true
    }

    return this.ALLOWED_PROPERTIES.includes(normalizedProp)
  }

  /**
   * Extract URLs from CSS property values
   */
  private static extractURLs(value: string): string[] {
    const urlRegex = /url\(['"]?([^'"]+)['"]?\)/gi
    const urls: string[] = []
    let match

    while ((match = urlRegex.exec(value)) !== null) {
      urls.push(match[1])
    }

    return urls
  }

  /**
   * Check if a URL is safe
   */
  private static isValidURL(url: string): boolean {
    return this.SAFE_URL_PATTERNS.some(pattern => pattern.test(url))
  }

  /**
   * Sanitize CSS by removing dangerous content
   */
  private static sanitizeCSS(css: string): string {
    let sanitized = css

    // Remove comments
    sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '')

    // Remove any remaining dangerous patterns
    const dangerousPatterns = [
      /javascript:/gi,
      /vbscript:/gi,
      /expression\s*\([^)]*\)/gi,
      /@import[^;]+;/gi,
      /behavior\s*:[^;]+;/gi
    ]

    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '')
    }

    // Normalize whitespace
    sanitized = sanitized
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, ' { ')
      .replace(/\s*}\s*/g, ' } ')
      .replace(/\s*;\s*/g, '; ')
      .trim()

    return sanitized
  }

  /**
   * Generate CSS custom properties for theme customization
   */
  static generateThemeVariables(theme: {
    brandColor?: string
    fontFamily?: string
    borderRadius?: string
    spacing?: string
    textColor?: string
    backgroundColor?: string
  }): string {
    const variables: string[] = []

    if (theme.brandColor) {
      variables.push(`--brand-color: ${theme.brandColor}`)
      variables.push(`--brand-color-hover: ${theme.brandColor}dd`)
    }

    if (theme.fontFamily) {
      variables.push(`--font-family: ${theme.fontFamily}`)
    }

    if (theme.borderRadius) {
      variables.push(`--border-radius: ${theme.borderRadius}`)
    }

    if (theme.spacing) {
      variables.push(`--spacing: ${theme.spacing}`)
    }

    if (theme.textColor) {
      variables.push(`--text-color: ${theme.textColor}`)
    }

    if (theme.backgroundColor) {
      variables.push(`--background-color: ${theme.backgroundColor}`)
    }

    return variables.length > 0 
      ? `:root {\n  ${variables.join(';\n  ')};\n}`
      : ''
  }
}