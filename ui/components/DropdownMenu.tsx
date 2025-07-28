"use client";

import React, { ReactNode, MouseEvent, KeyboardEvent } from "react";

interface DropdownMenuRootProps {
  children: ReactNode;
  className?: string;
}

/**
 * Root wrapper for DropdownMenu — renders the dropdown container.
 * Includes accessibility attributes.
 */
function DropdownMenuRoot({ children, className = "" }: DropdownMenuRootProps) {
  return (
    <div
      role="menu"
      tabIndex={-1}
      className={`min-w-[200px] rounded-md border border-solid border-neutral-200 bg-white p-1 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

interface DropdownMenuTriggerProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Dropdown trigger button component
 */
const DropdownMenuTrigger = ({ children, onClick, className = "" }: DropdownMenuTriggerProps) => {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded="false" // you can later manage expanded state if needed
      onClick={onClick}
      className={`inline-flex items-center rounded px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
    >
      {children}
    </button>
  );
};

interface DropdownMenuContentProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Dropdown menu content container component
 */
const DropdownMenuContent = ({ children, className = "", style }: DropdownMenuContentProps) => {
  return (
    <div
      role="menu"
      tabIndex={-1}
      style={style}
      className={`absolute z-50 mt-2 rounded-md border border-solid border-neutral-200 bg-white p-1 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

interface DropdownMenuItemProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

/**
 * Dropdown item — clickable menu item with optional icon
 * Supports keyboard navigation via Enter and Space keys.
 */
function DropdownMenuItem({
  children,
  icon,
  onClick,
  className = "",
}: DropdownMenuItemProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick && onClick(e as unknown as MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-2 rounded-sm px-3 py-2 cursor-pointer hover:bg-neutral-50 transition-colors text-body font-body text-default-font focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${className}`}
    >
      {icon && <span className="h-4 w-4 flex-none text-subtext-color">{icon}</span>}
      <span className="flex-grow">{children}</span>
    </div>
  );
}

interface DropdownMenuDividerProps {
  className?: string;
}

/**
 * Divider line for separating dropdown menu sections
 */
function DropdownMenuDivider({ className = "" }: DropdownMenuDividerProps) {
  return <div className={`h-px bg-neutral-200 my-1 ${className}`} role="separator" />;
}

/**
 * Attach all subcomponents to DropdownMenuRoot
 */
const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Divider: DropdownMenuDivider,
});

export default DropdownMenu;

