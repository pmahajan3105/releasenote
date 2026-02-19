'use client'
import React from 'react'
import Link from 'next/link'
import {
    HomeIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    PencilIcon,
    EyeIcon,
    UserGroupIcon,
    ArrowLeftOnRectangleIcon,
    LinkIcon,
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Release Notes', href: '/dashboard/releases', icon: DocumentTextIcon },
    { name: 'Integrations', href: '/dashboard/integrations', icon: LinkIcon },
    { name: 'AI Context', href: '/dashboard/ai-context', icon: PencilIcon },
    { name: 'Templates', href: '/dashboard/templates', icon: EyeIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
    { name: 'Support & Help', href: 'mailto:help@releasenote.ai', icon: UserGroupIcon },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Static sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary-600 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center bg-primary-700 px-4">
                        <span className="text-white font-semibold text-xl">ReleaseNoteAI</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-primary-200 hover:text-white hover:bg-primary-700 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                            >
                                                <item.icon
                                                    className="text-primary-200 group-hover:text-white h-6 w-6 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <div className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary-200">
                                    <ArrowLeftOnRectangleIcon
                                        className="h-6 w-6 shrink-0 text-primary-200"
                                        aria-hidden="true"
                                    />
                                    Sign out
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <main className="py-10 lg:pl-72">
                <div className="px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
} 
