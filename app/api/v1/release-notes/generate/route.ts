import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAiProvider } from '@/lib/ai'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'
import { z } from 'zod'

// Placeholder types - replace with your actual Supabase types
type OrganizationSettings = {
  companyDetails?: string
  ai_tone?: string
  // add template info if needed
}

type TicketDetail = {
  key: string
  title: string
  description: string | null
}

interface IntegrationRecord {
  type: 'github' | 'jira' | 'linear' | string
  config?: Record<string, unknown>
  access_token: string
}

interface LinearIssueData {
  identifier: string
  title: string
  description?: string | null
}

function isLinearIssueData(value: unknown): value is LinearIssueData {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const issue = value as Record<string, unknown>
  return typeof issue.identifier === 'string' && typeof issue.title === 'string'
}

// Real ticket fetching implementation
async function fetchTicketDetails(ticketIds: string[], organizationId: string): Promise<TicketDetail[]> {
  const supabase = createRouteHandlerClient({ cookies })
  
  // First check if we have cached ticket data
  const { data: cachedTickets, error: cacheError } = await supabase
    .from('ticket_cache')
    .select('external_id, title, description, type, status, url')
    .in('external_id', ticketIds)
    .eq('organization_id', organizationId)
  
  if (cacheError) {
    console.error('Error fetching cached tickets:', cacheError)
  }
  
  // Convert cached tickets to TicketDetail format
  const ticketDetails: TicketDetail[] = []
  
  for (const ticketId of ticketIds) {
    const cachedTicket = cachedTickets?.find(t => t.external_id === ticketId)
    
    if (cachedTicket) {
      ticketDetails.push({
        key: cachedTicket.external_id,
        title: cachedTicket.title,
        description: cachedTicket.description
      })
    } else {
      // If not cached, try to fetch from integrations
      const fetchedTicket = await fetchFromIntegrations(ticketId, organizationId)
      if (fetchedTicket) {
        ticketDetails.push(fetchedTicket)
      } else {
        // Fallback to basic ticket info
        ticketDetails.push({
          key: ticketId,
          title: `Ticket ${ticketId}`,
          description: `Details for ticket ${ticketId} (integration data not available)`
        })
      }
    }
  }
  
  return ticketDetails
}

