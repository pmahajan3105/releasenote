"use client"

import React from "react"
import { cn } from "../../lib/utils"

interface SettingsMenuItemProps {
  selected?: boolean
  icon?: React.ReactNode
  label: string
  onClick?: () => void
}

interface SettingsMenuProps {
  children: React.ReactNode
  className?: string
}

const SettingsMenuItem = React.forwardRef<HTMLDivElement, SettingsMenuItemProps>(
  ({ selected = false, icon, label, onClick, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors w-full",
          selected
            ? "bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {icon && (
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {icon}
          </span>
        )}
        <span className="flex-1">{label}</span>
      </div>
    )
  }
)
SettingsMenuItem.displayName = "SettingsMenuItem"

const SettingsMenu = React.forwardRef<HTMLDivElement, SettingsMenuProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "w-64 h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 space-y-6",
          "md:w-64 md:border-r md:border-b-0 w-full border-b border-r-0 h-auto p-4 md:p-6",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SettingsMenu.displayName = "SettingsMenu"

// Compound component pattern
const SettingsMenuNamespace = Object.assign(SettingsMenu, {
  Item: SettingsMenuItem,
})

export { SettingsMenuNamespace as SettingsMenu }
