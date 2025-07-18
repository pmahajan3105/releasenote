"use client"

import React from "react"
import { cn } from "../../lib/utils"

interface TreeViewItemProps {
  label: string
  icon?: React.ReactNode
  selected?: boolean
  onClick?: () => void
  children?: React.ReactNode
}

interface TreeViewProps {
  children: React.ReactNode
  className?: string
}

const TreeViewItem = React.forwardRef<HTMLDivElement, TreeViewItemProps>(
  ({ label, icon, selected = false, onClick, children, ...props }, ref) => {
    return (
      <div className={cn("space-y-1")} ref={ref} {...props}>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors",
            selected
              ? "bg-neutral-100 text-neutral-900"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          )}
          onClick={onClick}
        >
          {icon && (
            <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              {icon}
            </span>
          )}
          <span className="flex-1">{label}</span>
        </div>
        {children && (
          <div className="ml-6 space-y-1">
            {children}
          </div>
        )}
      </div>
    )
  }
)
TreeViewItem.displayName = "TreeViewItem"

const TreeView = React.forwardRef<HTMLDivElement, TreeViewProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cn("space-y-1", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TreeView.displayName = "TreeView"

// Add Item as a property of TreeView for compound component pattern
const TreeViewComponent = Object.assign(TreeView, {
  Item: TreeViewItem,
})

export { TreeViewComponent as TreeView }
