'use client'

import Link from 'next/link'
import { SparklesIcon, DocumentDuplicateIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

const options = [
  {
    name: 'Create with AI',
    description: 'Generate notes automatically by selecting an integration and tickets.',
    href: '/dashboard/releases/new/ai',
    icon: SparklesIcon,
  },
  {
    name: 'Create from Template',
    description: 'Start with a pre-defined structure or your own custom template.',
    href: '/dashboard/releases/new/template',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Create from Scratch',
    description: 'Begin with a blank canvas and write your release notes manually.',
    href: '/dashboard/releases/new/scratch',
    icon: PencilSquareIcon,
  },
]

export default function StartReleasePage() {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow dark:divide-gray-700 dark:bg-gray-800">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          How would you like to create your release notes?
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose an option below to get started.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <ul role="list" className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 py-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-700">
          {options.map((option, index) => (
            <li key={index} className="flow-root">
              <Link
                href={option.href}
                className="relative -m-2 flex items-start space-x-4 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500`}
                >
                  <option.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {option.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 
