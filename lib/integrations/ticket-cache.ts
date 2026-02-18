import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { ChangeItem } from '@/lib/integrations/change-item'
import { changeItemToTicketId } from '@/lib/integrations/change-item'

export function changeItemToTicketCacheRow(
  organizationId: string,
  item: ChangeItem
): Database['public']['Tables']['ticket_cache']['Insert'] {
  const now = new Date().toISOString()

  const metadata: Record<string, unknown> = {
    type: item.type,
  }

  if (item.labels.length > 0) {
    metadata.labels = item.labels
  }

  if (item.raw) {
    metadata.raw = item.raw
  }

  return {
    organization_id: organizationId,
    integration_type: item.provider,
    ticket_id: changeItemToTicketId(item),
    title: item.title,
    description: item.description,
    status: item.status,
    assignee: item.assignee,
    url: item.url,
    metadata,
    cached_at: now,
    created_at: item.createdAt ?? now,
    updated_at: item.updatedAt ?? null,
  }
}

export async function cacheChangeItems(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  items: ChangeItem[]
): Promise<void> {
  if (items.length === 0) {
    return
  }

  try {
    const rows = items.map((item) => changeItemToTicketCacheRow(organizationId, item))
    const { error } = await supabase.from('ticket_cache').upsert(rows, {
      onConflict: 'organization_id,integration_type,ticket_id',
    })

    if (error) {
      console.error('Ticket cache upsert failed:', error)
    }
  } catch (error) {
    console.error('Ticket cache upsert failed:', error)
  }
}

