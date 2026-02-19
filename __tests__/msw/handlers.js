const { rest } = require('msw')

const githubRepositoriesResponse = {
  repositories: [
    {
      id: 1,
      name: 'my-app',
      full_name: 'user/my-app',
      description: 'My awesome application',
      private: false,
      html_url: 'https://github.com/user/my-app',
      default_branch: 'main',
      language: 'TypeScript',
      stargazers_count: 42,
      updated_at: '2024-01-15T10:30:00Z',
      topics: ['react', 'typescript'],
      open_issues_count: 3,
      has_issues: true,
      archived: false,
      disabled: false,
      size: 1024,
      fork: false,
      owner: {
        login: 'user',
        avatar_url: 'https://github.com/user.png',
        type: 'User',
      },
    },
  ],
  user: {
    login: 'testuser',
    avatar_url: 'https://github.com/testuser.png',
    public_repos: 10,
    total_private_repos: 5,
    owned_private_repos: 3,
  },
  rate_limit: {
    limit: 5000,
    remaining: 4999,
    reset: Date.now() + 3600000,
  },
}

const handlers = [
  rest.get('/api/integrations/github/repositories', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(githubRepositoriesResponse))
  ),
  rest.get('/api/organizations/:id/domain', (_req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        custom_domain: 'custom.example.com',
        public_portal_url: 'https://public.example.com',
      })
    )
  ),
  rest.put('/api/organizations/:id/domain', async (req, res, ctx) => {
    const body = await req.json().catch(() => ({}))
    const domain = typeof body.domain === 'string' ? body.domain.trim() : ''

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        custom_domain: domain,
        public_portal_url: domain ? `https://${domain}` : 'https://public.example.com',
      })
    )
  }),
  rest.delete('/api/organizations/:id/domain', (_req, res, ctx) => res(ctx.status(200), ctx.json({ success: true }))),
  rest.get('/api/organizations/:id', (_req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        logo_url: null,
        favicon_url: null,
        settings: { default_template_id: null },
      })
    )
  ),
  rest.get('/api/templates', (_req, res, ctx) => res(ctx.status(200), ctx.json({ templates: [] }))),
]

module.exports = {
  handlers,
}
