import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-1/2 lg:w-1/3">
        <h3 className="text-2xl font-bold text-center text-red-600">Authentication Error</h3>
        <p className="mt-4 text-center text-gray-700">
          There was a problem authenticating your magic link. It might have expired or already been used.
        </p>
        <p className="mt-2 text-center text-gray-700">
          Please try signing in again.
        </p>
        <div className="flex items-baseline justify-center mt-6">
          <Link href="/login">
            <span className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 cursor-pointer">
              Go to Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
} 