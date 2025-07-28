"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import Tabs from "@/components/ui/components/Tabs";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Alert } from "@/ui/components/Alert";
import { Switch } from "@/components/ui/components/Switch";

import {
  FiFileText as FeatherFileText,
  FiEdit2 as FeatherEdit2,
  FiEye as FeatherEye,
  FiSend as FeatherSend,
  FiX as FeatherX,
  FiArrowLeft as FeatherArrowLeft,
} from "react-icons/fi";

export default function PublishPage() {
  const router = useRouter();

  return (
    <DefaultPageLayout>
      <div className="flex flex-col">
        <header className="border-b border-gray-300 p-6 mb-6">
          <h1 className="text-3xl font-bold">Publish Release Note</h1>
          <p className="text-gray-600 mt-1">Choose publishing options.</p>
        </header>

        <Tabs>
          <Tabs.Item>
            <a href="/dashboard/release-notes/templates" className="flex items-center">
              <FeatherFileText className="inline-block mr-2" />
              Select Template
            </a>
          </Tabs.Item>
          <Tabs.Item>
            <a href="/dashboard/release-notes/customize" className="flex items-center">
              <FeatherEdit2 className="inline-block mr-2" />
              Customize
            </a>
          </Tabs.Item>
          <Tabs.Item>
            <a href="/dashboard/release-notes/preview" className="flex items-center">
              <FeatherEye className="inline-block mr-2" />
              Preview
            </a>
          </Tabs.Item>
          <Tabs.Item active>
            <a href="#" className="flex items-center">
              <FeatherSend className="inline-block mr-2" />
              Publish
            </a>
          </Tabs.Item>
        </Tabs>

        <Alert
          variant="brand"
          icon={<FeatherSend />}
          title="Ready to Publish"
          description="Set the visibility and distribution options."
          actions={<IconButton icon={<FeatherX />} aria-label="Close" onClick={() => {}} />}
          className="mt-6"
        />

        <div className="mt-6 p-6 bg-white rounded shadow">
          <fieldset>
            <legend className="font-semibold">Visibility</legend>
            <label className="flex items-center gap-3 mt-4">
              <Switch checked={false} onCheckedChange={() => {}} />
              <span>Make public</span>
            </label>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-semibold">Distribution</legend>
            <label className="flex items-center gap-3 mt-4">
              <Switch checked={false} onCheckedChange={() => {}} />
              <span>Email to subscribers</span>
            </label>
          </fieldset>

          <div className="mt-8 flex justify-between">
            <Button icon={<FeatherArrowLeft />} onClick={() => router.push("/dashboard/release-notes/preview")}>
              Back
            </Button>
            <Button icon={<FeatherSend />} onClick={() => alert("Published!")}>
              Publish Now
            </Button>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}
