import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Database } from '@/types/supabase' // Assuming you have types generated
import Image from 'next/image'

type Props = {
  params: { org_slug: string; release_slug: string }
}

// Function to fetch release note data server-side
// It uses a server client that respects RLS policies
async function getReleaseNote(orgSlug: string, releaseSlug: string) {
  // Create a Supabase client configured for server components
  // This client doesn't rely on user sessions for reads if RLS allows
  const supabase = createServerComponentClient<Database>({ cookies })

  // Fetch the organization ID based on the slug first
  // Adjust table/column names as per your schema
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, logo_url') // Select needed org details
    .eq('slug', orgSlug)
    .single()

  if (orgError || !orgData) {
    console.error('Organization not found:', orgError)
    return null // Org not found
  }

  // Fetch the release note using the org ID and release slug
  const { data: noteData, error: noteError } = await supabase
    .from('release_notes')
    .select('title, content_html, published_at, cover_image_url')
    .eq('organization_id', orgData.id)
    .eq('slug', releaseSlug)
    .eq('status', 'published') // Ensure it's published
    .single()

  if (noteError || !noteData) {
    console.error('Published release note not found:', noteError)
    return null // Note not found or not published
  }

  return {
    note: noteData,
    organization: {
      name: orgData.name,
      logo_url: orgData.logo_url,
    }
  }
}

// --- Optional: generateMetadata for SEO --- 
export async function generateMetadata({ params }: Props) {
   const data = await getReleaseNote(params.org_slug, params.release_slug)

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
      images: note.cover_image_url ? [note.cover_image_url] : [], // Use cover image if available
    },
    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description,
        images: note.cover_image_url ? [note.cover_image_url] : [],
    },
  }
}
// --- End generateMetadata --- 

export default async function PublicReleaseNotePage({ params }: Props) {
  const data = await getReleaseNote(params.org_slug, params.release_slug)

  if (!data) {
    notFound() // Trigger Next.js 404 page
  }

  const { note, organization } = data
  const publishedDate = note.published_at ? new Date(note.published_at) : null

  // WARNING: Using dangerouslySetInnerHTML requires you to trust or sanitize
  // the HTML content stored in `note.content_html`. 
  // Consider server-side sanitization (e.g., with DOMPurify) before saving 
  // to the database or before rendering here to prevent XSS attacks.
  const sanitizedHtml = note.content_html || ''; // Placeholder for actual sanitization

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {/* Optional Cover Image */}
        {note.cover_image_url && (
           <div className="w-full h-64 relative">
            <Image 
              src={note.cover_image_url} 
              alt={`${note.title} cover image`} 
              layout="fill"
              objectFit="cover"
              priority // Prioritize loading cover image
            />
          </div>
        )}

        <div className="px-6 py-8 sm:px-10">
          {/* Optional Org Header */}
          {(organization.name || organization.logo_url) && (
             <div className="mb-6 flex items-center space-x-3">
                {organization.logo_url && (
                    <Image src={organization.logo_url} alt={`${organization.name} Logo`} width={40} height={40} className="rounded-full" />
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
              Published on {publishedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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