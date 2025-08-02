"use client";

import React, { useEffect, useState } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { Button } from "@/ui/components/Button";
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

// Define the organization type
interface Organization {
  id: string;
  logo?: string;
  name: string;
  memberCount: number;
  role: string;
}

export default function ConfigurationPage() {
  const [companyDetails, setCompanyDetails] = useState("");
  const [aiTone, setAiTone] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    // Fetch organizations dynamically (replace with actual API call)
    const fetchOrganizations = async () => {
      const response = await fetch("/api/organizations");
      const data = await response.json();
      setOrganizations(data);
    };

    fetchOrganizations();
  }, []);

  const onSave = () => {
    // Implement your save logic here
    console.log("Saving settings:", { companyDetails, aiTone });
  };

  return (
    <DefaultPageLayout>
      <div className="flex flex-col h-full w-full overflow-y-auto px-6 py-6">
        <div className="flex w-full flex-col items-start gap-1 mb-4">
          <h2 className="text-heading-2 font-heading-2 text-default-font">
            Configuration
          </h2>
          <p className="text-body font-body text-subtext-color">
            Manage your organization settings and AI preferences
          </p>
        </div>

        {organizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="flex flex-col items-start p-4 border border-neutral-border rounded-md bg-default-background"
              >
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={`${org.name} logo`}
                    className="w-16 h-16 object-cover mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-neutral-border flex items-center justify-center mb-2">
                    <span className="text-body font-body text-subtext-color">
                      No Logo
                    </span>
                  </div>
                )}
                <h3 className="text-heading-3 font-heading-3 text-default-font">
                  {org.name}
                </h3>
                <p className="text-body font-body text-subtext-color">
                  {org.memberCount} members
                </p>
                <p className="text-body-small text-subtext-color">
                  Role: {org.role}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full mb-8">
            <p className="text-body font-body text-subtext-color mb-4">
              No organizations found.
            </p>
            <Button
              className="bg-black text-white"
              onClick={() =>
                (window.location.href = "/dashboard/create-organization")
              }
            >
              Create your first organization
            </Button>
          </div>
        )}

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
