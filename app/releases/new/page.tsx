import { redirect } from 'next/navigation'

export default function ReleasesNewRedirect() {
  redirect('/dashboard/releases/start')
}
