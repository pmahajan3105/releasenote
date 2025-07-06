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

// Placeholder function to fetch ticket details - replace with actual API calls
async function fetchTicketDetails(ticketIds: string[]): Promise<TicketDetail[]> {
  console.log('Fetching details for tickets:', ticketIds)
  // In a real app, call Jira/GitHub API based on IDs
  await new Promise(res => setTimeout(res, 500)) // Simulate delay
  return ticketIds.map((id, index) => ({
    key: `TIC-${id}`,
    title: `Fetched Ticket Title ${index + 1}`,
    description: `This is the fetched description for ticket ${id}. It might contain details about the fix or feature implementation.`
  }))
}

// Configure DOMPurify outside the handler
const window = new JSDOM('').window;
// @ts-ignore 
const purify = DOMPurify(window);

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
    const ticketDetails = await fetchTicketDetails(noteData.source_ticket_ids)

    // 4. Construct Prompt
    let prompt = `Generate release notes based on the following completed tickets:\n\n`
    ticketDetails.forEach(ticket => {
      prompt += `- **${ticket.key}: ${ticket.title}**\n`
      if (ticket.description) {
        prompt += `  Description: ${ticket.description}\n`
      }
      prompt += '\n'
    })
    prompt += `\nPlease categorize these tickets into sections like 'New Features', 'Bug Fixes', and 'Improvements'.`
    prompt += ` Ensure the output is clean Markdown.`

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