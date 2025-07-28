"use client";

import React from "react";

interface ButtonProps {
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "outline" | "neutral-secondary" | "neutral-tertiary";
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
}

export function Button({ 
  size = "medium", 
  variant = "primary", 
  children, 
  icon,
  iconRight,
  onClick, 
  className,
  disabled
}: ButtonProps) {
  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base"
  };

  const variantClasses = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white",
    secondary: "bg-neutral-100 hover:bg-neutral-200 text-default-font",
    outline: "border border-neutral-300 hover:bg-neutral-50 text-default-font",
    "neutral-secondary": "bg-white border border-neutral-200 hover:bg-neutral-50 text-default-font",
    "neutral-tertiary": "bg-transparent hover:bg-neutral-50 text-subtext-color hover:text-default-font"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-['Inter'] font-[500] rounded-lg transition-colors flex items-center gap-2
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${className}
      `}
    >
      {icon && <span className="h-4 w-4 flex-none">{icon}</span>}
      {children}
      {iconRight && <span className="h-4 w-4 flex-none">{iconRight}</span>}
    </button>
  );
}