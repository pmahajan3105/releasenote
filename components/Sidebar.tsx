"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <aside className="h-screen w-64 bg-white shadow">
      <div className="flex h-full flex-col">
        <nav className="flex-1 space-y-1 px-2 py-4">
          <Link
            href="/dashboard"
            className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
              pathname === "/dashboard"
                ? "bg-primary-100 text-primary-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {/* Dashboard Icon SVG */}
            <svg
              className="mr-3 h-6 w-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-10l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/dashboard/organizations"
            className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
              isActive("/dashboard/organizations")
                ? "bg-primary-100 text-primary-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {/* Organizations Icon SVG */}
            <svg
              className="mr-3 h-6 w-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
              />
            </svg>
            Organizations
          </Link>

          <Link
            href="/dashboard/integrations"
            className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
              isActive("/dashboard/integrations")
                ? "bg-primary-100 text-primary-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {/* Integrations Icon SVG */}
            <svg
              className="mr-3 h-6 w-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7"
              />
            </svg>
            Integrations
          </Link>

          <button
            type="button"
            onClick={() => router.push("/dashboard/release-notes")}
            className={`group w-full flex items-center rounded-md px-2 py-2 text-sm font-medium ${
              isActive("/dashboard/release-notes")
                ? "bg-primary-100 text-primary-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {/* Release Notes Icon SVG */}
            <svg
              className="mr-3 h-6 w-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Release Notes
          </button>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <Link
            href="/dashboard/settings"
            className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
              isActive("/dashboard/settings")
                ? "bg-primary-100 text-primary-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {/* Settings Icon SVG */}
            <svg
              className="mr-3 h-6 w-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c.426 1.756 2.924 1.756 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();

//   // Returns true if current pathname starts with given path (handles nested routes)
//   const isActive = (path: string) => pathname?.startsWith(path);

//   return (
//     <aside className="h-screen w-64 bg-white shadow">
//       <div className="flex h-full flex-col">
//         <nav className="flex-1 space-y-1 px-2 py-4">

//           {/* Dashboard Link */}
//           <Link
//             href="/dashboard"
//             className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               pathname === "/dashboard"
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             <svg
//               className="mr-3 h-6 w-6 flex-shrink-0"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//               aria-hidden="true"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-10l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6"
//               />
//             </svg>
//             Dashboard
//           </Link>

//           {/* Organizations Link */}
//           <Link
//             href="/dashboard/organizations"
//             className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               isActive("/dashboard/organizations")
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             <svg
//               className="mr-3 h-6 w-6 flex-shrink-0"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//               aria-hidden="true"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
//               />
//             </svg>
//             Organizations
//           </Link>

//           {/* Integrations Link */}
//           <Link
//             href="/dashboard/integrations"
//             className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               isActive("/dashboard/integrations")
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             <svg
//               className="mr-3 h-6 w-6 flex-shrink-0"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//               aria-hidden="true"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 10V3L4 14h7v7l9-11h-7"
//               />
//             </svg>
//             Integrations
//           </Link>

//           {/* Release Notes Button - uses router.push */}
//           <button
//             type="button"
//             onClick={() => router.push("/dashboard/release-notes")}
//             className={`group w-full flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               isActive("/dashboard/release-notes")
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             <svg
//               className="mr-3 h-6 w-6 flex-shrink-0"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//               aria-hidden="true"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//               />
//             </svg>
//             Release Notes
//           </button>
//         </nav>

//         {/* Settings Link */}
//         <div className="border-t border-gray-200 p-4">
//           <Link
//             href="/dashboard/settings"
//             className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               isActive("/dashboard/settings")
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             <svg
//               className="mr-3 h-6 w-6 flex-shrink-0"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//               aria-hidden="true"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c.426 1.756 2.924 1.756 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//               />
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//               />
//             </svg>
//             Settings
//           </Link>
//         </div>
//       </div>
//     </aside>
//   );
// }
