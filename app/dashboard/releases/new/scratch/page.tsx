import { redirect } from 'next/navigation'

export default function LegacyScratchBuilderRedirectPage() {
  redirect('/dashboard/releases/new')
}

