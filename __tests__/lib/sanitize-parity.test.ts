import { sanitizeHtml } from '@/lib/sanitize'
import { sanitizeHtmlClient } from '@/lib/sanitize-client'

describe('sanitize parity', () => {
  it('keeps server/client sanitization behavior aligned for links and task-list inputs', () => {
    const html = `
      <p>Hello</p>
      <a href="javascript:alert(1)">bad link</a>
      <a href="https://example.com">good link</a>
      <input type="checkbox" checked />
      <input type="text" value="kept-text" />
    `

    const server = sanitizeHtml(html)
    const client = sanitizeHtmlClient(html)

    expect(server).toBe(client)
    expect(server).toContain('<a>bad link</a>')
    expect(server).toContain('rel="noopener noreferrer"')
    expect(server).toContain('type="checkbox"')
    expect(server).toContain('disabled=""')
    expect(server).toContain('tabindex="-1"')
    expect(server).not.toContain('kept-text')
    expect(server).not.toContain('type="text"')
  })

  it('removes unsafe srcset candidates', () => {
    const html = `<img src="https://example.com/a.png" srcset="https://good.com/a.png 1x, javascript:alert(1) 2x" />`
    const sanitized = sanitizeHtml(html)

    expect(sanitized).toContain('src="https://example.com/a.png"')
    expect(sanitized).not.toContain('srcset=')
  })
})
