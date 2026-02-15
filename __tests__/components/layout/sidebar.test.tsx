import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@/components/layout/sidebar'

const mockSignOut = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => <img {...props} alt={props.alt || ''} />,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

jest.mock('@/lib/store/use-auth', () => ({
  useAuthStore: () => ({
    user: {
      id: 'user-1',
      email: 'user@example.com',
      user_metadata: { full_name: 'User Name' },
    },
    profile: {
      first_name: 'User',
      last_name: 'Name',
      avatar_url: null,
    },
    signOut: mockSignOut,
  }),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders primary navigation and search', () => {
    render(<Sidebar />)

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Release Notes')).toBeInTheDocument()
    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('AI Context')).toBeInTheDocument()
  })

  it('renders footer navigation', () => {
    render(<Sidebar />)

    expect(screen.getByText('Templates')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders release-note submenu items by default', () => {
    render(<Sidebar />)

    expect(screen.getByText('View All')).toBeInTheDocument()
    expect(screen.getByText('Create New')).toBeInTheDocument()
    expect(screen.getByText('From Template')).toBeInTheDocument()
    expect(screen.getByText('From Scratch')).toBeInTheDocument()
  })

  it('toggles release-note submenu', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    await user.click(screen.getByRole('button', { name: /release notes/i }))
    expect(screen.queryByText('View All')).not.toBeInTheDocument()
    expect(screen.queryByText('Create New')).not.toBeInTheDocument()
  })

  it('renders authenticated user info', () => {
    render(<Sidebar />)

    expect(screen.getByText('User Name')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('calls signOut when logout button is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})
