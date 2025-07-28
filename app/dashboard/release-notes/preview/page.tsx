"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import Tabs from "@/components/ui/components/Tabs";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Alert } from "@/ui/components/Alert";
import { Badge } from "@/components/ui/components/Badge";

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
  FiX,
} from "react-icons/fi";

export default function PreviewPage() {
  const router = useRouter();

  return (
    <DefaultPageLayout>
      <div className="flex flex-col">
        <header className="border-b border-gray-300 p-6 mb-6">
          <h1 className="text-3xl font-bold">Preview Release Note</h1>
          <p className="text-gray-600 mt-1">Review before publishing.</p>
        </header>

        <Tabs>
          <Tabs.Item>
            <a href="/dashboard/release-notes/templates" className="flex items-center">
              <FiFileText className="inline-block mr-2" />
              Select Template
            </a>
          </Tabs.Item>
          <Tabs.Item>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push("/dashboard/release-notes/customize");
              }}
              className="flex items-center"
            >
              <FiEdit2 className="inline-block mr-2" />
              Customize
            </a>
          </Tabs.Item>
          <Tabs.Item active>
            <div className="flex items-center">
              <FiEye className="inline-block mr-2" />
              Preview
            </div>
          </Tabs.Item>
          <Tabs.Item>
            <div
              className="flex items-center"
              onClick={() => router.push("/dashboard/release-notes/publish")}
            >
              <FiSend className="inline-block mr-2" />
              Publish
            </div>
          </Tabs.Item>
        </Tabs>

        {/* Preview content goes here */}
        <div className="mt-6 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-semibold">Release: v1.0.0</h2>
          <p className="text-gray-700">Lorem ipsum dolor sit amet...</p>

          <div className="mt-4 flex gap-3">
            <Badge variant="neutral" icon={<FiTag />}>Feature</Badge>
            <Badge variant="neutral" icon={<FiTag />}>Bug Fix</Badge>
          </div>

          <div className="mt-8 flex justify-between">
            <Button icon={<FiArrowLeft />} onClick={() => router.push("/dashboard/release-notes/customize")}>
              Back
            </Button>
            <Button icon={<FiArrowRight />} onClick={() => router.push("/dashboard/release-notes/publish")}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}
