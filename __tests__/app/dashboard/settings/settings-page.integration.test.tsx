import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { mockFetchImpl } from './test-utils'
import SettingsPageComponent from '@/app/dashboard/settings/SettingsPageComponent'


jest.mock('@/lib/store', () => ({
  useAuthStore: (selector?: (state: { user: { id: string; email: string } }) => unknown) => {
    const state = { user: { id: 'org1', email: 'test@example.com' } }
    return selector ? selector(state) : state
  },
  useAuthSelectors: () => ({ isLoading: false })
}))

// --- TESTS ---
beforeEach(() => {
  global.fetch = jest.fn((...args) =>
    mockFetchImpl({
      '/api/organizations/org1': () => ({ ok: true, body: { logo_url: null, favicon_url: null, settings: { default_template_id: null } } }),
      '/api/organizations': () => ({ ok: true, body: [{ id: 'org1', logo_url: null, favicon_url: null, settings: { default_template_id: null } }] }),
      '/api/templates': () => ({ ok: true, body: { templates: [] } }),
      '/api/domain-settings': () => ({ ok: true, body: { custom_domain: 'custom.example.com', public_portal_url: 'https://public.example.com' } }),
      catchAll: (_opts: unknown, url?: string) => ({
        ok: false,
        body: { error: `Unhandled fetch: ${url}` },
        status: 404,
        statusText: 'Not Found'
      })
    })(args[0], args[1]) as ReturnType<typeof fetch>
  ) as jest.MockedFunction<typeof fetch>
})
afterEach(() => {
  jest.resetAllMocks()
})
describe('SettingsPage integration', () => {
  it('renders Domain Settings section and loads data', async () => {
    render(<SettingsPageComponent />)
    await waitFor(() => expect(screen.getByText(/Domain Settings/i)).toBeInTheDocument())
    expect(screen.getByDisplayValue('https://public.example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('custom.example.com')).toBeInTheDocument()
  })

  it('can update custom domain', async () => {
    render(<SettingsPageComponent />)
    await waitFor(() => expect(screen.getByDisplayValue('custom.example.com')).toBeInTheDocument())
    const input = screen.getByDisplayValue('custom.example.com')
    fireEvent.change(input, { target: { value: 'mydomain.com' } })
    const button = screen.getByText(/Save Domain/i)
    fireEvent.click(button)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/domain-settings'),
      expect.objectContaining({ method: 'PUT' })
    ))
  })

  it('shows error if domain API fails', async () => {
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(
      () => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'fail' }) } as Response)
    )
    render(<SettingsPageComponent />)
    await waitFor(() => expect(screen.getByText(/fail/i)).toBeInTheDocument())
  })
})
