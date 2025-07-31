"use client";

import React, { useState } from "react";
import { FeatherZap } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherX } from "@subframe/core";
import { Alert } from "@/ui/components/Alert";
import { FeatherHelpCircle } from "@subframe/core";
import { TextArea } from "@/components/ui/components/TextArea";
import { TextField } from "@/components/ui/components/TextField";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";

function AiContextPage() {
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start bg-default-background overflow-y-auto">
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-16 bg-default-background px-4 sm:px-6 lg:px-16 py-8 sm:py-16">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-8 sm:gap-16">
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-3">
                    <FeatherZap className="text-heading-2 sm:text-heading-1 font-heading-2 sm:font-heading-1 text-brand-600" />
                    <span className="text-heading-2 sm:text-heading-1 font-heading-2 sm:font-heading-1 text-brand-600">
                      AI Context Settings
                    </span>
                  </div>
                  <span className="text-heading-4 sm:text-heading-3 font-heading-4 sm:font-heading-3 text-neutral-500">
                    Configure how AI generates your release notes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral-secondary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Reset defaults
                  </Button>
                  <Button
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Save changes
                  </Button>
                </div>
              </div>
              {isAlertVisible && (
                <Alert
                  variant="brand"
                  title="Configure AI Behavior"
                  description="These settings determine how the AI assistant generates and formats content. Configure the prompts, tone, and output format to match your needs."
                  className="transition-all duration-300 ease-in-out"
                  actions={
                    <IconButton
                      size="medium"
                      icon={<FeatherX />}
                      onClick={() => setIsAlertVisible(false)}
                    />
                  }
                />
              )}
            </div>
            <div className="flex w-full flex-col items-start gap-8 sm:gap-16">
              <div className="flex w-full flex-col items-start gap-4 sm:gap-8">
                <div className="flex w-full items-center justify-between pb-3 border-b border-neutral-200">
                  <span className="text-heading-3 sm:text-heading-2 font-heading-3 sm:font-heading-2 text-brand-600">
                    AI Prompts
                  </span>
                  <Button
                    variant="neutral-tertiary"
                    icon={<FeatherHelpCircle />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    View documentation
                  </Button>
                </div>
                <TextArea
                  className="h-auto w-auto min-w-[320px] sm:min-w-[448px] flex-none"
                  label="System Prompt"
                  helpText="Instructions that define the AI's role and behavior"
                >
                  <TextArea.Input
                    className="h-auto min-h-[120px] sm:min-h-[160px] w-full flex-none"
                    placeholder="You are an expert technical writer specializing in release notes..."
                    value=""
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {}}
                  />
                </TextArea>
                <TextArea
                  className="h-auto w-auto min-w-[320px] sm:min-w-[448px] flex-none"
                  label="User Prompt Template"
                  helpText="Template for user requests with placeholders"
                >
                  <TextArea.Input
                    className="h-auto min-h-[80px] sm:min-h-[112px] w-full flex-none"
                    placeholder="Generate release notes for the following changes: {{changes}}"
                    value=""
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {}}
                  />
                </TextArea>
                <TextArea
                  className="h-auto w-auto min-w-[320px] sm:min-w-[448px] flex-none"
                  label="Example Output"
                  helpText="Sample of desired AI response format"
                >
                  <TextArea.Input
                    className="h-auto min-h-[100px] sm:min-h-[144px] w-full flex-none"
                    placeholder="# Release Notes - v1.0.0..."
                    value=""
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {}}
                  />
                </TextArea>
              </div>
              <div className="flex w-full flex-col items-start gap-4 sm:gap-8">
                <div className="flex w-full items-center justify-between pb-3 border-b border-neutral-200">
                  <span className="text-heading-3 sm:text-heading-2 font-heading-3 sm:font-heading-2 text-brand-600">
                    AI Behavior
                  </span>
                </div>
                <TextField
                  className="h-auto w-auto min-w-[320px] sm:min-w-[448px] flex-none"
                  label="Tone"
                  helpText="Writing style for generated content"
                >
                  <TextField.Input
                    placeholder="e.g. professional, technical, casual"
                    value=""
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                  />
                </TextField>
                <TextField
                  className="h-auto w-auto min-w-[320px] sm:min-w-[448px] flex-none"
                  label="Audience"
                  helpText="Target readers for the content"
                >
                  <TextField.Input
                    placeholder="e.g. developers, business users"
                    value=""
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                  />
                </TextField>
                <TextField
                  className="h-auto w-auto min-w-[320px] sm:min-w-[448px] flex-none"
                  label="Output Format"
                  helpText="Desired format for generated content"
                >
                  <TextField.Input
                    placeholder="e.g. markdown, html"
                    value=""
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                  />
                </TextField>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default AiContextPage;
