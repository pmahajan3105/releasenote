"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/components/Button";

function NewReleasePage() {
  const router = useRouter();

  return (
    <div className="container max-w-lg mx-auto py-12">
      <h1 className="text-heading-2 font-heading-2 mb-6">Choose Your Path</h1>
      <Button
        onClick={() => router.push("/release-notes/new/ai")}
        className="mb-4"
      >
        Start with AI
      </Button>
      <Button
        onClick={() => router.push("/release-notes/new/template")}
        className="mb-4"
      >
        Choose Template
      </Button>
      <Button
        onClick={() => router.push("/release-notes/new/manual")}
        className="mb-4"
      >
        Start from Scratch
      </Button>
    </div>
  );
}

export default NewReleasePage;
