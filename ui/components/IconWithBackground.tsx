"use client";

import React from "react";

interface IconWithBackgroundProps {
  size?: "small" | "medium" | "large";
  icon: React.ReactNode;
  className?: string;
}

export function IconWithBackground({ 
  size = "medium", 
  icon, 
  className 
}: IconWithBackgroundProps) {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12", 
    large: "h-16 w-16"
  };

  return (
    <div className={`
      flex items-center justify-center rounded-lg bg-brand-50 text-brand-600
      ${sizeClasses[size]} 
      ${className}
    `}>
      {icon}
    </div>
  );
}
