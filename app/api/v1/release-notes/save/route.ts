import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'
import { z } from 'zod' // For input validation
import { Database } from '@/types/supabase'

// Schema for validating the incoming request body
const saveNoteSchema = z.object({
  releaseNoteId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  content_html: z.string(), // We'll sanitize this
  publish: z.boolean().optional(),
  // Add cover_image_url if you decide to update it here instead of its own handler
});

// Configure DOMPurify to run in a JSDOM environment
const window = new JSDOM('').window;
// @ts-ignore // DOMPurify type expects browser Window, JSDOM window works but type mismatches
const purify = DOMPurify(window);

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await request.json()

    // 1. Validate Input
    const validation = saveNoteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 })
    }
    const { releaseNoteId, title, content_html, publish } = validation.data

    // 2. Sanitize HTML Content
    const sanitizedContent = purify.sanitize(content_html, {
        USE_PROFILES: { html: true }, // Allow standard HTML elements
        // Add specific configuration if needed, e.g., allowed tags/attributes
        // FORBID_TAGS: ['style'],
        // FORBID_ATTR: ['onerror']
    });

    // 3. Prepare Update Data (Improved Typing)
    type NoteUpdatePayload = Partial<Pick<Database['public']['Tables']['release_notes']['Row'], 'title' | 'content_html' | 'status' | 'published_at'>> & { updated_at: string };

    const updates: NoteUpdatePayload = {
        title,
        content_html: sanitizedContent,
        updated_at: new Date().toISOString(),
    }

    // Check if the note exists and belongs to the user before updating status
    if (publish) {
        const { data: currentNote, error: fetchError } = await supabase
            .from('release_notes')
            .select('status')
            .eq('id', releaseNoteId)
            .eq('organization_id', userId)
            .single();

        if (fetchError || !currentNote) {
            return NextResponse.json({ error: 'Release note not found or permission denied' }, { status: 404 })
        }

        if (currentNote.status !== 'published') {
            updates.status = 'published'
            updates.published_at = new Date().toISOString() // Assuming schema has published_at
        } else {
            // Optionally prevent re-publishing or just update content/title
            // If already published, we only update content/title/updated_at
        }
    }

    // 4. Update Database
    const { data, error: updateError } = await supabase
      .from('release_notes')
      .update(updates)
      .eq('id', releaseNoteId)
      .eq('organization_id', userId) // Ensure ownership for update
      .select('id, title, status, updated_at, published_at') // Select data to return
      .single()

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: `Failed to save: ${updateError.message}` }, { status: 500 })
    }

    // 5. Return Success Response
    return NextResponse.json({ success: true, updatedNote: data }, { status: 200 })

  } catch (error) {
    console.error('Save API Error:', error)
    // Distinguish between validation errors (already handled) and other errors
    if (error instanceof z.ZodError) {
         return NextResponse.json({ error: 'Invalid input data.', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
} 