import { redirect } from 'next/navigation'

export default function LegacyCreateReleaseNotePage() {
  redirect('/dashboard/releases/new')
}
