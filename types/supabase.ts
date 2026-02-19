// Backward-compatible re-export.
//
// Historically this repo had two diverging DB type files (`types/supabase.ts` and
// `types/database.ts`). `types/database.ts` is now the canonical source of truth.
export type {
  Database,
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationMemberInsert,
  OrganizationMemberUpdate,
  Integration,
  IntegrationInsert,
  IntegrationUpdate,
  ReleaseNote,
  ReleaseNoteInsert,
  ReleaseNoteUpdate,
  Template,
  TemplateInsert,
  TemplateUpdate,
  Subscriber,
  SubscriberInsert,
  SubscriberUpdate,
  TicketCache,
  TicketCacheInsert,
  TicketCacheUpdate,
} from './database'

import type { Database as CanonicalDatabase } from './database'

export type ReleaseNoteWithOrganization = CanonicalDatabase['public']['Tables']['release_notes']['Row'] & {
  organizations: Pick<CanonicalDatabase['public']['Tables']['organizations']['Row'], 'name' | 'logo_url'>
}

