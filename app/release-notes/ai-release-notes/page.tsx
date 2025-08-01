"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherGitBranch } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherTrello } from "@subframe/core";
import { Badge } from "@/components/ui/components/Badge";
import { TextField } from "@/components/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
import { FeatherRefreshCw } from "@subframe/core";
import { TextArea } from "@/components/ui/components/TextArea";

function AiReleaseNotes() {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleTabChange = (index: number) => {
    if (index === 1) { // Jira tab
      router.push('/release-notes/jira-story-hub');
    }
    // For GitHub tab (index 0), we're already on the correct page
  };

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start">
        <div className="flex w-full flex-col items-start gap-6 border-b border-solid border-neutral-border px-8 py-6">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              <FeatherGitBranch className="text-heading-1 font-heading-1 text-brand-600" />
              <span className="text-heading-1 font-heading-1 text-brand-600">
                Generate Release Notes
              </span>
            </div>
            <span className="text-heading-3 font-heading-3 text-neutral-500">
              Transform your code changes into professional release notes
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Choose Integration Source
            </span>
            <div className="flex border-b border-neutral-border h-auto w-full max-w-[448px] flex-none">
              <button
                onClick={() => handleTabChange(0)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                  pathname.includes('ai-release-notes')
                    ? "border-brand text-brand"
                    : "border-transparent text-neutral-600 hover:text-brand hover:border-brand"
                }`}
              >
                GitHub
              </button>
              <button
                onClick={() => handleTabChange(1)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                  pathname.includes('jira-story-hub')
                    ? "border-brand text-brand"
                    : "border-transparent text-neutral-600 hover:text-brand hover:border-brand"
                }`}
              >
                Jira
              </button>
            </div>
          </div>
        </div>
        <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-8">
            <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  1. Select Repository
                </span>
                <Badge variant="success" icon={<FeatherGithub />}>
                  Connected as johndoe
                </Badge>
              </div>
              <TextField
                className="h-auto w-full max-w-[1024px] flex-none"
                label="Repository"
                helpText="Select a repository to generate release notes"
              >
                <TextField.Input
                  className="w-full max-w-[1024px] grow shrink-0 basis-0"
                  placeholder="Select repository..."
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
              <Button
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Continue to Review Changes
              </Button>
            </div>
            <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  2. Review Changes
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral-secondary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="neutral-secondary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    None
                  </Button>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Recent Commits
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-start gap-4 rounded-md border border-solid border-neutral-border px-6 py-4">
                    <Checkbox
                      label=""
                      checked={false}
                      onCheckedChange={(checked: boolean) => {}}
                    />
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                      <span className="text-body-bold font-body-bold text-default-font">
                        feat: Add user authentication system
                      </span>
                      <span className="text-body font-body text-subtext-color">
                        Implements OAuth2 flow and session management
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">a1b2c3d</Badge>
                        <Badge>Feature</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-start gap-4 rounded-md border border-solid border-neutral-border px-6 py-4">
                    <Checkbox
                      label=""
                      checked={false}
                      onCheckedChange={(checked: boolean) => {}}
                    />
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                      <span className="text-body-bold font-body-bold text-default-font">
                        fix: Resolve login redirect issue
                      </span>
                      <span className="text-body font-body text-subtext-color">
                        Updates callback handling for OAuth flow
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">e4f5g6h</Badge>
                        <Badge variant="error">Bug Fix</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Generate Release Notes
              </Button>
            </div>
            <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  3. Preview &amp; Customize
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral-secondary"
                    icon={<FeatherRefreshCw />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="neutral-secondary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Choose Template
                  </Button>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <TextArea
                  className="h-auto w-full flex-none"
                  label="Release Notes Preview"
                  helpText="AI-generated release notes based on selected changes"
                >
                  <TextArea.Input
                    className="h-auto min-h-[240px] w-full flex-none font-monospace-body"
                    placeholder={
                      "# Release v2.1.0\n\n## 🚀 New Features\n- User authentication system with OAuth support\n- Enhanced security measures\n\n## 🐛 Bug Fixes\n- Fixed login redirect issue\n- Resolved session handling"
                    }
                    value=""
                    onChange={(
                      event: React.ChangeEvent<HTMLTextAreaElement>
                    ) => {}}
                  />
                </TextArea>
                <div className="flex w-full flex-wrap items-start gap-4">
                  <TextField
                    className="h-auto w-64 flex-none"
                    label="Tone"
                    helpText="Writing style"
                  >
                    <TextField.Input
                      placeholder="Professional"
                      value=""
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {}}
                    />
                  </TextField>
                  <TextField
                    className="h-auto w-64 flex-none"
                    label="Audience"
                    helpText="Target readers"
                  >
                    <TextField.Input
                      placeholder="Developers"
                      value=""
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {}}
                    />
                  </TextField>
                  <TextField
                    className="h-auto w-64 flex-none"
                    label="Format"
                    helpText="Output format"
                  >
                    <TextField.Input
                      placeholder="Markdown"
                      value=""
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {}}
                    />
                  </TextField>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="neutral-secondary"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Save Draft
                </Button>
                <Button
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Publish Release Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default AiReleaseNotes;
