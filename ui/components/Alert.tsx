"use client";

import React, { ReactNode } from "react";

interface AlertProps {
  title?: string;
  description?: string;
  variant?: "default" | "brand" | "error" | "warning" | "success";
  children?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode; // <-- add this prop
  className?: string;
}

const variantColors = {
  default: "bg-gray-50 border border-gray-300 text-gray-800",
  brand: "bg-blue-50 border border-blue-300 text-blue-900",
  error: "bg-red-50 border border-red-300 text-red-900",
  warning: "bg-yellow-50 border border-yellow-300 text-yellow-900",
  success: "bg-green-50 border border-green-300 text-green-900",
};

export function Alert({
  title,
  description,
  variant = "default",
  children,
  actions,
  icon, // destructure icon
  className = "",
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col gap-3 rounded-md p-4 shadow-sm ${variantColors[variant]} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>} {/* render icon */}
          {title && <h4 className="text-sm font-semibold">{title}</h4>}
        </div>

        {/* actions (typically close button) */}
        {actions && <div>{actions}</div>}
      </div>
      {description && <p className="text-sm text-gray-700">{description}</p>}
      {children}
    </div>
  );
}

export default Alert;
