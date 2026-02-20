import { Suspense } from 'react'
import ReleaseBuilderClient from './release-builder-client'

function BuilderFallback() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="h-24 animate-pulse rounded bg-gray-200" />
      <div className="h-80 animate-pulse rounded bg-gray-200" />
    </div>
  )
}

export default function ReleaseBuilderPage() {
  return (
    <Suspense fallback={<BuilderFallback />}>
      <ReleaseBuilderClient />
    </Suspense>
  )
}
