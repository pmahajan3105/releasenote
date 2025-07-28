"use client";

import React from "react";

export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-6 bg-gray-200 rounded w-full" />
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-6 bg-gray-200 rounded w-1/4" />
    </div>
  );
}
