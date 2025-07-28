"use client";

import React from "react";
import { useRouter } from "next/navigation";

import DefaultLayout from "@/components/ui/layouts/DefaultLayout";
import SettingsMenu from "@/components/ui/components/SettingsMenu";
import { IconButton }from "@/ui/components/IconButton";
import Alert from "@/ui/components/Alert";
import Button from "@/components/ui/components/Button";
import Badge from "@/components/ui/components/Badge";
import DropdownMenu  from "@/ui/components/DropdownMenu";
import Table from "@/components/ui/components/Table";
import { Avatar } from "@/ui/components/Avatar";
import { TextField } from "@/components/ui/components/TextField";

import {
  FeatherBuilding,
  FeatherImage,
  FeatherFileText,
  FeatherGlobe,
  FeatherLock,
  FeatherUsers,
  FeatherX,
  FeatherChevronDown,
  FeatherUserPlus,
  FeatherCheck,
  FeatherEdit2,
  FeatherKey,
  FeatherTrash,
  FeatherMoreVertical,
  FeatherClock,
} from "@subframe/core";

console.log({
  SettingsMenu,
  IconButton,
  Alert,
  Button,
  Badge,
  DropdownMenu,
  Table,
  Avatar,
});


export default function TeamMemberRoster() {
  const router = useRouter();

  return (
    <DefaultLayout>
      <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        {/* Sidebar */}
        <SettingsMenu className="mobile:w-full mobile:grow mobile:shrink-0">
          <span className="text-heading-3 font-heading-3 text-default-font mb-4">Settings</span>

          {/* Organization Section */}
          <div className="mb-6">
            <p className="text-body-bold font-body-bold text-default-font mb-2">Organization</p>
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

          {/* Access Section */}
          <div>
            <p className="text-body-bold font-body-bold text-default-font mb-2">Access</p>
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
              selected
            />
          </div>
        </SettingsMenu>

        {/* Main content */}
        <main className="container max-w-none flex grow shrink-0 flex-col items-center gap-12 self-stretch bg-default-background py-12 shadow-sm px-6">
          <div className="max-w-6xl w-full">
            <h2 className="text-heading-2 font-heading-2 text-default-font">Team Members</h2>
            <p className="text-body text-subtext-color mb-6">Manage team members and their roles</p>

            <Alert
              variant="brand"
              icon={<FeatherUsers />}
              title="Invite team members"
              description="Add new members to your organization and assign their roles."
              actions={
                <IconButton
                  size="medium"
                  icon={<FeatherX />}
                  onClick={() => {}}
                  aria-label="Close invitation alert"
                />
              }
            />

            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex grow shrink-0 flex-wrap items-center gap-3 max-w-full min-w-[200px]">
                <IconButton
                  icon={<FeatherUserPlus />}
                  onClick={() => {}}
                  aria-label="Add new member"
                />
                <Button
                  variant="neutral-tertiary"
                  iconRight={<FeatherChevronDown />}
                  onClick={() => {}}
                >
                  All roles
                </Button>
                <Button
                  variant="neutral-tertiary"
                  iconRight={<FeatherChevronDown />}
                  onClick={() => {}}
                >
                  All departments
                </Button>
                <Button
                  icon={<FeatherUserPlus />}
                  onClick={() => {}}
                >
                  Add Member
                </Button>
              </div>

              {/* Search Input */}
              <div className="max-w-[320px] w-full">
                <TextField
                  className="w-full"
                  label=""
                  helpText=""
                  icon={<FeatherUserPlus />}
                >
                  <TextField.Input
                    placeholder="Search members..."
                    value={""}
                    onChange={() => {}}
                    aria-label="Search members"
                  />
                </TextField>
              </div>
            </div>

            <Table>
              <Table.HeaderRow>
                <Table.HeaderCell>NAME</Table.HeaderCell>
                <Table.HeaderCell>EMAIL</Table.HeaderCell>
                <Table.HeaderCell>ROLE</Table.HeaderCell>
                <Table.HeaderCell>DEPARTMENT</Table.HeaderCell>
                <Table.HeaderCell>STATUS</Table.HeaderCell>
                <Table.HeaderCell>ACTIONS</Table.HeaderCell>
              </Table.HeaderRow>

              {/* Sample Row */}
              <Table.Row>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <Avatar
                      size="small"
                      image="https://images.unsplash.com/photo-1573497019940-1c28c88f4321"
                      aria-label="Emma Johnson"
                    />
                    <span className="whitespace-nowrap text-body-bold font-body-bold text-neutral-700">
                      Emma Johnson
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>emma.johnson@example.com</Table.Cell>
                <Table.Cell>
                  <Badge>Admin</Badge>
                </Table.Cell>
                <Table.Cell>Product</Table.Cell>
                <Table.Cell>
                  <Badge variant="success" icon={<FeatherCheck />}>
                    Active
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenu.Trigger>
                        <IconButton icon={<FeatherMoreVertical />} aria-label="Actions" />
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item icon={<FeatherEdit2 />}>Edit</DropdownMenu.Item>
                        <DropdownMenu.Item icon={<FeatherKey />}>Change Role</DropdownMenu.Item>
                        <DropdownMenu.Divider />
                        <DropdownMenu.Item icon={<FeatherTrash />}>Remove</DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </div>
                </Table.Cell>
              </Table.Row>

              {/* Repeat additional rows as needed */}
            </Table>
          </div>
        </main>
      </div>
    </DefaultLayout>
  );
}
