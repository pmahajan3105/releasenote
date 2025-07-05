import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type Organization = Database['public']['Tables']['organizations']['Row']
type Integration = Database['public']['Tables']['integrations']['Row']
type ReleaseNote = Database['public']['Tables']['release_notes']['Row']

// Organizations
export async function getOrganizations(userId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrganization(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createOrganization(
  organization: Omit<Organization, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('organizations')
    .insert(organization)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOrganization(
  id: string,
  organization: Partial<Omit<Organization, 'id' | 'created_at'>>
) {
  const { data, error } = await supabase
    .from('organizations')
    .update(organization)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteOrganization(id: string) {
  const { error } = await supabase.from('organizations').delete().eq('id', id)
  if (error) throw error
}

// Integrations
export async function getIntegrations(organizationId: string) {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getIntegration(id: string) {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createIntegration(
  integration: Omit<Integration, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('integrations')
    .insert(integration)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateIntegration(
  id: string,
  integration: Partial<Omit<Integration, 'id' | 'created_at'>>
) {
  const { data, error } = await supabase
    .from('integrations')
    .update(integration)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteIntegration(id: string) {
  const { error } = await supabase.from('integrations').delete().eq('id', id)
  if (error) throw error
}

// Release Notes
export async function getReleaseNotes(organizationId: string) {
  const { data, error } = await supabase
    .from('release_notes')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getReleaseNote(id: string) {
  const { data, error } = await supabase
    .from('release_notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createReleaseNote(
  releaseNote: Omit<ReleaseNote, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('release_notes')
    .insert(releaseNote)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateReleaseNote(
  id: string,
  releaseNote: Partial<Omit<ReleaseNote, 'id' | 'created_at'>>
) {
  const { data, error } = await supabase
    .from('release_notes')
    .update(releaseNote)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteReleaseNote(id: string) {
  const { error } = await supabase.from('release_notes').delete().eq('id', id)
  if (error) throw error
} 