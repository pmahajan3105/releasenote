"use client";

import React from "react";
import SidebarDesignThinking from "@/ui/components/SidebarDesignThinking";

interface DefaultPageLayoutProps {
  children: React.ReactNode;
}

export function DefaultPageLayout({ children }: DefaultPageLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-default-background">
      <SidebarDesignThinking />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
