"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "neutral-tertiary" | "neutral-secondary";
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-purple-500 text-white hover:bg-purple-600",
  "neutral-tertiary": "bg-gray-200 text-gray-700 hover:bg-gray-300",
  "neutral-secondary": "bg-gray-300 text-gray-900 hover:bg-gray-400",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "default", icon, iconRight, children, className = "", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-brand-500 focus:outline-none ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {icon && <span className="mr-1 flex items-center">{icon}</span>}
        <span>{children}</span>
        {iconRight && <span className="ml-1 flex items-center">{iconRight}</span>}
      </button>
    );
  }
);

export default Button;

