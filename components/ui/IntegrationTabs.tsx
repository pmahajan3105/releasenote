"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Tabs from "@/components/ui/components/Tabs";
import { FeatherGithub, FeatherTrello } from "@subframe/core";

const IntegrationTabs: React.FC = () => {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <span className="text-body-bold font-body-bold text-default-font">
        Choose Integration Source
      </span>
      <Tabs className="h-auto w-full max-w-[448px] flex-none">
        <Tabs.Item active={currentPath === "/release-notes/ai-context"}>
          <Link
            href="/release-notes/ai-context"
            className="flex items-center gap-2"
          >
            <FeatherGithub />
            GitHub
          </Link>
        </Tabs.Item>
        <Tabs.Item active={currentPath === "/release-notes/jira-story-hub"}>
          <Link
            href="/release-notes/jira-story-hub"
            className="flex items-center gap-2"
          >
            <FeatherTrello />
            Jira
          </Link>
        </Tabs.Item>
      </Tabs>
    </div>
  );
};

export default IntegrationTabs;
