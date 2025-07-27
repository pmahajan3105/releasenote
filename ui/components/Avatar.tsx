"use client";

import React from "react";

interface AvatarProps {
  size?: "small" | "medium" | "large";
  image?: string;
  name?: string;
  className?: string;
}

export function Avatar({ 
  size = "medium", 
  image, 
  name, 
  className 
}: AvatarProps) {
  const sizeClasses = {
    small: "h-8 w-8 text-sm",
    medium: "h-10 w-10 text-base",
    large: "h-12 w-12 text-lg"
  };

  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U';

  return (
    <div className={`
      flex items-center justify-center rounded-full overflow-hidden bg-neutral-200
      ${sizeClasses[size]} 
      ${className}
    `}>
      {image ? (
        <img 
          src={image} 
          alt={name || 'Avatar'} 
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-medium text-neutral-600">{initials}</span>
      )}
    </div>
  );
}