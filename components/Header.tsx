'use client';

import React from 'react';
import Link from 'next/link';
// import { usePathname } from 'next/navigation'; // No longer needed for this simple version

export default function Header() {
  // const pathname = usePathname(); // No longer needed

  return (
    <header className="bg-white shadow dark:bg-gray-800">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800 dark:text-white">
              ReleaseNote.ai
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Always show links relevant to a logged-in user */}
            <Link
              href="/dashboard/release-notes"
              className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Release Notes
            </Link>
            <Link
              href="/dashboard/settings" // Placeholder for future settings page
              className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Settings
            </Link>
            {/* We can add a Logout button/action here later */}
          </div>
        </div>
      </nav>
    </header>
  );
} 