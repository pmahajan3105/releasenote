import { NextRequest, NextResponse } from 'next/server'
import { withOrgAuth } from '@/lib/auth-helpers'
import { ReleaseNotesService } from '@/lib/services'
import type { AuthContext } from '@/types/auth'

/**
 * GET /api/release-notes - Get all release notes with filtering
 * POST /api/release-notes - Create new release note
 */

export const GET = withOrgAuth(async (request: NextRequest, context: AuthContext) => {
  try {
    const { searchParams } = new URL(request.url)
    const releaseNotesService = new ReleaseNotesService()

    // Parse query parameters
    const filters = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    const result = await releaseNotesService.findAll(context.organizationId, filters)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Release notes GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
})

export const POST = withOrgAuth(async (request: NextRequest, context: AuthContext) => {
  try {
    const releaseNotesService = new ReleaseNotesService()
    const body = await request.json()

    const {
      title,
      content,
      content_markdown,
      content_html,
      version,
      status = 'draft'
    } = body

    if (!title || !content_markdown) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const releaseNote = await releaseNotesService.create(
      context.organizationId,
      context.user.id,
      {
        title,
        content,
        content_markdown,
        content_html,
        version,
        status
      }
    )

    return NextResponse.json(releaseNote, { status: 201 })

  } catch (error) {
    console.error('Release notes POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
})
