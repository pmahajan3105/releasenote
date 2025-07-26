"use client";

import React from "react";
import { useRouter, usePathname } from 'next/navigation';
import { TreeView } from "@/ui/components/TreeView";
import { Avatar } from "@/ui/components/Avatar";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { FeatherUser } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function SidebarDesignThinking() {
  const router = useRouter();
  const pathname = usePathname();

  // Mock user data - replace with your actual auth hook
  const user = {
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&auto=format&fit=crop"
  };

  const handleSignOut = () => {
    // Replace with your actual sign out logic
    console.log("Signing out...");
    router.push('/');
  };

  const handleProfileClick = () => {
    router.push('/dashboard/settings');
  };

  return (
    <div className="flex h-full w-48 flex-col items-start justify-between bg-neutral-50">
      <div className="flex w-full flex-col items-start gap-6 px-4 py-6">
        <div className="flex w-full items-center gap-2">
          <img
            className="h-6 w-6 flex-none object-cover"
            src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=64&h=64&auto=format&fit=crop"
            alt="AI Release Notes Logo"
          />
          <span className="text-heading-3 font-heading-3 text-default-font">
            AI Release Notes
          </span>
        </div>
        <TreeView>
          <TreeView.Item 
            selected={pathname === '/dashboard'} 
            label="Dashboard" 
            icon={null}
            onClick={() => router.push('/dashboard')}
          />
          <TreeView.Item 
            selected={pathname.startsWith('/dashboard/organizations')} 
            label="Organizations" 
            icon={null}
            onClick={() => router.push('/dashboard/organizations')}
          />
          <TreeView.Item 
            selected={pathname.startsWith('/dashboard/integrations')} 
            label="Integrations" 
            icon={null}
            onClick={() => router.push('/dashboard/integrations')}
          />
          <TreeView.Item 
            selected={pathname.startsWith('/dashboard/release-notes')} 
            label="Release Notes" 
            icon={null}
            onClick={() => router.push('/dashboard/release-notes')}
          />
          <TreeView.Item 
            selected={pathname.startsWith('/dashboard/settings')} 
            label="Settings" 
            icon={null}
            onClick={() => router.push('/dashboard/settings')}
          />
        </TreeView>
      </div>
      <div className="flex w-full flex-col items-start gap-3 border-t border-solid border-neutral-border px-4 py-4">
        <SubframeCore.DropdownMenu.Root>
          <SubframeCore.DropdownMenu.Trigger asChild={true}>
            <div className="flex w-full items-center gap-2 cursor-pointer hover:bg-neutral-100 rounded-md p-2 transition-colors">
              <Avatar
                size="small"
                image={user.avatar}
                name={user.name}
              />
              <span className="text-body-bold font-body-bold text-default-font">
                {user.name}
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
                <DropdownMenu.DropdownItem 
                  icon={<FeatherUser />}
                  onClick={handleProfileClick}
                >
                  Profile
                </DropdownMenu.DropdownItem>
                <DropdownMenu.DropdownDivider />
                <DropdownMenu.DropdownItem 
                  icon={<FeatherLogOut />}
                  onClick={handleSignOut}
                >
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
