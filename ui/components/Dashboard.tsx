"use client";

import React from "react";
import { useRouter } from 'next/navigation';
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { Button } from "@/ui/components/Button";
import { FeatherBell } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherSettings } from "@subframe/core";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherFileText } from "@subframe/core";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherLink } from "@subframe/core";

function Dashboard() {
  const router = useRouter();

  const handleCreateRelease = () => {
    router.push('/release-notes/start');
  };

  const handleSetupIntegration = () => {
    router.push('/dashboard/integrations');
  };

  const handleAIContextSetting = () => {
    router.push('/release-notes/ai-context');
  };

  const handleTemplateManagement = () => {
    router.push('/settings/templates');
  };

  const handleSettings = () => {
    router.push('/settings/organization');
  };

  const handleSupportHelp = () => {
    router.push('/dashboard/support');
  };

  const handleViewAllReleaseNotes = () => {
    router.push('/dashboard/release-notes');
  };

  const handleManageIntegrations = () => {
    router.push('/dashboard/integrations');
  };

  const handleNotifications = () => {
    router.push('/dashboard/notifications');
  };

  const handleConnectIntegration = () => {
    router.push('/dashboard/integrations/setup');
  };

  const handleConfigureAI = () => {
    router.push('/dashboard/settings/ai-context');
  };

  const handleCreateFirstNote = () => {
    router.push('/dashboard/release-notes/create');
  };

  const handleExploreTemplates = () => {
    router.push('/dashboard/templates');
  };

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start">
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-8 py-2">
          <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
            Dashboard
          </span>
          <Button
            variant="neutral-tertiary"
            icon={<FeatherBell />}
            onClick={handleNotifications}
          >
            Notifications
          </Button>
          <IconButton
            icon={<FeatherSettings />}
            onClick={handleSettings}
          />
        </div>
        <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-1 font-heading-1 text-default-font">
              Welcome to Release Notes Generator
            </span>
            <span className="text-body font-body text-subtext-color">
              Ready to generate some awesome release notes?
            </span>
          </div>
          
          {/* Quick Actions Section */}
          <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Quick Actions
            </span>
            <div className="flex w-full flex-wrap items-start gap-6">
              <Button
                variant="neutral-secondary"
                onClick={handleCreateRelease}
              >
                Create release
              </Button>
              <Button
                variant="neutral-secondary"
                onClick={handleSetupIntegration}
              >
                Setup integration
              </Button>
              <Button
                variant="neutral-secondary"
                onClick={handleAIContextSetting}
              >
                AI context setting
              </Button>
              <Button
                variant="neutral-secondary"
                onClick={handleTemplateManagement}
              >
                Template Management
              </Button>
              <Button
                variant="neutral-secondary"
                onClick={handleSupportHelp}
              >
                Support &amp; Help
              </Button>
            </div>
          </div>

          {/* Recent Release Notes Section */}
          <div className="flex w-full flex-col items-start gap-6">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Recent Release Notes
            </span>
            <div className="flex w-full flex-col items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-16">
              <IconWithBackground size="large" icon={<FeatherFileText className="text-black" />} />
              <span className="text-body font-body text-subtext-color">
                No release notes created yet.
              </span>
              <Button
                className="bg-black text-white"
                onClick={handleCreateRelease}
              >
                Create your first one
              </Button>
            </div>
            <Button
              variant="neutral-tertiary"
              iconRight={<FeatherArrowRight />}
              onClick={handleViewAllReleaseNotes}
            >
              View all release notes
            </Button>
          </div>

          {/* Integrations Status Section */}
          <div className="flex w-full flex-col items-start gap-6">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Integrations Status
            </span>
            <div className="flex w-full flex-col items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-16">
              <IconWithBackground size="large" icon={<FeatherLink className="text-black" />} />
              <span className="text-body font-body text-subtext-color">
                No integrations connected yet.
              </span>
              <Button
                className="bg-black text-white"
                onClick={handleSetupIntegration}
              >
                Connect your first integration
              </Button>
            </div>
            <Button
              variant="neutral-tertiary"
              iconRight={<FeatherArrowRight />}
              onClick={handleManageIntegrations}
            >
              Manage integrations
            </Button>
          </div>

          {/* Getting Started Checklist Section */}
          <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Getting Started Checklist
            </span>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body font-body text-default-font">
                  Connect an integration (Jira, GitHub, etc.)
                </span>
                <Button
                  variant="neutral-tertiary"
                  onClick={handleSetupIntegration}
                >
                  Setup
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body font-body text-default-font">
                  Configure your AI Context
                </span>
                <Button
                  variant="neutral-tertiary"
                  onClick={handleAIContextSetting}
                >
                  Configure
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body font-body text-default-font">
                  Create your first Release Note
                </span>
                <Button
                  variant="neutral-tertiary"
                  onClick={handleCreateRelease}
                >
                  Create
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body font-body text-default-font">
                  Explore and manage Templates
                </span>
                <Button
                  variant="neutral-tertiary"
                  onClick={handleTemplateManagement}
                >
                  Templates
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default Dashboard;