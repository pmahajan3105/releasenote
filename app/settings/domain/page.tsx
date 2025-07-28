"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DefaultPageLayout from "@/components/ui/layouts/DefaultPageLayout";
import SettingsMenu from "@/components/ui/components/SettingsMenu";
import {
  FeatherBuilding,
  FeatherImage,
  FeatherFileText,
  FeatherGlobe,
  FeatherLock,
  FeatherUsers,
  FeatherX,
  FeatherPlus,
  FeatherCheck,
  FeatherMoreVertical,
  FeatherClock,
  FeatherShield,
  FeatherCopy,
  FeatherShieldCheck,
  FeatherHelpCircle,
} from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import Alert from "@/ui/components/Alert";
import Button from "@/components/ui/components/Button";
import Badge from "@/components/ui/components/Badge";
import TextField from "@/components/ui/components/TextField";

export default function DomainSelection() {
  const router = useRouter();

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
        <SettingsMenu className="mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0">
          <span className="w-full text-heading-3 font-heading-3 text-default-font">Settings</span>
          <div className="flex w-full flex-col items-start gap-2">
            <span className="w-full text-body-bold font-body-bold text-default-font">Organization</span>
            <div className="flex w-full flex-col items-start gap-1">
              <SettingsMenu.Item
                icon={<FeatherBuilding />}
                label="Organization Settings"
                onClick={() => router.push("/settings/organization")}
              />
              <SettingsMenu.Item
                icon={<FeatherImage />}
                label="Branding"
                onClick={() => router.push("/settings/branding")}
              />
              <SettingsMenu.Item
                icon={<FeatherFileText />}
                label="Templates"
                onClick={() => router.push("/settings/templates")}
              />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-2">
            <span className="w-full text-body-bold font-body-bold text-default-font">Access</span>
            <div className="flex w-full flex-col items-start gap-1">
              <SettingsMenu.Item
                selected={true}
                icon={<FeatherGlobe />}
                label="Domain"
                onClick={() => router.push("/settings/domain")}
              />
              <SettingsMenu.Item
                icon={<FeatherLock />}
                label="SSO"
                onClick={() => router.push("/settings/sso")}
              />
              <SettingsMenu.Item
                icon={<FeatherUsers />}
                label="Team Members"
                onClick={() => router.push("/settings/team-members")}
              />
            </div>
          </div>
        </SettingsMenu>
        <div className="container max-w-none flex grow shrink-0 basis-0 flex-col items-center gap-12 self-stretch bg-default-background py-12 shadow-sm">
          <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
            <div className="flex w-full flex-col items-start gap-1">
              <span className="w-full text-heading-2 font-heading-2 text-default-font">Domains</span>
              <span className="text-body font-body text-subtext-color">Manage and verify your organization's domains</span>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <Alert
                variant="brand"
                actions={
                  <IconButton
                    size="medium"
                    icon={<FeatherX />}
                    onClick={() => {}}
                  />
                }
              >
                <div className="flex items-center gap-2">
                  <FeatherGlobe />
                  <span>Set up your domain</span>
                  <span>Add and verify your domain to enable custom branding and SSO capabilities.</span>
                </div>
              </Alert>
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center justify-between">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Your domains
                  </span>
                  <Button
                    icon={<FeatherPlus />}
                    onClick={() => {}}
                  >
                    Add domain
                  </Button>
                </div>
                <div className="flex w-full flex-col items-start gap-4">
                  {/* Sample domain: verified/primary */}
                  <div className="flex w-full items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                    <div className="flex grow shrink-0 basis-0 items-center gap-4">
                      <FeatherGlobe className="text-heading-3 font-heading-3 text-default-font" />
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-body-bold font-body-bold text-default-font">
                          example.com
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="success" icon={<FeatherCheck />}>Verified</Badge>
                          <Badge variant="neutral">Primary</Badge>
                        </div>
                      </div>
                    </div>
                    <IconButton
                      icon={<FeatherMoreVertical />}
                      onClick={() => {}}
                    />
                  </div>
                  {/* Sample domain: pending/dev */}
                  <div className="flex w-full items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                    <div className="flex grow shrink-0 basis-0 items-center gap-4">
                      <FeatherGlobe className="text-heading-3 font-heading-3 text-default-font" />
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-body-bold font-body-bold text-default-font">
                          staging.example.com
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="warning" icon={<FeatherClock />}>Pending</Badge>
                          <Badge variant="neutral">Development</Badge>
                        </div>
                      </div>
                    </div>
                    <IconButton
                      icon={<FeatherMoreVertical />}
                      onClick={() => {}}
                    />
                  </div>
                </div>
              </div>
              {/* Domain verification */}
              <div className="flex w-full flex-col items-start gap-4">
                <span className="text-body-bold font-body-bold text-default-font">Domain verification</span>
                <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                  <div className="flex w-full items-center gap-4">
                    <div className="flex grow shrink-0 basis-0 items-center gap-2">
                      <FeatherShield className="text-heading-3 font-heading-3 text-default-font" />
                      <span className="text-body-bold font-body-bold text-default-font">DNS verification</span>
                    </div>
                    <Badge variant="warning">Required</Badge>
                  </div>
                  <span className="text-body font-body text-subtext-color">
                    Add this TXT record to your DNS configuration to verify domain ownership
                  </span>
                  <TextField label="" helpText="">
                    <TextField.Input
                      placeholder="verification-code-xxx"
                      value=""
                      onChange={() => {}}
                    />
                  </TextField>
                  <Button
                    variant="neutral-secondary"
                    icon={<FeatherCopy />}
                    onClick={() => {}}
                  >
                    Copy DNS record
                  </Button>
                </div>
              </div>
              {/* SSL Certificate */}
              <div className="flex w-full flex-col items-start gap-4">
                <span className="text-body-bold font-body-bold text-default-font">SSL Certificate</span>
                <div className="flex w-full items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                  <div className="flex grow shrink-0 basis-0 items-center gap-4">
                    <FeatherShieldCheck className="text-heading-3 font-heading-3 text-success-700" />
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Certificate active
                      </span>
                      <span className="text-body font-body text-subtext-color">Expires in 89 days</span>
                    </div>
                  </div>
                  <Button
                    variant="neutral-secondary"
                    onClick={() => {}}
                  >
                    View details
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full flex-wrap items-center justify-between">
                <Button
                  variant="neutral-tertiary"
                  icon={<FeatherHelpCircle />}
                  onClick={() => {}}
                >
                  View documentation
                </Button>
                <Button
                  onClick={() => {}}
                >
                  Verify All Domains
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}
//   