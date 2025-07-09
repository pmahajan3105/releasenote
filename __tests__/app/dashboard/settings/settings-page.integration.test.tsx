import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

import { describe, it, beforeEach, afterEach, vi } from 'vitest'
import { mockFetchImpl } from './test-utils'
// eslint-disable-next-line no-console
console.log('[test] Importing SettingsPageComponent from', '../../../../app/(dashboard)/settings/SettingsPageComponent')
import SettingsPageComponent from '../../../../app/(dashboard)/settings/SettingsPageComponent'


vi.mock('../../../lib/store', () => ({
  useAuthStore: (selector?: any) => {
    const state = { user: { id: 'org1', email: 'test@example.com' } }
    return selector ? selector(state) : state
  },
  useAuthSelectors: () => ({ isLoading: false })
}))

// --- TESTS ---
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((...args) => {
    // Log every fetch call and stack trace
    // eslint-disable-next-line no-console
    console.log('[test] fetch called with:', args[0], args[1], new Error().stack)
    return mockFetchImpl({
      '/api/organizations/org1': (_opts: any, _url?: string) => ({ ok: true, body: { logo_url: null, favicon_url: null, settings: { default_template_id: null } } }),
      '/api/organizations': (_opts: any, _url?: string) => ({ ok: true, body: [{ id: 'org1', logo_url: null, favicon_url: null, settings: { default_template_id: null } }] }),
      '/api/templates': (_opts: any, _url?: string) => ({ ok: true, body: { templates: [] } }),
      '/api/domain-settings': (_opts: any, _url?: string) => { console.log('[mock] /api/domain-settings called'); return { ok: true, body: { custom_domain: 'custom.example.com', public_portal_url: 'https://public.example.com' } } },
      '/api/sso-settings': (_opts: any, _url?: string) => { console.log('[mock] /api/sso-settings called'); return { ok: true, body: { sso: { url: 'https://sso.example.com', code: 'abc123' } } } },
      // catch-all handler for any other endpoint
      'catchAll': (_opts: any, url?: string) => { console.warn('[test] Unhandled fetch in test:', url); return { ok: false, body: { error: `Unhandled fetch: ${url}` }, status: 404, statusText: 'Not Found' } }
    })(args[0], args[1])
  })
})
afterEach(() => {
  vi.restoreAllMocks()
})
describe('SettingsPage integration', () => {
  it('renders Domain and SSO Settings sections and loads data', async () => {
    render(<SettingsPageComponent />)
    // Domain section
    await waitFor(() => expect(screen.getByLabelText(/Public Portal URL/i)).toBeInTheDocument())
    expect(screen.getByLabelText(/Custom Domain/i)).toHaveValue('custom.example.com')
    // SSO section
    await waitFor(() => expect(screen.getByLabelText(/SSO URL/i)).toBeInTheDocument())
    expect(screen.getByLabelText(/SSO URL/i)).toHaveValue('https://sso.example.com')
    expect(screen.getByLabelText(/SSO Code/i)).toHaveValue('abc123')
  })

  it('can update custom domain', async () => {
    render(<SettingsPageComponent />)
    await waitFor(() => expect(screen.getByLabelText(/Custom Domain/i)).toBeInTheDocument())
    const input = screen.getByLabelText(/Custom Domain/i)
    fireEvent.change(input, { target: { value: 'mydomain.com' } })
    const button = screen.getByText(/Save Domain/i)
    fireEvent.click(button)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/domain-settings'),
      expect.objectContaining({ method: 'PUT' })
    ))
  })

  it('can update SSO settings', async () => {
    render(<SettingsPageComponent />)
    await waitFor(() => expect(screen.getByLabelText(/SSO URL/i)).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/SSO URL/i), { target: { value: 'https://new-sso.com' } })
    fireEvent.change(screen.getByLabelText(/SSO Code/i), { target: { value: 'newcode' } })
    fireEvent.click(screen.getByText(/Save SSO Settings/i))
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/sso-settings'),
      expect.objectContaining({ method: 'PUT' })
    ))
  })

  it('shows error if domain API fails', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'fail' }) }))
    render(<SettingsPageComponent />)
    await waitFor(() => expect(screen.getByText(/fail/i)).toBeInTheDocument())
  })

  it('shows error if SSO API fails', async () => {
    vi.spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ custom_domain: 'x', public_portal_url: 'y' }) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'fail-sso' }) }))
    render(<SettingsPageComponent />)
    await waitFor(() => expect(screen.getByText(/fail-sso/i)).toBeInTheDocument())
  })
})
