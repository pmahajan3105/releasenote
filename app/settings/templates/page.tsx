"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DefaultPageLayout from "@/components/ui/layouts/DefaultPageLayout";
import SettingsMenu from "@/components/ui/components/SettingsMenu";
import {
  FeatherBuilding, FeatherImage, FeatherFileText, FeatherGlobe, FeatherLock, FeatherUsers,
  FeatherX, FeatherSearch, FeatherChevronDown, FeatherPlus, FeatherClock, FeatherLayout,
  FeatherMessageCircle, FeatherCopy, FeatherEye, FeatherEdit2, FeatherDownload, FeatherTrash,
  FeatherMoreVertical, FeatherTrendingUp, FeatherCode,
} from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import Alert from "@/ui/components/Alert";
import TextField from "@/components/ui/components/TextField";
import Button  from "@/components/ui/components/Button";
import Badge from "@/components/ui/components/Badge";
import DropdownMenu from "@/ui/components/DropdownMenu";
import * as SubframeCore from "@subframe/core";

export default function TemplatePage() {
  const router = useRouter();

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
        <SettingsMenu className="mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0">
          <span className="w-full text-heading-3 font-heading-3 text-default-font">
            Settings
          </span>
          {/* Organization Section */}
          <div className="flex w-full flex-col items-start gap-2">
            <span className="w-full text-body-bold font-body-bold text-default-font">
              Organization
            </span>
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
                selected={true}
                icon={<FeatherFileText />}
                label="Templates"
                onClick={() => router.push("/settings/templates")}
              />
            </div>
          </div>
          {/* Access Section */}
          <div className="flex w-full flex-col items-start gap-2">
            <span className="w-full text-body-bold font-body-bold text-default-font">
              Access
            </span>
            <div className="flex w-full flex-col items-start gap-1">
              <SettingsMenu.Item
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
          <div className="flex w-full max-w-[768px] flex-col items-start gap-12">
            <div className="flex w-full flex-col items-start gap-1">
              <span className="w-full text-heading-2 font-heading-2 text-default-font">
                Templates
              </span>
              <span className="text-body font-body text-subtext-color">
                Manage your release note templates
              </span>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <Alert
                variant="brand"
                title="Manage Templates"
                description="Create and customize templates for your release notes. Import existing templates or create new ones from scratch."
                actions={
                  <IconButton
                    size="medium"
                    icon={<FeatherX />}
                    onClick={() => {}}
                  />
                }
              />
              <div className="flex w-full items-center gap-4">
                <TextField
                  className="h-auto grow shrink-0 basis-0"
                  label=""
                  helpText=""
                  icon={<FeatherSearch />}
                >
                  <TextField.Input
                    placeholder="Search templates..."
                    value=""
                    onChange={() => {}}
                  />
                </TextField>
                <Button
                  variant="default"
                  iconRight={<FeatherChevronDown />}
                  onClick={() => {}}
                >
                  All categories
                </Button>
                <Button
                  icon={<FeatherPlus />}
                  onClick={() => {}}
                >
                  New Template
                </Button>
              </div>
              <div className="w-full items-start gap-6 grid grid-cols-1">

                {/* Card: Traditional Release Notes */}
                <div className="flex flex-col items-start gap-6 rounded-md border bg-default-background px-6 py-6 border-solid border-neutral-border">
                  <div className="flex w-full flex-col items-start gap-4">
                    <div className="flex w-full items-start justify-between">
                      <div className="flex flex-col items-start gap-2">
                        <span className="text-heading-2 font-heading-2 text-default-font">
                          Traditional Release Notes
                        </span>
                        <span className="text-body font-body text-subtext-color">
                          Professional format for enterprise software updates
                        </span>
                      </div>
                      <Badge variant="neutral" icon={<FeatherClock />}>
                        Last edited 2d ago
                      </Badge>
                    </div>
                    <div className="flex w-full flex-col items-start gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="neutral" icon={<FeatherLayout />}>
                          Traditional
                        </Badge>
                        <Badge variant="neutral" icon={<FeatherUsers />}>
                          Developers
                        </Badge>
                        <Badge variant="neutral" icon={<FeatherFileText />}>
                          Markdown
                        </Badge>
                        <Badge variant="neutral" icon={<FeatherMessageCircle />}>
                          Professional
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <FeatherFileText className="text-caption font-caption text-subtext-color" />
                        <span className="text-caption font-caption text-subtext-color">
                          2,450 words
                        </span>
                        <FeatherCopy className="text-caption font-caption text-subtext-color" />
                        <span className="text-caption font-caption text-subtext-color">
                          48 uses
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-end gap-2">
                    <IconButton icon={<FeatherEye />} onClick={() => {}} />
                    <IconButton icon={<FeatherEdit2 />} onClick={() => {}} />
                    <SubframeCore.DropdownMenu.Root>
                      <SubframeCore.DropdownMenu.Trigger asChild>
                        <IconButton icon={<FeatherMoreVertical />} onClick={() => {}} />
                      </SubframeCore.DropdownMenu.Trigger>
                      <SubframeCore.DropdownMenu.Portal>
                        <SubframeCore.DropdownMenu.Content
                          side="bottom"
                          align="end"
                          sideOffset={4}
                          asChild
                        >
                          <DropdownMenu>
                            <DropdownMenu.Item icon={<FeatherCopy />}>
                              Duplicate
                            </DropdownMenu.Item>
                            <DropdownMenu.Item icon={<FeatherDownload />}>
                              Export
                            </DropdownMenu.Item>
                            <DropdownMenu.Divider />
                            <DropdownMenu.Item icon={<FeatherTrash />}>
                              Delete
                            </DropdownMenu.Item>
                          </DropdownMenu>
                        </SubframeCore.DropdownMenu.Content>
                      </SubframeCore.DropdownMenu.Portal>
                    </SubframeCore.DropdownMenu.Root>
                  </div>
                </div>

                {/* Card: Modern Changelog */}
                <div className="flex flex-col items-start gap-6 rounded-md border bg-default-background px-6 py-6 border-solid border-neutral-border">
                  <div className="flex w-full flex-col items-start gap-4">
                    <div className="flex w-full items-start justify-between">
                      <div className="flex flex-col items-start gap-2">
                        <span className="text-heading-2 font-heading-2 text-default-font">
                          Modern Changelog
                        </span>
                        <span className="text-body font-body text-subtext-color">
                          Contemporary style with emojis and casual tone
                        </span>
                      </div>
                      <Badge variant="neutral" icon={<FeatherClock />}>
                        Last edited 5h ago
                      </Badge>
                    </div>
                    <div className="flex w-full flex-col items-start gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="neutral" icon={<FeatherTrendingUp />}>
                          Modern
                        </Badge>
                        <Badge variant="neutral" icon={<FeatherUsers />}>
                          Mixed
                        </Badge>
                        <Badge variant="neutral" icon={<FeatherCode />}>
                          HTML
                        </Badge>
                        <Badge variant="neutral" icon={<FeatherMessageCircle />}>
                          Casual
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <FeatherFileText className="text-caption font-caption text-subtext-color" />
                        <span className="text-caption font-caption text-subtext-color">
                          1,850 words
                        </span>
                        <FeatherCopy className="text-caption font-caption text-subtext-color" />
                        <span className="text-caption font-caption text-subtext-color">
                          36 uses
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-end gap-2">
                    <IconButton icon={<FeatherEye />} onClick={() => {}} />
                    <IconButton icon={<FeatherEdit2 />} onClick={() => {}} />
                    <SubframeCore.DropdownMenu.Root>
                      <SubframeCore.DropdownMenu.Trigger asChild>
                        <IconButton icon={<FeatherMoreVertical />} onClick={() => {}} />
                      </SubframeCore.DropdownMenu.Trigger>
                      <SubframeCore.DropdownMenu.Portal>
                        <SubframeCore.DropdownMenu.Content
                          side="bottom"
                          align="end"
                          sideOffset={4}
                          asChild
                        >
                          <DropdownMenu>
                            <DropdownMenu.Item icon={<FeatherCopy />}>
                              Duplicate
                            </DropdownMenu.Item>
                            <DropdownMenu.Item icon={<FeatherDownload />}>
                              Export
                            </DropdownMenu.Item>
                            <DropdownMenu.Divider />
                            <DropdownMenu.Item icon={<FeatherTrash />}>
                              Delete
                            </DropdownMenu.Item>
                          </DropdownMenu>
                        </SubframeCore.DropdownMenu.Content>
                      </SubframeCore.DropdownMenu.Portal>
                    </SubframeCore.DropdownMenu.Root>
                  </div>
                </div>
                {/* Add more template cards as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

