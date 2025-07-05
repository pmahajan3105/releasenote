import React from 'react';
import Link from 'next/link';
import { getReleaseNotesList } from './actions'; // Import the server action
import { Database } from '@/types/supabase'; // Import Database type

// Define the type for a single release note based on your Supabase schema
type ReleaseNote = Database['public']['Tables']['release_notes']['Row'];

// Helper function to format dates (optional)
function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

// Server Component to display the list of release notes
export default async function ReleaseNotesListPage() {
    // Fetch data directly in the Server Component using the Server Action
    const releaseNotes: ReleaseNote[] = await getReleaseNotesList();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Release Notes</h1>
                <Link href="/dashboard/release-notes/new">
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                        + Create New
                    </span>
                </Link>
            </div>

            {/* Tab Placeholders - Add state/logic later */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-blue-600 border-blue-600">
                        Drafts
                    </button>
                    <button className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300">
                        Published
                    </button>
                </nav>
            </div>

            {/* Release Notes List or Empty State */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                {releaseNotes.length === 0 ? (
                    <div className="px-4 py-5 sm:px-6">
                        <p className="text-center text-gray-500 dark:text-gray-400">No release notes found. Create your first one!</p>
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {releaseNotes.map((note) => (
                            <li key={note.id}>
                                <Link href={`/dashboard/release-notes/${note.id}/edit`} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-blue-600 truncate dark:text-blue-400">
                                                {note.title || 'Untitled'}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${note.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                                                    }`}>
                                                    {note.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                {/* Add author info later if needed */}
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
                                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                <p>
                                                    Created: <time dateTime={note.created_at ? new Date(note.created_at).toISOString() : undefined}>{formatDate(note.created_at)}</time>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
} 