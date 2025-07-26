"use client";

import React from "react";

interface TreeViewProps {
  children: React.ReactNode;
}

interface TreeViewItemProps {
  label: string;
  icon?: React.ReactNode | null;
  selected?: boolean;
  onClick?: () => void;
}

export function TreeView({ children }: TreeViewProps) {
  return (
    <div className="flex w-full flex-col items-start gap-1">
      {children}
    </div>
  );
}

TreeView.Item = function TreeViewItem({ 
  label, 
  icon, 
  selected = false, 
  onClick 
}: TreeViewItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors
        ${selected 
          ? 'bg-brand-50 text-brand-600' 
          : 'text-subtext-color hover:bg-neutral-100 hover:text-default-font'
        }
      `}
    >
      {icon && <span className="h-4 w-4 flex-none">{icon}</span>}
      <span className="text-body font-body">{label}</span>
    </div>
  );
};
