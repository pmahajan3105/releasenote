import { redirect } from 'next/navigation'

export default function LegacyTemplateBuilderRedirectPage() {
  redirect('/dashboard/releases/new?intent=template')
}
