"use client";

import React from "react";
import { TreeView } from "@/ui/components/TreeView";

import Avatar from "@/components/ui/components/Avatar";
import DropdownMenu from "@/components/ui/components/DropdownMenu";
import { FeatherUser, FeatherLogOut } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function SidebarDesignThinking() {
  return (
    <div className="flex h-full w-48 flex-col items-start justify-between bg-neutral-50">
      <div className="flex w-full flex-col items-start gap-6 px-4 py-6">
        <div className="flex w-full items-center gap-2">
          <img
            className="h-6 w-6 flex-none object-cover"
            src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=64&h=64&auto=format&fit=crop"
            alt="AI Release Notes logo"
          />
          <span className="text-heading-3 font-heading-3 text-default-font">
            AI Release Notes
          </span>
        </div>
        <TreeView>
          <TreeView.Item selected={true} label="Dashboard" icon={null} />
          <TreeView.Item label="Organizations" icon={null} />
          <TreeView.Item label="Integrations" icon={null} />
          <TreeView.Item label="Release Notes" icon={null} />
          <TreeView.Item label="Settings" icon={null} />
        </TreeView>
      </div>
      <div className="flex w-full flex-col items-start gap-3 border-t border-solid border-neutral-border px-4 py-4">
        <SubframeCore.DropdownMenu.Root>
          <SubframeCore.DropdownMenu.Trigger asChild={true}>
            <div className="flex w-full items-center gap-2 cursor-pointer">
              <Avatar
                size="small"
                image="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
              />
              <span className="text-body-bold font-body-bold text-default-font">
                Sarah Chen
              </span>
            </div>
          </SubframeCore.DropdownMenu.Trigger>
          <SubframeCore.DropdownMenu.Portal>
            <SubframeCore.DropdownMenu.Content
              side="right"
              align="end"
              sideOffset={4}
              asChild={true}
            >
              <DropdownMenu>
                <DropdownMenu.DropdownItem icon={<FeatherUser />}>
                  Profile
                </DropdownMenu.DropdownItem>
                <DropdownMenu.DropdownDivider />
                <DropdownMenu.DropdownItem icon={<FeatherLogOut />}>
                  Sign out
                </DropdownMenu.DropdownItem>
              </DropdownMenu>
            </SubframeCore.DropdownMenu.Content>
          </SubframeCore.DropdownMenu.Portal>
        </SubframeCore.DropdownMenu.Root>
      </div>
    </div>
  );
}

export default SidebarDesignThinking;
