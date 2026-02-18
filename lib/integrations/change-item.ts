export type ChangeProvider = 'github' | 'jira' | 'linear'
export type ChangeItemType = 'issue' | 'pr' | 'commit'

export type ChangeItem = {
  provider: ChangeProvider
  externalId: string
  type: ChangeItemType
  title: string
  description: string | null
  status: string | null
  url: string | null
  assignee: string | null
  labels: string[]
  createdAt: string | null
  updatedAt: string | null
  raw?: unknown
}

export function changeItemToTicketId(item: Pick<ChangeItem, 'externalId'>): string {
  return item.externalId
}

export function titleFromCommitMessage(message: string): string {
  const firstLine = message.split('\n')[0]
  return firstLine.trim() || 'Commit'
}
