"use client";

import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "neutral" | "warning" | "primary" | "secondary" | "success" | "error";
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-gray-200 text-gray-800",
  neutral: "bg-gray-100 text-gray-900",
  warning: "bg-yellow-100 text-yellow-900",
  primary: "bg-blue-500 text-white",
  secondary: "bg-purple-500 text-white",
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
};

export function Badge({ children, variant = "default", icon, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="mr-1 flex items-center">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;