// Fetch ticket from active integrations
async function fetchFromIntegrations(ticketId: string, organizationId: string): Promise<TicketDetail | null> {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Get active integrations for the organization
    const { data: integrations, error: intError } = await supabase
      .from('integrations')
      .select('type, config, access_token')
      .eq('organization_id', organizationId)
      .eq('status', 'connected')
    
    if (intError || !integrations?.length) {
      console.log('No active integrations found for organization:', organizationId)
      return null
    }
    
    // Try each integration to find the ticket
    for (const integration of integrations) {
      let ticketData: TicketDetail | null = null
      
      switch (integration.type) {
        case 'github':
          ticketData = await fetchFromGitHub(ticketId, integration)
          break
        case 'jira':
          ticketData = await fetchFromJira(ticketId, integration)
          break
        case 'linear':
          ticketData = await fetchFromLinear(ticketId, integration)
          break
        default:
          console.warn('Unknown integration type:', integration.type)
      }
      
      if (ticketData) {
        // Cache the ticket data for future use
        await supabase
          .from('ticket_cache')
          .upsert({
            external_id: ticketData.key,
            title: ticketData.title,
            description: ticketData.description,
            organization_id: organizationId,
            integration_type: integration.type,
            updated_at: new Date().toISOString()
          })
        
        return ticketData
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching from integrations:', error)
    return null
  }
}

// GitHub ticket fetching
async function fetchFromGitHub(ticketId: string, integration: IntegrationRecord): Promise<TicketDetail | null> {
  try {
    const { GitHubService } = await import('@/lib/integrations/github')
    const github = new GitHubService(integration.access_token)
    
    // Parse GitHub ticket ID (could be issue or PR number)
    const match = ticketId.match(/(\d+)/) || ticketId.match(/([^\/]+)\/([^\/]+)#(\d+)/)
    if (!match) return null
    
    const issueNumber = match[match.length - 1]
    const config = integration.config ?? {}
    const selectedRepo = typeof config.selectedRepo === 'string' ? config.selectedRepo : undefined
    const owner = typeof config.owner === 'string' ? config.owner : selectedRepo?.split('/')[0]
    const repo = typeof config.repo === 'string' ? config.repo : selectedRepo?.split('/')[1]
    
    if (!owner || !repo) return null
    
    const issueNumberValue = Number.parseInt(issueNumber, 10)
    if (Number.isNaN(issueNumberValue)) {
      return null
    }

    const issues = await github.getIssues(owner, repo, {
      state: 'all',
      per_page: 100,
      page: 1
    })
    const issue = issues.find((candidate) => candidate.number === issueNumberValue)
    if (!issue) return null
    
    return {
      key: `${owner}/${repo}#${issue.number}`,
      title: issue.title,
      description: issue.body || null
    }
  } catch (error) {
    console.error('Error fetching from GitHub:', error)
    return null
  }
}

// Jira ticket fetching  
async function fetchFromJira(ticketId: string, integration: IntegrationRecord): Promise<TicketDetail | null> {
  try {
    const { JiraAPIClient } = await import('@/lib/integrations/jira-client')
    const jira = JiraAPIClient.getInstance()
    const resources = await jira.getAccessibleResources(integration.access_token)
    const config = integration.config ?? {}
    const configuredSiteId = typeof config.siteId === 'string' ? config.siteId : undefined
    const cloudId = configuredSiteId || resources[0]?.id
    if (!cloudId) return null

    const issue = await jira.getIssue(integration.access_token, cloudId, ticketId)
    if (!issue) return null
    
    return {
      key: issue.key,
      title: issue.fields.summary,
      description: issue.fields.description || null
    }
  } catch (error) {
    console.error('Error fetching from Jira:', error)
    return null
  }
}

// Linear ticket fetching
async function fetchFromLinear(ticketId: string, integration: IntegrationRecord): Promise<TicketDetail | null> {
  try {
    const { linearAPI } = await import('@/lib/integrations/linear-client')
    const issue = await linearAPI.getIssue(integration.access_token, ticketId)
    if (!isLinearIssueData(issue)) return null
    
    return {
      key: issue.identifier,
      title: issue.title,
      description: issue.description || null
    }
  } catch (error) {
    console.error('Error fetching from Linear:', error)
    return null
  }
}

// Configure DOMPurify outside the handler
const domWindow = new JSDOM('').window
const purify = DOMPurify(domWindow)

export async function POST(request: Request) {
  // Validate JSON body
  const bodySchema = z.object({
    releaseNoteId: z.string().min(1, 'releaseNoteId is required')
  })

  const jsonBody = await request.json()
  const parseResult = bodySchema.safeParse(jsonBody)

  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Invalid input',
      details: parseResult.error.flatten().fieldErrors
    }, { status: 400 })
  }

  const { releaseNoteId } = parseResult.data

  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // 1. Fetch the draft release note and ensure user owns it
    const { data: noteData, error: noteError } = await supabase
      .from('release_notes')
      .select('id, title, source_ticket_ids, organization_id')
      .eq('id', releaseNoteId)
      .eq('organization_id', userId) // Basic ownership check
      .single()

    if (noteError || !noteData) {
      console.error('Error fetching note or note not found:', noteError)
      return NextResponse.json({ error: 'Draft note not found or permission denied' }, { status: 404 })
    }

    if (!noteData.source_ticket_ids || noteData.source_ticket_ids.length === 0) {
        return NextResponse.json({ error: 'No source tickets found for this draft' }, { status: 400 })
    }

    // 2. Fetch Organization Settings
    const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', noteData.organization_id)
        .single()
    
    // Handle potential error fetching org settings, provide defaults if needed
    const settings: OrganizationSettings = orgError || !orgData ? {} : (orgData.settings || {})

    // 3. Fetch Ticket Details
    const ticketDetails = await fetchTicketDetails(noteData.source_ticket_ids, noteData.organization_id)

    // 5. Call AI Provider with Azure OpenAI
    const aiProvider = getAiProvider()
    
    // Convert ticket details to commit-like format for the AI provider
    const commitsForAI = ticketDetails.map(ticket => ({
      message: `${ticket.title}: ${ticket.description || ''}`,
      sha: ticket.key,
      type: 'feature' // Could be enhanced to detect type from ticket
    }))
    
    const generatedContent = await aiProvider.generateReleaseNotes(commitsForAI, {
        template: 'traditional',
        tone: (settings.ai_tone as 'professional' | 'casual' | 'technical') || 'professional',
        includeBreakingChanges: true
    })

    // --- ADD SANITIZATION STEP --- 
    const sanitizedGeneratedContent = purify.sanitize(generatedContent, {
        USE_PROFILES: { html: true }
    });
    // --- END SANITIZATION STEP --- 

    // 6. Update the draft note with SANITIZED generated content
    const { error: updateError } = await supabase
      .from('release_notes')
      .update({ 
          content_html: sanitizedGeneratedContent, // Use sanitized content
          updated_at: new Date().toISOString() 
        })
      .eq('id', releaseNoteId)

    if (updateError) {
      console.error('Error updating note with AI content:', updateError)
      throw new Error('Failed to save generated content')
    }

    // 7. Return success (return the sanitized content)
    return NextResponse.json({ success: true, generatedContent: sanitizedGeneratedContent }, { status: 200 })

  } catch (error) {
    console.error('AI Generation API Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
} 
