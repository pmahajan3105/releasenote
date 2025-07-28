"use client";

import React from "react";

export interface IconWithBackgroundProps {
  icon: React.ReactNode;
  size?: "small" | "medium" | "large";
  square?: boolean;
  className?: string;
}

/**
 * A utility component to display an icon within a colored background,
 * supporting optional size and a square/rounded display.
 */
export default function IconWithBackground({
  icon,
  size = "medium",
  square = false,
  className = "",
}: IconWithBackgroundProps) {
  const sizeClasses = {
    small: "w-8 h-8 text-lg",
    medium: "w-12 h-12 text-2xl",
    large: "w-16 h-16 text-3xl",
  };

  return (
    <span
      className={`inline-flex items-center justify-center bg-gray-100
        ${sizeClasses[size]}
        ${square ? "rounded-md" : "rounded-full"}
        ${className}`}
    >
      {icon}
    </span>
  );
}
