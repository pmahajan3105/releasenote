"use client";

import React, { ReactNode, KeyboardEvent } from "react";

interface SettingsMenuProps {
  children: ReactNode;
  className?: string;
}

export function SettingsMenu({ children, className }: SettingsMenuProps) {
  return (
    <nav
      role="menu"
      aria-label="Settings"
      className={`flex flex-col gap-4 rounded-md border border-neutral-border bg-neutral-50 px-4 py-6 ${className ?? ""}`}
    >
      {children}
    </nav>
  );
}

interface SettingsMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

SettingsMenu.Item = function SettingsMenuItem({
  label,
  icon,
  selected = false,
  onClick,
  className,
  disabled = false,
  ...rest
}: SettingsMenuItemProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  }

  return (
    <button
      role="menuitem"
      tabIndex={0}
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
        selected ? "bg-brand-200 text-brand-900" : "text-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className ?? ""}`}
      {...rest}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="flex-grow">{label}</span>
    </button>
  );
};

export default SettingsMenu;

