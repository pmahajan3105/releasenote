'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type State =
  | { status: 'idle'; message?: string }
  | { status: 'loading'; message?: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState<State>({ status: 'idle' })

  useEffect(() => {
    if (!token) return

    const run = async () => {
      setState({ status: 'loading' })

      try {
        const response = await fetch('/api/subscribers/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = (await response.json().catch(() => ({}))) as { message?: string; error?: string }
        if (!response.ok) {
          throw new Error(data.error || 'Failed to unsubscribe')
        }

        setState({ status: 'success', message: data.message || 'You have been unsubscribed.' })
      } catch (error) {
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to unsubscribe',
        })
      }
    }

    void run()
  }, [token])

  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Unsubscribe</h1>

      {!token && (
        <p className="mt-4 text-gray-600">
          This link is missing an unsubscribe token. Please use the unsubscribe link from the email you received.
        </p>
      )}

      {token && state.status === 'loading' && <p className="mt-4 text-gray-600">Unsubscribing…</p>}

      {token && state.status === 'success' && <p className="mt-4 text-gray-600">{state.message}</p>}

      {token && state.status === 'error' && <p className="mt-4 text-red-700">{state.message}</p>}

      <div className="mt-8">
        <Link href="/" className="text-sm text-primary-600 hover:underline">
          Return to home
        </Link>
      </div>
    </main>
  )
}

function UnsubscribeFallback() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Unsubscribe</h1>
      <p className="mt-4 text-gray-600">Loading unsubscribe details…</p>
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeFallback />}>
      <UnsubscribeContent />
    </Suspense>
  )
}
