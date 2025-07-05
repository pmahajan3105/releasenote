import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white shadow dark:bg-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Release Notes Generator. All rights reserved.
            </p>
          </div>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 