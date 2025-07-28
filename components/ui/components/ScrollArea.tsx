"use client";

import React, { ReactNode } from "react";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollArea({ children, className = "", style }: ScrollAreaProps) {
  return (
    <div
      className={`overflow-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-200 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
