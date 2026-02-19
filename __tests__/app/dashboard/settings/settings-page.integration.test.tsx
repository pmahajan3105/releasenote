import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { rest } from 'msw'
import SettingsPageComponent from '@/app/dashboard/settings/SettingsPageComponent'
import { server } from '@/__tests__/msw/server'


jest.mock('@/lib/store', () => ({
  useAuthStore: (selector?: (state: { user: { id: string; email: string } }) => unknown) => {
    const state = { user: { id: 'org1', email: 'test@example.com' } }
    return selector ? selector(state) : state
  },
  useAuthSelectors: () => ({ isLoading: false })
}))

// --- TESTS ---
let updatedDomain: string | null = null

beforeEach(() => {
  updatedDomain = null
  server.use(
    rest.get('/api/organizations/org1/domain', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          custom_domain: 'custom.example.com',
          public_portal_url: 'https://public.example.com',
        })
      )
    ),
    rest.put('/api/organizations/org1/domain', async (req, res, ctx) => {
      const body = (await req.json().catch(() => ({}))) as { domain?: string }
      updatedDomain = body.domain ?? null
      return res(ctx.status(200), ctx.json({ success: true }))
    }),
    rest.get('/api/organizations/org1', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          logo_url: null,
          favicon_url: null,
          settings: { default_template_id: null },
        })
      )
    ),
    rest.get('/api/templates', (_req, res, ctx) => res(ctx.status(200), ctx.json({ templates: [] })))
  )
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
    await waitFor(() => expect(updatedDomain).toBe('mydomain.com'))
  })

  it('shows error if domain API fails', async () => {
    server.use(
      rest.get('/api/organizations/org1/domain', (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ error: 'fail' }))
      )
    )
    render(<SettingsPageComponent />)
    await waitFor(() => expect(screen.getByText(/fail/i)).toBeInTheDocument())
  })
})
