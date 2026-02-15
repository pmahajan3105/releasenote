import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Database } from '@/types/supabase'
import { EnhancedReleaseNotesList } from '@/components/public/enhanced-release-notes-list'

type Props = {
  params: Promise<{ org_slug: string }>
}

type OrganizationPreview = Pick<
  Database['public']['Tables']['organizations']['Row'],
  | 'id'
  | 'name'
  | 'description'
  | 'meta_title'
  | 'meta_description'
  | 'meta_image_url'
  | 'favicon_url'
  | 'brand_color'
  | 'custom_domain'
  | 'domain_verified'
  | 'logo_url'
>

type RawReleaseNotePreview = Pick<
  Database['public']['Tables']['release_notes']['Row'],
  'id' | 'title' | 'slug' | 'published_at' | 'content_html' | 'cover_image_url' | 'views'
>

type ReleaseNotesPageData = {
  organization: OrganizationPreview
  releaseNotes: Array<{
    id: string
    title: string
    slug: string
    published_at: string
    content_html?: string
    featured_image_url?: string
    views?: number
  }>
}

async function getOrganizationReleaseNotes(orgSlug: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Fetch the organization with branding info
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select(`
      id, 
      name, 
      description,
      meta_title,
      meta_description,
      meta_image_url,
      favicon_url,
      brand_color,
      custom_domain,
      domain_verified,
      logo_url
    `)
    .eq('slug', orgSlug)
    .single()

  if (orgError || !orgData) {
    return null
  }

  // Fetch published release notes with enhanced fields
  const { data: notesData, error: notesError } = await supabase
    .from('release_notes')
    .select('id, title, slug, published_at, content_html, cover_image_url, views')
    .eq('organization_id', orgData.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  if (notesError) {
    console.error('Error fetching release notes:', notesError)
    return null
  }

  const organization = orgData as OrganizationPreview
  const releaseNotes = ((notesData as RawReleaseNotePreview[] | null) ?? [])
    .filter(
      (
        note
      ): note is RawReleaseNotePreview & {
        slug: string
        published_at: string
      } => typeof note.slug === 'string' && typeof note.published_at === 'string'
    )
    .map((note) => ({
      id: note.id,
      title: note.title,
      slug: note.slug,
      published_at: note.published_at,
      content_html: note.content_html ?? undefined,
      featured_image_url: note.cover_image_url ?? undefined,
      views: note.views,
    }))

  const result: ReleaseNotesPageData = {
    organization,
    releaseNotes,
  }

  return result
}

export async function generateMetadata({ params }: Props) {
  const { org_slug: orgSlug } = await params
  const data = await getOrganizationReleaseNotes(orgSlug)

  if (!data) {
    return {
      title: 'Not Found'
    }
  }

  const { organization } = data
  const title = organization.meta_title || `${organization.name} - Release Notes`
  const description = organization.meta_description || organization.description || `Latest release notes from ${organization.name}`
  const imageUrl = organization.meta_image_url

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: organization.name,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }

  // Add favicon if provided, else fallback to default
  metadata.icons = {
    icon: organization.favicon_url || '/branding/favicon-placeholder.ico',
    shortcut: organization.favicon_url || '/branding/favicon-placeholder.ico',
  }

  return metadata
}

export default async function OrganizationReleaseNotesPage({ params }: Props) {
  const { org_slug: orgSlug } = await params
  const data = await getOrganizationReleaseNotes(orgSlug)

  if (!data) {
    notFound()
  }

  const { organization, releaseNotes } = data

  return (
    <EnhancedReleaseNotesList
      organization={{
        name: organization.name,
        description: organization.description ?? undefined,
        logo_url: organization.logo_url ?? undefined,
        brand_color: organization.brand_color ?? undefined,
      }}
      releaseNotes={releaseNotes}
      orgSlug={orgSlug}
    />
  )
}
