import { redirect } from 'next/navigation'

export default function StartReleaseRedirectPage() {
  redirect('/dashboard/releases/new')
}

