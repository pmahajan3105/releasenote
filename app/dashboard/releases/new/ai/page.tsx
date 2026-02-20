import { redirect } from 'next/navigation'

export default function LegacyAiBuilderRedirectPage() {
  redirect('/dashboard/releases/new')
}

