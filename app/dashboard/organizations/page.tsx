"use client";

import React, { useState } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherX, FeatherHelpCircle } from "@subframe/core";
import { Alert } from "@/ui/components/Alert";
import { TextArea } from "@/components/ui/components/TextArea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/ui/components/Select";
import { Button } from "@/ui/components/Button";

export default function ConfigurationPage() {
  const [companyDetails, setCompanyDetails] = useState("");
  const [aiTone, setAiTone] = useState("");

  const onSave = () => {
    // Implement your save logic here
    console.log("Saving settings:", { companyDetails, aiTone });
  };

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-2 bg-default-background px-6 py-6 mobile:container mobile:max-w-none">
        <div className="flex w-full flex-col items-start gap-1">
          <h2 className="text-heading-2 font-heading-2 text-default-font">Configuration</h2>
          <p className="text-body font-body text-subtext-color">
            Manage your organization settings and AI preferences
          </p>
        </div>

        <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-center gap-6 bg-default-background py-12 shadow-sm">
          <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex w-full items-center gap-2">
                <h3 className="grow text-heading-3 font-heading-3 text-default-font">
                  Organization Settings
                </h3>
              </div>

              <Alert
                variant="brand"
                title="Configure your organization"
                description="These settings will be used to customize AI-generated release notes for your organization."
                actions={
                  <IconButton
                    size="medium"
                    icon={<FeatherX />}
                    onClick={() => {
                      // Handle closing alert if needed
                    }}
                  />
                }
              />

              <TextArea
                label="Company Details"
                helpText="Provide information about your company that will help generate more relevant content"
              >
                <TextArea.Input
                  className="h-auto min-h-[112px] w-full flex-none"
                  placeholder="Enter your company details..."
                  value={companyDetails}
                  onChange={(e) => setCompanyDetails(e.target.value)}
                />
              </TextArea>

              <div className="flex flex-col gap-1 w-full">
                <label
                  htmlFor="ai-tone-select"
                  className="text-body font-body text-default-font"
                >
                  AI Tone
                </label>
                <p className="text-body-small text-subtext-color mb-1">
                  Select the writing style for AI-generated content
                </p>

                <Select
                  value={aiTone}
                  onValueChange={setAiTone}
                  defaultValue=""
                  aria-labelledby="ai-tone-select"
                >
                  <SelectTrigger id="ai-tone-select" className="w-full" />
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="marketing-friendly">Marketing-friendly</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                  <SelectValue placeholder="Choose a tone" />
                </Select>
              </div>
            </div>

            <hr className="w-full border-neutral-border" />

            <div className="flex w-full justify-between items-center gap-2">
              <Button variant="neutral-secondary" onClick={() => {/* Optional cancel action */}}>
                Cancel
              </Button>
              <Button onClick={onSave}>Save Settings</Button>
            </div>
          </div>

          <section className="flex w-full max-w-[576px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 mt-8">
            <h3 className="text-heading-3 font-heading-3 text-default-font">Need help?</h3>
            <p className="text-body font-body text-subtext-color">
              Check our documentation for detailed guidance and troubleshooting tips.
            </p>
            <Button
              variant="neutral-secondary"
              onClick={() => window.open("https://your-docs-url.com", "_blank", "noopener")}
            >
              <FeatherHelpCircle className="inline-block mr-2" />
              View Documentation
            </Button>
          </section>
        </div>
      </div>
    </DefaultPageLayout>
  );
}
