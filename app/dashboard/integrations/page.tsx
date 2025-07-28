"use client";

import React, { useState, useEffect } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { TextField } from "@/components/ui/components/TextField";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Badge } from "@/components/ui/components/Badge";
import DropdownMenu from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { Button } from "@/ui/components/Button";
import * as SubframeCore from "@subframe/core";

import {
  FeatherSearch,
  FeatherGithub,
  FeatherRefreshCw,
  FeatherSettings,
  FeatherLogOut,
  FeatherMoreVertical,
  FeatherTrello,
  FeatherLayout,
  FeatherMessageSquare,
  FeatherExternalLink,
} from "@subframe/core";

export default function IntegrationsPage() {
  // Connection status states; replace with real API/session fetch
  const [connectionStatus, setConnectionStatus] = useState({
    github: false,
    jira: false,
    linear: false,
    slack: false,
  });

  // Slack config visibility
  const [showSlackConfig, setShowSlackConfig] = useState(false);

  // Example effect to fetch real statuses from API (replace with your API call)
  useEffect(() => {
    async function fetchStatus() {
      // TODO: Fetch connection statuses from your backend API
      // Example response: { github: true, jira: false, linear: false, slack: true }
      const response = await fetch("/api/integrations/status");
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data);
      }
    }
    fetchStatus();
  }, []);

  // Handlers to initiate OAuth (replace URLs with your actual OAuth endpoints)
  const handleConnect = (service: string) => {
    window.location.href = `/api/oauth/${service}/start`;
  };

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start gap-12 bg-default-background py-12">
        <div className="flex w-full max-w-[1024px] flex-col items-start gap-6">
          <h1 className="text-heading-1 font-heading-1 text-default-font">Integrations</h1>
          <p className="text-body font-body text-subtext-color">
            Connect your tools and services to enhance your release notes workflow
          </p>
          <TextField
            label="Search"
            className="h-auto w-full flex-none"
            icon={<FeatherSearch />}
          >
            <TextField.Input
              placeholder="Search integrations..."
              value=""
              onChange={() => {}}
            />
          </TextField>

          <div className="flex w-full flex-wrap items-start gap-6">

            {/* GitHub Card */}
            <div className="flex min-w-[320px] flex-col gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
              <div className="flex items-center gap-4">
                <IconWithBackground size="large" icon={<FeatherGithub />} />
                <div className="grow flex flex-col gap-1">
                  <span className="text-body-bold font-body-bold text-default-font">GitHub</span>
                  {connectionStatus.github ? (
                    <Badge variant="success">✅ Connected</Badge>
                  ) : (
                    <Badge variant="neutral">⚪ Not Connected</Badge>
                  )}
                </div>
                {connectionStatus.github ? (
                  <SubframeCore.DropdownMenu.Root>
                    <SubframeCore.DropdownMenu.Trigger asChild>
                      <IconButton size="small" icon={<FeatherMoreVertical />} />
                    </SubframeCore.DropdownMenu.Trigger>
                    <SubframeCore.DropdownMenu.Portal>
                      <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild>
                        <DropdownMenu>
                          <DropdownMenu.Item icon={<FeatherRefreshCw />}>Test Connection</DropdownMenu.Item>
                          <DropdownMenu.Item icon={<FeatherSettings />}>Configure</DropdownMenu.Item>
                          <DropdownMenu.Divider />
                          <DropdownMenu.Item icon={<FeatherLogOut />}>Disconnect</DropdownMenu.Item>
                        </DropdownMenu>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>
                ) : (
                  <Button onClick={() => handleConnect("github")}>Connect</Button>
                )}
              </div>
              <span className="text-body text-subtext-color">
                Sync issues, pull requests, and commits for automated release notes
              </span>
            </div>

            {/* Jira Card */}
            <div className="flex min-w-[320px] flex-col gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
              <div className="flex items-center gap-4">
                <IconWithBackground size="large" icon={<FeatherTrello />} />
                <div className="grow flex flex-col gap-1">
                  <span className="text-body-bold font-body-bold text-default-font">Jira</span>
                  {connectionStatus.jira ? (
                    <Badge variant="success">✅ Connected</Badge>
                  ) : (
                    <Badge variant="neutral">⚪ Not Connected</Badge>
                  )}
                </div>
                {connectionStatus.jira ? (
                  <Button onClick={() => alert("Configure Jira Integration")}>Configure</Button>
                ) : (
                  <Button onClick={() => handleConnect("jira")}>Connect</Button>
                )}
              </div>
              <span className="text-body text-subtext-color">
                Import tickets and project management data into your release notes
              </span>
            </div>

            {/* Linear Card */}
            <div className="flex min-w-[320px] flex-col gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
              <div className="flex items-center gap-4">
                <IconWithBackground size="large" icon={<FeatherLayout />} />
                <div className="grow flex flex-col gap-1">
                  <span className="text-body-bold font-body-bold text-default-font">Linear</span>
                  {connectionStatus.linear ? (
                    <Badge variant="success">✅ Connected</Badge>
                  ) : (
                    <Badge variant="neutral">⚪ Not Connected</Badge>
                  )}
                </div>
                {connectionStatus.linear ? (
                  <Button onClick={() => alert("Configure Linear Integration")}>Configure</Button>
                ) : (
                  <Button onClick={() => handleConnect("linear")}>Connect</Button>
                )}
              </div>
              <span className="text-body text-subtext-color">
                Sync issues and workflow data for comprehensive release documentation
              </span>
            </div>

            {/* Slack Card */}
            <div className="flex min-w-[320px] flex-col gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
              <div className="flex items-center gap-4">
                <IconWithBackground size="large" icon={<FeatherMessageSquare />} />
                <div className="grow flex flex-col gap-1">
                  <span className="text-body-bold font-body-bold text-default-font">Slack</span>
                  {connectionStatus.slack ? (
                    <Badge variant="success">✅ Connected</Badge>
                  ) : (
                    <Badge variant="warning">⚪ Not Connected</Badge>
                  )}
                </div>
                <Button
                  variant="neutral-secondary"
                  onClick={() => setShowSlackConfig((prev) => !prev)}
                >
                  Configure
                </Button>
              </div>
              <span className="text-body text-subtext-color">
                Automate release note notifications in your Slack channels
              </span>
              {showSlackConfig && (
                <div className="mt-4 p-4 bg-gray-100 rounded border border-gray-300 w-full">
                  {/* Slack Integration configuration UI here */}
                  <p className="mb-2 font-semibold">Slack Configuration</p>
                  {/* Example: Channel settings, toggle notifications */}
                  <label className="block mb-1 font-medium">Channel Name</label>
                  <input
                    type="text"
                    placeholder="#release-notes"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <Button className="mt-4" onClick={() => alert("Save Slack config")}>
                    Save Settings
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full max-w-[1024px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
            <h3 className="text-heading-3 font-heading-3 text-default-font">Need help?</h3>
            <p className="text-body font-body text-subtext-color">
              Check our documentation for detailed integration guides and troubleshooting tips
            </p>
            <Button
              variant="neutral-secondary"
              icon={<FeatherExternalLink />}
              onClick={() => window.open("https://your-docs-url", "_blank")}
            >
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

// // app/dashboard/integrations/page.tsx

// "use client";

// import React from "react";
// import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
// import { TextField } from "@/components/ui/components/TextField";
// import { FeatherSearch } from "@subframe/core";
// import { IconWithBackground } from "@/ui/components/IconWithBackground";
// import { FeatherGithub } from "@subframe/core";
// import { Badge } from "@/components/ui/components/Badge";
// import DropdownMenu from "@/ui/components/DropdownMenu";
// import { FeatherRefreshCw } from "@subframe/core";
// import { FeatherSettings } from "@subframe/core";
// import { FeatherLogOut } from "@subframe/core";
// import * as SubframeCore from "@subframe/core";
// import { IconButton } from "@/ui/components/IconButton";
// import { FeatherMoreVertical } from "@subframe/core";
// import { Button } from "@/ui/components/Button";
// import { FeatherTrello } from "@subframe/core";
// import { FeatherLayout } from "@subframe/core";
// import { FeatherMessageSquare } from "@subframe/core";
// import { FeatherExternalLink } from "@subframe/core";

// function MinimalIntegrationsHub() {
//   return (
//     <DefaultPageLayout>
//       <div className="container max-w-none flex h-full w-full flex-col items-start gap-12 bg-default-background py-12">
//         <div className="flex w-full max-w-[1024px] flex-col items-start gap-6">
//           <div className="flex w-full flex-col items-start gap-2">
//             <span className="text-heading-1 font-heading-1 text-default-font">
//               Integrations
//             </span>
//             <span className="text-body font-body text-subtext-color">
//               Connect your tools and services to enhance your release notes
//               workflow
//             </span>
//           </div>
//           <TextField
//             className="h-auto w-full flex-none"
//             label=""
//             helpText=""
//             icon={<FeatherSearch />}
//           >
//             <TextField.Input
//               placeholder="Search integrations..."
//               value=""
//               onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
//             />
//           </TextField>
//           <div className="flex w-full flex-wrap items-start gap-6">
//             {/* Integration Cards */}
//             {/* GitHub Card */}
//             <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
//               <div className="flex w-full items-center gap-4">
//                 <IconWithBackground size="large" icon={<FeatherGithub />} />
//                 <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
//                   <span className="text-body-bold font-body-bold text-default-font">GitHub</span>
//                   <Badge variant="success">Connected</Badge>
//                 </div>
//                 <SubframeCore.DropdownMenu.Root>
//                   <SubframeCore.DropdownMenu.Trigger asChild={true}>
//                     <IconButton
//                       size="small"
//                       icon={<FeatherMoreVertical />}
//                       onClick={(e) => {}}
//                     />
//                   </SubframeCore.DropdownMenu.Trigger>
//                   <SubframeCore.DropdownMenu.Portal>
//                     <SubframeCore.DropdownMenu.Content
//                       side="bottom"
//                       align="end"
//                       sideOffset={4}
//                       asChild={true}
//                     >
//                       <DropdownMenu>
//                         <DropdownMenu.Item icon={<FeatherRefreshCw />}>
//                           Test Connection
//                         </DropdownMenu.Item>
//                         <DropdownMenu.Item icon={<FeatherSettings />}>
//                           Configure
//                         </DropdownMenu.Item>
//                         <DropdownMenu.Divider />
//                         <DropdownMenu.Item icon={<FeatherLogOut />}>
//                           Disconnect
//                         </DropdownMenu.Item>
//                       </DropdownMenu>
//                     </SubframeCore.DropdownMenu.Content>
//                   </SubframeCore.DropdownMenu.Portal>
//                 </SubframeCore.DropdownMenu.Root>
//               </div>
//               <span className="text-body font-body text-subtext-color">
//                 Sync issues, pull requests, and commits for automated release
//                 notes
//               </span>
//               <Button
//                 className="h-8 w-full flex-none"
//                 variant="neutral-secondary"
//                 onClick={() => {}}
//               >
//                 Generate Release Notes
//               </Button>
//             </div>
//             {/* Jira Card */}
//             <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
//               <div className="flex w-full items-center gap-4">
//                 <IconWithBackground size="large" icon={<FeatherTrello />} />
//                 <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
//                   <span className="text-body-bold font-body-bold text-default-font">Jira</span>
//                   <Badge variant="neutral">Not Connected</Badge>
//                 </div>
//               </div>
//               <span className="text-body font-body text-subtext-color">
//                 Import tickets and project management data into your release
//                 notes
//               </span>
//               <Button className="h-8 w-full flex-none" onClick={() => {}}>
//                 Connect
//               </Button>
//             </div>
//             {/* Linear Card */}
//             <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
//               <div className="flex w-full items-center gap-4">
//                 <IconWithBackground size="large" icon={<FeatherLayout />} />
//                 <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
//                   <span className="text-body-bold font-body-bold text-default-font">Linear</span>
//                   <Badge variant="neutral">Not Connected</Badge>
//                 </div>
//               </div>
//               <span className="text-body font-body text-subtext-color">
//                 Sync issues and workflow data for comprehensive release
//                 documentation
//               </span>
//               <Button className="h-8 w-full flex-none" onClick={() => {}}>
//                 Connect
//               </Button>
//             </div>
//             {/* Slack Card */}
//             <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
//               <div className="flex w-full items-center gap-4">
//                 <IconWithBackground size="large" icon={<FeatherMessageSquare />} />
//                 <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
//                   <span className="text-body-bold font-body-bold text-default-font">Slack</span>
//                   <Badge variant="warning">Configuration Required</Badge>
//                 </div>
//               </div>
//               <span className="text-body font-body text-subtext-color">
//                 Automate release note notifications in your Slack channels
//               </span>
//               <Button
//                 className="h-8 w-full flex-none"
//                 variant="neutral-secondary"
//                 onClick={() => {}}
//               >
//                 Configure
//               </Button>
//             </div>
//           </div>
//         </div>
//         <div className="flex w-full max-w-[1024px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
//           <div className="flex w-full flex-col items-start gap-2">
//             <span className="text-heading-3 font-heading-3 text-default-font">
//               Need help?
//             </span>
//             <span className="text-body font-body text-subtext-color">
//               Check our documentation for detailed integration guides and
//               troubleshooting tips
//             </span>
//           </div>
//           <Button
//             variant="neutral-secondary"
//             icon={<FeatherExternalLink />}
//             onClick={() => {}}
//           >
//             View Documentation
//           </Button>
//         </div>
//       </div>
//     </DefaultPageLayout>
//   );
// }

// export default MinimalIntegrationsHub;
