'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const integrationSchema = z.object({
  repository: z.string().min(1, 'Please select a repository'),
  labels: z.array(z.string()).optional(),
  status: z.enum(['open', 'closed', 'all']).default('closed'),
  lookbackDays: z.number().min(1, 'Must be at least 1 day').max(365, 'Cannot exceed 365 days').default(30),
})

type IntegrationFormData = z.infer<typeof integrationSchema>

export default function NewIntegrationPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [repositories, setRepositories] = useState<Array<{ id: number; full_name: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      status: 'closed',
      lookbackDays: 30,
    },
  })

  const connectGitHub = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      // In a real implementation, this would redirect to GitHub OAuth
      // For now, we'll simulate the OAuth flow
      window.location.href = `/api/auth/github`
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect to GitHub')
    } finally {
      setIsConnecting(false)
    }
  }

  const onSubmit = async (data: IntegrationFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('integrations')
        .insert({
          organization_id: user?.id, // This should be the actual organization ID in production
          type: 'github',
          config: {
            repository: data.repository,
            filters: {
              labels: data.labels,
              status: data.status,
              lookbackDays: data.lookbackDays,
            },
          },
        })

      if (insertError) throw insertError

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save integration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Connect GitHub
          </h1>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            {!repositories.length ? (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  Connect your GitHub account
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by connecting your GitHub account to fetch repositories and issues.
                </p>
                <div className="mt-6">
                  <button
                    onClick={connectGitHub}
                    disabled={isConnecting}
                    className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect GitHub'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="repository"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Select Repository
                  </label>
                  <select
                    id="repository"
                    {...register('repository')}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="">Select a repository</option>
                    {repositories.map((repo) => (
                      <option key={repo.id} value={repo.full_name}>
                        {repo.full_name}
                      </option>
                    ))}
                  </select>
                  {errors.repository && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.repository.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Ticket Status
                  </label>
                  <select
                    id="status"
                    {...register('status')}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="closed">Closed</option>
                    <option value="open">Open</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="lookbackDays"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Lookback Period (days)
                  </label>
                  <input
                    type="number"
                    id="lookbackDays"
                    {...register('lookbackDays', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                  {errors.lookbackDays && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.lookbackDays.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Integration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 