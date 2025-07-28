"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import Tabs from "@/components/ui/components/Tabs";
import { IconButton } from "@/ui/components/IconButton";
import { Button } from "@/ui/components/Button";
import { Badge } from "@/components/ui/components/Badge";
import DropdownMenu from "@/ui/components/DropdownMenu";
import { TextField } from "@/components/ui/components/TextField";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { redirect } from 'next/navigation';

import {
  FiFileText,
  FiEdit2,
  FiEye,
  FiSend,
  FiZap,
  FiChevronDown,
  FiArrowRight,
} from "react-icons/fi";


export default function TemplatesPage() {
  const router = useRouter();
  const pathname = usePathname();

  // Map pathname to tab index
  const getActiveIndex = () => {
    if (pathname?.endsWith("/templates")) return 0;
    else if (pathname?.endsWith("/customize")) return 1;
    else if (pathname?.endsWith("/preview")) return 2;
    else if (pathname?.endsWith("/publish")) return 3;
    else return 0;
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndex());

  useEffect(() => {
    setActiveIndex(getActiveIndex());
  }, [pathname]);

  const onTabChange = (index: number) => {
    setActiveIndex(index);
    switch (index) {
      case 0:
        router.push("/dashboard/release-notes/templates");
        break;
      case 1:
        router.push("/dashboard/release-notes/customize");
        break;
      case 2:
        router.push("/dashboard/release-notes/preview");
        break;
      case 3:
        router.push("/dashboard/release-notes/publish");
        break;
    }
  };

  return (
    <DefaultPageLayout>
      <div className="flex flex-col">
        <header className="border-b border-gray-300 p-6 mb-6">
          <h1 className="text-3xl font-bold">Create Release Note</h1>
          <p className="text-gray-600 mt-1">Choose a template to get started.</p>
        </header>

        <Tabs>
          <Tabs.Item active={activeIndex === 0}>
            <button onClick={() => onTabChange(0)} className="flex items-center">
              <FiFileText className="inline-block mr-2" />
              Select Template
            </button>
          </Tabs.Item>
          <Tabs.Item active={activeIndex === 1}>
            <button onClick={() => onTabChange(1)} className="flex items-center">
              <FiEdit2 className="inline-block mr-2" />
              Customize
            </button>
          </Tabs.Item>
          <Tabs.Item active={activeIndex === 2}>
            <button onClick={() => onTabChange(2)} className="flex items-center">
              <FiEye className="inline-block mr-2" />
              Preview
            </button>
          </Tabs.Item>
          <Tabs.Item active={activeIndex === 3}>
            <button onClick={() => onTabChange(3)} className="flex items-center">
              <FiSend className="inline-block mr-2" />
              Publish
            </button>
          </Tabs.Item>
        </Tabs>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center mt-6">
          <TextField icon={<FiZap />} label="Search Templates">
            <TextField.Input
              placeholder="Search templates"
              value=""
              onChange={() => {}}
            />
          </TextField>
          <Button variant="neutral-tertiary" iconRight={<FiChevronDown />}>
            All Categories
          </Button>
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          {/* Example Template Card */}
          <div className="bg-white p-6 rounded border border-gray-200 shadow">
            <IconWithBackground icon={<FiFileText />} size="large" />
            <h2 className="mt-4 font-semibold text-xl">Traditional Release Notes</h2>
            <p className="text-gray-600 mt-1">
              Professional format with features, fixes, and improvements.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="neutral">Traditional</Badge>
              <Badge variant="neutral">Developers</Badge>
              <Badge variant="neutral">Markdown</Badge>
            </div>
            <Button
              className="mt-6"
              icon={<FiArrowRight />}
              onClick={() => router.push("/dashboard/release-notes/customize")}
            >
              Use Template
            </Button>
          </div>

          {/* Add more template cards similarly */}
        </div>
      </div>
    </DefaultPageLayout>
  );
}
