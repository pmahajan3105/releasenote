import { redirect } from 'next/navigation'

export default function LegacyPublishedReleaseNotesPage() {
  redirect('/dashboard/releases')
}
