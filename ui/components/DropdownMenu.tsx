"use client";

import React from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return (
    <div className="min-w-[200px] rounded-md border border-solid border-neutral-200 bg-white p-1 shadow-lg">
      {children}
    </div>
  );
}

DropdownMenu.DropdownItem = function DropdownItem({ 
  children, 
  icon, 
  onClick 
}: DropdownItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2 rounded-sm px-3 py-2 cursor-pointer hover:bg-neutral-50 transition-colors"
    >
      {icon && <span className="h-4 w-4 flex-none text-subtext-color">{icon}</span>}
      <span className="text-body font-body text-default-font">{children}</span>
    </div>
  );
};

DropdownMenu.DropdownDivider = function DropdownDivider() {
  return <div className="h-px bg-neutral-200 my-1" />;
};