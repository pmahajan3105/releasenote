import { isSafeImageSrc, isSafeLinkHref, normalizeEditorLinkInput } from '@/lib/url-safety'

describe('url safety', () => {
  it('rejects unsafe schemes and protocol-relative links', () => {
    expect(isSafeLinkHref('javascript:alert(1)')).toBe(false)
    expect(isSafeLinkHref('//evil.example.com')).toBe(false)
    expect(isSafeImageSrc('//cdn.example.com/image.png')).toBe(false)
  })

  it('rejects unicode separator/invisible characters', () => {
    expect(isSafeLinkHref(`https://example.com/\u00A0foo`)).toBe(false)
    expect(isSafeLinkHref(`https://example.com/\u200Bfoo`)).toBe(false)
    expect(isSafeImageSrc(`https://example.com/\u2028img.png`)).toBe(false)
  })

  it('normalizes plain hostnames to https and keeps safe mailto', () => {
    expect(normalizeEditorLinkInput('example.com/docs')).toBe('https://example.com/docs')
    expect(isSafeLinkHref('mailto:test@example.com')).toBe(true)
    expect(isSafeLinkHref('mailto:test@example')).toBe(false)
  })
})
