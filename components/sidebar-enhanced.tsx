"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { TreeView } from "./ui/tree-view"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { User, LogOut, Settings, Home, Building2, Zap, FileText, Layout, Star, Globe } from "lucide-react"
import { useAuthStore } from "../lib/store"
import { cn } from "../lib/utils"

interface SidebarProps {
  className?: string
}

export default function EnhancedSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((state: any) => state.user)

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-4 h-4" />
    },
    {
      label: "Organizations", 
      href: "/dashboard/organizations",
      icon: <Building2 className="w-4 h-4" />
    },
    {
      label: "Integrations",
      href: "/dashboard/integrations", 
      icon: <Zap className="w-4 h-4" />
    },
    {
      label: "Release Notes",
      href: "/dashboard/release-notes",
      icon: <FileText className="w-4 h-4" />
    },
    {
      label: "Templates",
      href: "/dashboard/templates",
      icon: <Layout className="w-4 h-4" />
    },
    {
      label: "Showcase",
      href: "/showcase",
      icon: <Star className="w-4 h-4" />
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="w-4 h-4" />
    },
    {
      label: "Settings Hub",
      href: "/dashboard/settings/organization-enhanced",
      icon: <Settings className="w-4 h-4" />
    },
    {
      label: "Minimal Hub",
      href: "/dashboard/settings/minimal-hub",
      icon: <Settings className="w-4 h-4" />
    },
    {
      label: "Domain Settings",
      href: "/dashboard/settings/domain",
      icon: <Globe className="w-4 h-4" />
    }
  ]

  const handleSignOut = async () => {
    // Add sign out logic here
    window.location.href = '/login'
  }

  return (
    <div className={cn(
      "flex h-full w-48 flex-col items-start justify-between bg-neutral-50 border-r border-neutral-200",
      className
    )}>
      <div className="flex w-full flex-col items-start gap-6 px-4 py-6">
        {/* Logo Section */}
        <div className="flex w-full items-center gap-2">
          <img
            className="h-6 w-6 flex-none object-cover rounded"
            src="/rn-logo.svg"
            alt="AI Release Notes"
          />
          <span className="text-lg font-semibold text-neutral-900">
            AI Release Notes
          </span>
        </div>

        {/* Navigation */}
        <TreeView className="w-full">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <TreeView.Item
                selected={isActive(item.href)}
                label={item.label}
                icon={item.icon}
              />
            </Link>
          ))}
        </TreeView>
      </div>

      {/* User Section */}
      <div className="flex w-full flex-col items-start gap-3 border-t border-neutral-200 px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex w-full items-center gap-2 cursor-pointer hover:bg-neutral-100 rounded-md p-2 transition-colors">
              <Avatar size="small">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-neutral-900 truncate">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" sideOffset={4}>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
