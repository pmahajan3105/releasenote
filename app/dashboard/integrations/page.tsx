import { redirect } from 'next/navigation'

export default function DashboardIntegrationsRedirectPage() {
  redirect('/integrations/manage')
}
