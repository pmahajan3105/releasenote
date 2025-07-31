"use client";

import React from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherClipboard } from "@subframe/core";
import Tabs from "@/components/ui/components/Tabs";
import { FeatherGithub } from "@subframe/core";
import { FeatherTrello } from "@subframe/core";
import { Badge } from "@/components/ui/components/Badge";
import { TextField } from "@/components/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
import { FeatherRefreshCw } from "@subframe/core";
import { TextArea } from "@/components/ui/components/TextArea";
import IntegrationTabs from "@/components/ui/IntegrationTabs";

function JiraStoryHub() {
  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start">
        <div className="flex w-full flex-col items-start gap-6 border-b border-solid border-neutral-border px-8 py-6">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              <FeatherTrello className="text-heading-1 font-heading-1 text-brand-600" />
              <span className="text-heading-1 font-heading-1 text-brand-600">
                Jira Story Hub
              </span>
            </div>
            <span className="text-heading-3 font-heading-3 text-neutral-500">
              Manage and generate release notes from Jira issues
            </span>
          </div>
          <IntegrationTabs />
        </div>
        <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-8">
            <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  1. Select Project
                </span>
                <Badge variant="success" icon={<FeatherTrello />}>
                  Connected as johndoe
                </Badge>
              </div>
              <TextField
                className="h-auto w-full max-w-[1024px] flex-none"
                label="Project"
                helpText="Select a Jira project to generate release notes"
              >
                <TextField.Input
                  className="w-full max-w-[1024px] grow shrink-0 basis-0"
                  placeholder="Select project..."
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
              <Button
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Continue to Review Issues
              </Button>
            </div>
            <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  2. Review Issues
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
                  Recent Issues
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
                        PROJ-123: Implement user authentication system
                      </span>
                      <span className="text-body font-body text-subtext-color">
                        Add OAuth2 flow and session management functionality
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge>Story</Badge>
                        <Badge variant="success">Done</Badge>
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
                        PROJ-124: Fix login redirect issue
                      </span>
                      <span className="text-body font-body text-subtext-color">
                        Resolve callback handling in OAuth flow
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="error">Bug</Badge>
                        <Badge variant="success">Done</Badge>
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
                  helpText="AI-generated release notes based on selected issues"
                >
                  <TextArea.Input
                    className="h-auto min-h-[240px] w-full flex-none font-monospace-body"
                    placeholder={
                      "# Release v2.1.0\n\n## 🚀 New Features\n- [PROJ-123] User authentication system with OAuth support\n- Enhanced security measures\n\n## 🐛 Bug Fixes\n- [PROJ-124] Fixed login redirect issue\n- Improved OAuth flow handling"
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
                      placeholder="Stakeholders"
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

export default JiraStoryHub;
