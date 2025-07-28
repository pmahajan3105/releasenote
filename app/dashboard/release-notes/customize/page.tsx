"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import Tabs from "@/components/ui/components/Tabs";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Alert } from "@/ui/components/Alert";
import { TextField } from "@/components/ui/components/TextField";
import { TextArea } from "@/components/ui/components/TextArea";
import { Badge } from "@/components/ui/components/Badge";
// Removed duplicate and incorrect import of FeatherFileText


import {
  FiFileText,
  FiEdit2,
  FiEye,
  FiSend,
  FiFeather,
  FiChevronDown,
  FiTag,
  FiArrowLeft,
  FiArrowRight,
  FiPlus,
} from "react-icons/fi";

export default function CustomizePage() {
  const router = useRouter();

  return (
    <DefaultPageLayout>
      <div className="flex flex-col">
        <header className="border-b border-gray-300 p-6 mb-6">
          <h1 className="text-3xl font-bold">Customize Release Note</h1>
          <p className="text-gray-600 mt-1">Modify your release note content.</p>
        </header>

        <Tabs>
          <Tabs.Item>
            <button
              className="flex items-center"
              onClick={() => router.push("/dashboard/release-notes/templates")}
            >
              <FiFileText className="inline-block mr-2" /> Select Template
            </button>
          </Tabs.Item>
          <Tabs.Item active>
            <span className="flex items-center">
              <FiEdit2 className="inline-block mr-2" /> Customize
            </span>
          </Tabs.Item>
          <Tabs.Item>
            <button
              className="flex items-center"
              onClick={() => router.push("/dashboard/release-notes/preview")}
            >
              <FiEye className="inline-block mr-2" /> Preview
            </button>
          </Tabs.Item>
          <Tabs.Item>
            <button
              className="flex items-center"
              onClick={() => router.push("/dashboard/release-notes/publish")}
            >
              <FiSend className="inline-block mr-2" /> Publish
            </button>
          </Tabs.Item>
        </Tabs>

        <div className="mt-6">
          <TextField label="Title" helpText="Enter release title">
            <TextField.Input placeholder="Release title" value="" onChange={() => {}} />
          </TextField>

          <TextArea label="What's New" helpText="Highlight new features" className="mt-4">
            <TextArea.Input placeholder="New features" value="" onChange={() => {}} />
          </TextArea>

          <TextArea label="Bug Fixes" helpText="List resolved bugs" className="mt-4">
            <TextArea.Input placeholder="Bug fixes" value="" onChange={() => {}} />
          </TextArea>

          <TextArea label="Technical Details" helpText="Technical notes" className="mt-4">
            <TextArea.Input placeholder="Technical details" value="" onChange={() => {}} />
          </TextArea>
          <Button className="mt-6" icon={<FiPlus />}>
            Add Section
          </Button>

          <div className="mt-6 flex gap-3">
            <Badge variant="neutral" icon={<FiTag />}>Feature</Badge>
            <Button variant="primary" icon={<FiPlus />}>Add</Button>
            <Button variant="primary" icon={<FiPlus />}>
              Add Tag
            </Button>
          </div>

          <div className="mt-8 flex justify-between">
            <Button icon={<FiArrowLeft />} onClick={() => router.push("/dashboard/release-notes/templates")}>
              Back
            </Button>

            <Button icon={<FiArrowRight />} onClick={() => router.push("/dashboard/release-notes/preview")}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}
