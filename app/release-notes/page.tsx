"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/components/ui/components/TextField";
import { FeatherSearch } from "@subframe/core";
import Tabs from "@/components/ui/components/Tabs";
import { Table } from "@/components/ui/components/Table";
import { Badge } from "@/components/ui/components/Badge";
import DropdownMenu from "@/ui/components/DropdownMenu";
import { FeatherEye } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMoreHorizontal } from "@subframe/core";
import DefaultPageLayout from "@/components/ui/layouts/DefaultPageLayout";
import { useRouter } from "next/navigation";
import { fetchReleases, deleteRelease, archiveRelease } from "@/lib/api/releases";
import { Release } from "@/lib/api/releases";

function ReleaseNotesPage() {
  const router = useRouter();
  const [releases, setReleases] = useState<Release[]>([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadReleases = async () => {
      const data = await fetchReleases();
      setReleases(data);
    };
    loadReleases();
  }, []);

  const filteredReleases = releases.filter((release) => {
    return (
      (filter === "All" || release.status === filter) &&
      release.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDelete = async (id) => {
    await deleteRelease(id);
    setReleases((prev) => prev.filter((release) => release.id !== id));
  };

  const handleArchive = async (id) => {
    await archiveRelease(id);
    setReleases((prev) =>
      prev.map((release) =>
        release.id === id ? { ...release, status: "Archived" } : release
      )
    );
  };

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start">
        <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-start gap-8 bg-default-background py-12">
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full flex-wrap items-center gap-2 mobile:flex-col mobile:flex-wrap mobile:items-start mobile:justify-start mobile:gap-2">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="w-full text-heading-2 font-heading-2 text-default-font">
                  Release Notes
                </span>
                <span className="text-body font-body text-subtext-color">
                  Manage and publish your product updates
                </span>
              </div>
              <Button onClick={() => router.push("/release-notes/start")}>
                Create New Release
              </Button>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2">
              <TextField
                className="h-auto w-64 flex-none"
                label=""
                helpText=""
                icon={<FeatherSearch />}
              >
                <TextField.Input
                  placeholder="Search releases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </TextField>
            </div>
            <Tabs>
              <Tabs.List>
                {["All", "Draft", "Scheduled", "Published", "Archived"].map((status) => (
                  <Tabs.Item
                    key={status}
                    active={filter === status}
                    onClick={() => setFilter(status)}
                  >
                    {status}
                  </Tabs.Item>
                ))}
              </Tabs.List>
            </Tabs>
          </div>
          <div className="flex w-full flex-col items-start gap-6 overflow-hidden overflow-x-auto">
            <Table className="min-w-full border border-gray-200 rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Version</th>
                  <th className="px-4 py-2 text-left">Last Updated</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredReleases.map((release) => (
                  <tr key={release.id} className="border-t border-gray-200">
                    <td className="px-4 py-2">
                      <span className="text-body-bold font-body-bold text-default-font">
                        {release.title}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={release.status.toLowerCase()}>
                        {release.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-body font-body text-neutral-500">
                        {release.version}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-body font-body text-neutral-500">
                        {release.lastUpdated}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <DropdownMenu>
                        <DropdownMenu.Trigger>
                          <IconButton
                            icon={<FeatherMoreHorizontal />}
                            onClick={(event) => event.stopPropagation()}
                          />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          <DropdownMenu.Item
                            icon={<FeatherTrash />}
                            onClick={() => handleDelete(release.id)}
                          >
                            Delete
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            icon={<FeatherEdit2 />}
                            onClick={() => handleArchive(release.id)}
                          >
                            Archive
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default ReleaseNotesPage;