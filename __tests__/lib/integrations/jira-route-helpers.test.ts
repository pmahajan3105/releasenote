import { describe, expect, it } from '@jest/globals'
import type { JiraIssue, JiraProject } from '@/lib/integrations/jira-client'
import {
  parseCsvParam,
  parseIntegerParam,
  resolveJiraSite,
  transformJiraIssue,
  transformJiraProject,
} from '@/lib/integrations/jira-route-helpers'

describe('jira-route-helpers', () => {
  it('parses integer params with bounds', () => {
    expect(parseIntegerParam('15', 50, { min: 1, max: 100 })).toBe(15)
    expect(parseIntegerParam('0', 50, { min: 1, max: 100 })).toBe(1)
    expect(parseIntegerParam('999', 50, { min: 1, max: 100 })).toBe(100)
    expect(parseIntegerParam('abc', 50, { min: 1, max: 100 })).toBe(50)
  })

  it('parses csv query params safely', () => {
    expect(parseCsvParam('bug, feature, , chore')).toEqual(['bug', 'feature', 'chore'])
    expect(parseCsvParam('')).toBeUndefined()
    expect(parseCsvParam(null)).toBeUndefined()
  })

  it('resolves jira site by explicit id or defaults to first', () => {
    const resources = [
      { id: 'site-1', name: 'Primary', url: 'https://example.atlassian.net', scopes: [] },
      { id: 'site-2', name: 'Secondary', url: 'https://team.atlassian.net', scopes: [] },
    ]

    expect(resolveJiraSite(resources, 'site-2')?.id).toBe('site-2')
    expect(resolveJiraSite(resources, null)?.id).toBe('site-1')
    expect(resolveJiraSite(resources, 'missing')).toBeNull()
  })

  it('transforms project and issue payloads for api responses', () => {
    const project: JiraProject = {
      id: '1000',
      key: 'REL',
      name: 'Release Notes',
      projectTypeKey: 'software',
      simplified: true,
      isPrivate: false,
      avatarUrls: { '24x24': 'https://img.example/24.png' },
      issueTypes: [{ id: '1', name: 'Bug', subtask: false }],
    }

    const issue: JiraIssue = {
      id: '2000',
      key: 'REL-12',
      fields: {
        summary: 'Fix regression',
        status: {
          id: '3',
          name: 'In Progress',
          statusCategory: { id: 2, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
        },
        issuetype: { id: '1', name: 'Bug', subtask: false },
        created: '2026-01-01T00:00:00.000Z',
        updated: '2026-01-02T00:00:00.000Z',
        labels: ['backend'],
      },
      changelog: {
        histories: [
          {
            id: 'h1',
            author: { accountId: 'u1', displayName: 'Jane Doe' },
            created: '2026-01-02T00:00:00.000Z',
            items: [{ field: 'status', fieldtype: 'jira', fromString: 'To Do', toString: 'In Progress' }],
          },
        ],
      },
    }

    const transformedProject = transformJiraProject(project)
    const transformedIssue = transformJiraIssue(issue, {
      id: 'site-1',
      name: 'Primary',
      url: 'https://example.atlassian.net',
      scopes: [],
    })

    expect(transformedProject.issueTypes[0].name).toBe('Bug')
    expect(transformedIssue.url).toBe('https://example.atlassian.net/browse/REL-12')
    expect(transformedIssue.changelog[0].items[0].to).toBe('In Progress')
  })
})
