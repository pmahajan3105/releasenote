"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/ui/layouts/DefaultLayout";
import SettingsMenu from "@/components/ui/components/SettingsMenu";
import { IconButton } from "@/ui/components/IconButton";
import Alert from "@/ui/components/Alert";
import Button from "@/components/ui/components/Button";
import Badge from "@/components/ui/components/Badge";
import { Table } from "@/components/ui/components/Table";
import Tabs from "@/components/ui/components/Tabs";
import { IconWithBackground } from "@/ui/components/IconWithBackground";

import {
  FeatherBuilding,
  FeatherImage,
  FeatherFileText,
  FeatherGlobe,
  FeatherLock,
  FeatherUsers,
  FeatherX,
  FeatherShield,
  FeatherKey,
  FeatherCheckCircle,
  FeatherSearch,
  FeatherChevronDown,
  FeatherPlus,
  FeatherCopy,
  FeatherTrendingUp,
  FeatherCode,
  FeatherMessageCircle,
  FeatherLayout,
  FeatherEdit2,
  FeatherEye,
  FeatherClock,
  FeatherMoreVertical,
  FeatherDownload,
  FeatherTrash,
  FeatherHelpCircle,
} from "@subframe/core";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"; // or your dropdown lib
import { DropdownMenu } from "@/ui/components/DropdownMenu"; // your DropdownMenu wrapper, if any

export default function SsoLoginPage() {
  const router = useRouter();

  return (
    <DefaultLayout>
      <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
        <SettingsMenu className="mobile:w-full mobile:grow mobile:shrink-0">
          <span className="text-heading-3 font-heading-3 text-default-font mb-4">
            Settings
          </span>

          <div className="mb-6">
            <p className="text-body-bold font-body-bold text-default-font mb-2">
              Organization
            </p>
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

          <div>
            <p className="text-body-bold font-body-bold text-default-font mb-2">
              Access
            </p>
            <SettingsMenu.Item
              icon={<FeatherGlobe />}
              label="Domain"
              onClick={() => router.push("/settings/domain")}
            />
            <SettingsMenu.Item
              selected
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
        </SettingsMenu>

        <main className="container max-w-none flex grow shrink-0 flex-col items-center space-y-12 self-stretch bg-default-background py-12 px-6 md:px-12 shadow-sm">
          <div className="max-w-3xl w-full">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              Single Sign-On
            </h2>
            <p className="text-body text-subtext-color mb-6">
              Configure and manage SSO authentication for your organization
            </p>

            <Tabs>
              <Tabs.Item active>Basic Configuration</Tabs.Item>
              <Tabs.Item>Advanced Settings</Tabs.Item>
            </Tabs>

            <Alert
              variant="brand"
              title="Set up SSO authentication"
              children={
                <div className="flex items-center space-x-2">
                  <FeatherShield />
                  <span>Connect your identity provider to enable secure single sign-on for your organization.</span>
                </div>
              }
              actions={
                <IconButton
                  size="medium"
                  icon={<FeatherX />}
                  onClick={() => {}}
                />
              }
            />

            <section className="mt-6">
              <p className="text-body-bold font-body-bold mb-4">Identity Providers</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col items-center rounded-md border border-neutral-border bg-default-background py-10 px-6 space-y-4">
                  <IconWithBackground size="large" icon={<FeatherUsers />} />
                  <p className="text-heading-3 font-semibold">Okta</p>
                  <p className="text-subtext-color text-center">Enterprise identity platform</p>
                  <Button onClick={() => {}}>Configure</Button>
                </div>
                <div className="flex flex-col items-center rounded-md border border-neutral-border bg-default-background py-10 px-6 space-y-4">
                  <IconWithBackground size="large" icon={<FeatherKey />} />
                  <p className="text-heading-3 font-semibold">Azure AD</p>
                  <p className="text-subtext-color text-center">Microsoft identity service</p>
                  <Button onClick={() => {}}>Configure</Button>
                </div>
              </div>
            </section>

            <section className="mt-10 space-y-6">
              <p className="text-body-bold font-body-bold">Connection Status</p>
              <div className="flex justify-between items-center rounded-md border border-neutral-border bg-default-background p-6">
                <div className="flex items-center space-x-4">
                  <FeatherCheckCircle className="text-success-700 text-3xl" />
                  <div>
                    <h3 className="font-bold text-default-font">SSO is active and healthy</h3>
                    <p className="text-subtext-color">Last checked 2 minutes ago</p>
                  </div>
                </div>
                <Button variant="neutral-secondary" onClick={() => {}}>
                  Test Connection
                </Button>
              </div>
            </section>

            <section className="mt-10 space-y-4">
              <p className="text-body-bold font-body-bold">Activity Log</p>
              <Table>
                <Table.HeaderRow>
                  <Table.HeaderCell>Event</Table.HeaderCell>
                  <Table.HeaderCell>User</Table.HeaderCell>
                  <Table.HeaderCell>Time</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.HeaderRow>
                <Table.Row>
                  <Table.Cell>
                    <span className="font-bold text-default-font">SSO Authentication</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-muted">john.doe@example.com</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-muted">2 mins ago</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="success">Success</Badge>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <span className="font-bold text-default-font">Configuration Update</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-muted">admin@example.com</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-muted">1 hour ago</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="success">Success</Badge>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <span className="font-bold text-default-font">SSO Authentication</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-muted">sarah.smith@example.com</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-muted">3 hours ago</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="error">Failed</Badge>
                  </Table.Cell>
                </Table.Row>
              </Table>
            </section>

            <section className="mt-10 flex flex-col space-y-4">
              <Button variant="neutral-tertiary" icon={<FeatherHelpCircle />} onClick={() => {}}>
                View documentation
              </Button>
              <Button onClick={() => {}}>Save changes</Button>
            </section>
          </div>
        </main>
      </div>
    </DefaultLayout>
  );
}


