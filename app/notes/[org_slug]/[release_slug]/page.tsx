import { createServerComponentClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Database } from '@/types/supabase'
import Image from 'next/image'
import { sanitizeHtml } from '@/lib/sanitize'
import { UI_CONSTANTS, DB_CONSTANTS, DATE_FORMAT_OPTIONS } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { getTypedCachedReleaseNote, setCachedReleaseNote } from '@/lib/cache'

type Props = {
  params: Promise<{ org_slug: string; release_slug: string }>
}

interface ReleaseNotePageData {
  note: {
    title: string
    content_html: string | null
    published_at: string | null
    featured_image_url: string | null
  }
  organization: {
    name: string
    logo_url: string | null
  }
}

// Function to fetch release note data server-side with caching
async function getReleaseNote(orgSlug: string, releaseSlug: string): Promise<ReleaseNotePageData | null> {
  // Try cache first
  try {
    const cached = await getTypedCachedReleaseNote<ReleaseNotePageData>(orgSlug, releaseSlug)
    if (cached) {
      logger.info('Cache hit for release note', { orgSlug, releaseSlug })
      return cached
    }
  } catch (error) {
    logger.warn('Cache read failed, proceeding with database query', { error })
  }

  // Create a Supabase client configured for server components
  const supabase = createServerComponentClient<Database>({ cookies })

  // Optimized: Single query with JOIN to fetch both organization and release note data
  const { data, error } = await supabase
    .from('release_notes')
    .select(`
      ${DB_CONSTANTS.RELEASE_NOTE_SELECT},
      organizations!inner(
        name,
        logo_url
      )
    `)
    .eq('organizations.slug', orgSlug)
    .eq('slug', releaseSlug)
    .eq('status', DB_CONSTANTS.PUBLISHED_STATUS)
    .single()

  if (error || !data) {
    logger.dbError('fetch release note', error, { orgSlug, releaseSlug })
    return null
  }

  // PostgREST embedded relations can come back as an object or an array depending on schema
  // and (for typed clients) relationship metadata. Normalize defensively.
  const releaseNoteData = data as {
    title: string
    content_html: string | null
    published_at: string | null
    featured_image_url: string | null
    organizations:
      | { name: string; logo_url: string | null }
      | Array<{ name: string; logo_url: string | null }>
  }

  const organizationRow = Array.isArray(releaseNoteData.organizations)
    ? releaseNoteData.organizations[0]
    : releaseNoteData.organizations

  const result: ReleaseNotePageData = {
    note: {
      title: releaseNoteData.title,
      content_html: releaseNoteData.content_html,
      published_at: releaseNoteData.published_at,
      featured_image_url: releaseNoteData.featured_image_url
    },
    organization: {
      name: organizationRow?.name ?? 'Unknown',
      logo_url: organizationRow?.logo_url ?? null,
    }
  }

  // Cache the result for 1 hour
  try {
    await setCachedReleaseNote(orgSlug, releaseSlug, result, 3600)
    logger.info('Cached release note', { orgSlug, releaseSlug })
  } catch (error) {
    logger.warn('Cache write failed', { error })
  }

  return result
}

// Static generation for popular release notes
export async function generateStaticParams() {
  // In a real implementation, you'd query for popular release notes
  // For now, return empty array to enable ISR
  return []
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600 // Revalidate every hour

// --- Optional: generateMetadata for SEO --- 
export async function generateMetadata({ params }: Props) {
   const { org_slug: orgSlug, release_slug: releaseSlug } = await params
   const data = await getReleaseNote(orgSlug, releaseSlug)

   if (!data) {
    return {
      title: 'Not Found'
    }
  }

  const { note, organization } = data
  const pageTitle = `${note.title} - ${organization.name || 'Release Notes'}`
  // Basic description - could be improved by extracting text from content_html
  const description = `Release notes for ${note.title}. Published on ${new Date(note.published_at || Date.now()).toLocaleDateString()}.`

  return {
    title: pageTitle,
    description: description,
    openGraph: {
      title: pageTitle,
      description: description,
      images: note.featured_image_url ? [note.featured_image_url] : [], // Use featured image if available
    },
    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description,
        images: note.featured_image_url ? [note.featured_image_url] : [],
    },
  }
}
// --- End generateMetadata --- 

export default async function PublicReleaseNotePage({ params }: Props) {
  const { org_slug: orgSlug, release_slug: releaseSlug } = await params
  const data = await getReleaseNote(orgSlug, releaseSlug)

  if (!data) {
    notFound() // Trigger Next.js 404 page
  }

  const { note, organization } = data
  const publishedDate = note.published_at ? new Date(note.published_at) : null

  // Sanitize HTML content for safe rendering
  const sanitizedHtml = sanitizeHtml(note.content_html || '')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {/* Optional Cover Image */}
        {note.featured_image_url && (
           <div className="w-full h-64 relative">
            <Image 
              src={note.featured_image_url} 
              alt={`${note.title} featured image`} 
              fill
              style={{ objectFit: 'cover' }}
              priority // Prioritize loading cover image
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="px-6 py-8 sm:px-10">
          {/* Optional Org Header */}
          {(organization.name || organization.logo_url) && (
             <div className="mb-6 flex items-center space-x-3">
                {organization.logo_url && (
                    <Image 
                      src={organization.logo_url} 
                      alt={`${organization.name} Logo`} 
                      width={UI_CONSTANTS.LOGO_SIZE} 
                      height={UI_CONSTANTS.LOGO_SIZE} 
                      className="rounded-full" 
                    />
                )}
                {organization.name && (
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{organization.name}</span>
                )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {note.title}
          </h1>

          {/* Publish Date */}
          {publishedDate && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Published on {publishedDate.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)}
            </p>
          )}

          {/* Content Area */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-lg prose-a:text-primary-600 hover:prose-a:text-primary-500"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </div>
      </article>

      {/* Optional Footer */}
      <footer className="max-w-3xl mx-auto mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        Powered by ReleaseNoteAI {/* Or your app name/link */}
      </footer>
    </div>
  )
} 
