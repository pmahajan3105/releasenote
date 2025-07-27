"use client";

import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  size?: "small" | "medium" | "large";
  variant?: "default" | "ghost" | "outline";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function IconButton({ 
  icon, 
  size = "medium", 
  variant = "default", 
  onClick, 
  className 
}: IconButtonProps) {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-10 w-10",
    large: "h-12 w-12"
  };

  const variantClasses = {
    default: "bg-neutral-100 hover:bg-neutral-200 text-default-font",
    ghost: "hover:bg-neutral-100 text-subtext-color hover:text-default-font",
    outline: "border border-neutral-300 hover:bg-neutral-50 text-default-font"
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center rounded-md transition-colors
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${className}
      `}
    >
      {icon}
    </button>
  );
}