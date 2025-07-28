"use client";

import React from "react";
import { useAuthStore, useAuthSelectors } from "@/lib/store";
import { FormSkeleton } from "@/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/ui/card";
import SettingsPageComponent from "./SettingsPageComponent";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { isLoading: authLoading } = useAuthSelectors();

  if (authLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <FormSkeleton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <FormSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    // Optionally, you might want to trigger a redirect here or render a message
    return null;
  }

  return <SettingsPageComponent />;
}