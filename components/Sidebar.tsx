'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  BarChart2Icon,
  ChevronDownIcon,
  FileTextIcon,
  LifeBuoyIcon,
  LogOutIcon,
  SettingsIcon,
  StarIcon,
} from 'lucide-react'  // Ensure correct icons are imported here
import { Button } from '@/ui/components/Button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/collapsible'
import { Input } from '@/ui/input'
import { useAuthStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>(['release-notes'])

  const { user, profile, signOut } = useAuthStore()

  if (!user) return null

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true
    return pathname === path || pathname.startsWith(path)
  }

  const menuItems = [
    {
      icon: <BarChart2Icon className="w-6 h-6" />,
      label: 'Dashboard',
      path: '/dashboard',
      active: isActive('/dashboard'),
    },
    {
      icon: <FileTextIcon className="w-6 h-6" />,  // Changed 'FileTextIcon' to a valid imported icon
      label: 'Release Notes',
      hasDropdown: true,
      section: 'release-notes',
      active: isActive('/release-notes') || isActive('/dashboard/releases'),
      subItems: [
        { label: 'View All', path: '/release-notes' },
        { label: 'Create New', path: '/release-notes/create' }, // Updated paths
        { label: 'From Template', path: '/release-notes/create/template' },
        { label: 'From Scratch', path: '/release-notes/create/scratch' },
      ],
    },
    {
      icon: <SettingsIcon className="w-6 h-6" />,
      label: 'Configuration',
      path: '/dashboard/configuration',
      active: isActive('/dashboard/configuration'),
    },
    {
      icon: <LifeBuoyIcon className="w-6 h-6" />,
      label: 'Support & Help',
      path: 'mailto:help@yourdomain.com',
      active: false,
    },
  ]

  const footerItems = [
    {
      icon: <SettingsIcon className="w-6 h-6" />,
      label: 'Settings',
      path: '/dashboard/settings',
      active: isActive('/dashboard/settings'),
    },
  ]

  return (
    <aside className="flex flex-col w-72 h-full bg-white border-r border-gray-200">
      <div className="flex flex-col h-full justify-between">
        <div className="flex flex-col gap-6 pt-8">
          <header className="pl-6 pr-5">
            <div className="flex items-center">
              <Image
                src="/rn-logo.svg"
                alt="Release Notes AI"
                width={163}
                height={55}
                priority
                className="h-auto w-auto max-w-[163px] max-h-[55px]"
                onError={() => console.warn('Sidebar logo failed to load')}
              />
            </div>
          </header>

          <div className="px-6">
            <div className="w-full">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-xs focus-within:ring-2 focus-within:ring-indigo-500">
                  <Input
                    className="border-none shadow-none p-0 text-gray-600 placeholder-gray-400 focus:ring-0 w-full"
                    placeholder="Search"
                    aria-label="Search menu"
                  />
                </div>
              </div>
            </div>
          </div>

          <nav className="px-4">
            {menuItems.map((item, idx) =>
              item.hasDropdown ? (
                <Collapsible
                  key={idx}
                  open={openSections.includes(item.section!)}
                  onOpenChange={() => toggleSection(item.section!)}
                  className="w-full"
                >
                  <CollapsibleTrigger className="w-full">
                    <div
                      className={`flex justify-between items-center w-full px-3 py-2 rounded-md cursor-pointer select-none ${
                        item.active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-semibold tracking-wide">{item.label}</span>
                      </div>
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${
                          openSections.includes(item.section!) ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>
                  {item.subItems && (
                    <CollapsibleContent className="px-4 mt-1">
                      <div className="flex flex-col gap-2 ml-3">
                        {item.subItems.map((subItem, sidx) => (
                          <Link key={sidx} href={subItem.path}>
                            <Button
                              variant="outline"
                              className={`w-full justify-start ${
                                isActive(subItem.path)
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {subItem.label}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ) : (
                <Link key={idx} href={item.path!}>
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${
                      item.active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </Button>
                </Link>
              )
            )}
          </nav>
        </div>

        <footer className="px-6 py-4 border-t border-gray-200 flex flex-col gap-4">
          {footerItems.map((item, idx) => (
            <Link key={idx} href={item.path}>
              <Button
                variant="outline"
                className={`w-full justify-start ${
                  item.active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Button>
            </Link>
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-gray-300">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-gray-300">
                <AvatarImage src={profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? "/avatar.png"} alt="User Avatar" />
                <AvatarFallback>
                  {(profile?.first_name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {profile ? `${profile.first_name} ${profile.last_name}` : user?.email ?? "User"}
                </p>
                <p className="text-xs text-gray-500">{user?.email ?? ''}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="small"
              aria-label="Sign out"
              onClick={() => signOut()}
              className="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <LogOutIcon className="w-5 h-5" />
            </Button>
          </div>
        </footer>
      </div>
    </aside>
  )
}

export default Sidebar


// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();

//   const isActive = (path: string) => pathname?.startsWith(path);

//   return (
//     <aside className="h-screen w-64 bg-white shadow">
//       <div className="flex h-full flex-col">
//         <nav className="flex-1 space-y-1 px-2 py-4">
//           <Link
//             href="/dashboard"
//             className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               pathname === "/dashboard"
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             {/* Dashboard Icon SVG */}
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

//           <Link
//             href="/dashboard/organizations"
//             className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               isActive("/dashboard/organizations")
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             {/* Organizations Icon SVG */}
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

//           <Link
//             href="/dashboard/integrations"
//             className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               isActive("/dashboard/integrations")
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             {/* Integrations Icon SVG */}
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

//           <button
//             type="button"
//             onClick={() => router.push("/dashboard/release-notes")}
//             className={`group w-full flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               isActive("/dashboard/release-notes")
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             {/* Release Notes Icon SVG */}
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

//         <div className="border-t border-gray-200 p-4">
//           <Link
//             href="/dashboard/settings"
//             className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
//               isActive("/dashboard/settings")
//                 ? "bg-primary-100 text-primary-900"
//                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//             }`}
//           >
//             {/* Settings Icon SVG */}
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