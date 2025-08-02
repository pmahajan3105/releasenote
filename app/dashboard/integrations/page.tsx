"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FeatherLoader,
} from "@subframe/core";

interface IntegrationStatus {
  connected: boolean;
  username?: string;
  workspace?: string;
}

interface IntegrationsData {
  github: IntegrationStatus;
  jira: IntegrationStatus;
  linear: IntegrationStatus;
  slack: IntegrationStatus;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<IntegrationsData>({
    github: { connected: false },
    jira: { connected: false },
    linear: { connected: false },
    slack: { connected: false },
  });
  const [loading, setLoading] = useState(true);
  const [showSlackConfig, setShowSlackConfig] = useState(false);

  // Fetch integration statuses from API
  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        const response = await fetch("/api/integrations/status");
        
        if (response.ok) {
          const data = await response.json();
          setIntegrations(data);
        } else {
          // Mock data for development
          setTimeout(() => {
            setIntegrations({
              github: { connected: true, username: "johndoe" },
              jira: { connected: false },
              linear: { connected: false },
              slack: { connected: true, workspace: "acme-corp" },
            });
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to fetch integration status:", error);
        // Fallback to mock data
        setIntegrations({
          github: { connected: true, username: "johndoe" },
          jira: { connected: false },
          linear: { connected: false },
          slack: { connected: true, workspace: "acme-corp" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrationStatus();
  }, []);

  // OAuth redirection handlers
  const handleOAuthConnect = (service: string) => {
    const oauthUrls = {
      github: "/api/oauth/github",
      jira: "/api/oauth/jira", 
      linear: "/api/oauth/linear",
      slack: "/api/oauth/slack"
    };
    
    // Use router.push for client-side navigation to OAuth endpoint
    window.location.href = oauthUrls[service as keyof typeof oauthUrls];
  };

  const handleDisconnect = async (service: string) => {
    try {
      const response = await fetch(`/api/integrations/${service}/disconnect`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Update state to reflect disconnection
        setIntegrations(prev => ({
          ...prev,
          [service]: { connected: false }
        }));
      }
    } catch (error) {
      console.error(`Failed to disconnect ${service}:`, error);
    }
  };

  const renderConnectionStatus = (integration: IntegrationStatus, serviceName: string) => {
    if (loading) {
      return <Badge variant="neutral"><FeatherLoader className="animate-spin" /> Loading...</Badge>;
    }
    
    if (integration.connected) {
      const displayName = integration.username || integration.workspace || "Connected";
      return (
        <Badge variant="success" className="text-green-600">
          Connected as {displayName}
        </Badge>
      );
    } else {
      return (
        <Badge variant="error" className="text-red-600">
          Not Connected
        </Badge>
      );
    }
  };

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start overflow-y-auto min-h-screen bg-default-background py-12">
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
                  {renderConnectionStatus(integrations.github, "GitHub")}
                </div>
                {integrations.github.connected ? (
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
                          <DropdownMenu.Item 
                            icon={<FeatherLogOut />}
                            onClick={() => handleDisconnect("github")}
                          >
                            Disconnect
                          </DropdownMenu.Item>
                        </DropdownMenu>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>
                ) : (
                  <Button 
                    onClick={() => handleOAuthConnect("github")}
                    disabled={loading}
                  >
                    Connect
                  </Button>
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
                  {renderConnectionStatus(integrations.jira, "Jira")}
                </div>
                {integrations.jira.connected ? (
                  <Button 
                    variant="neutral-secondary"
                    onClick={() => router.push("/dashboard/integrations/jira/configure")}
                  >
                    Configure
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleOAuthConnect("jira")}
                    disabled={loading}
                  >
                    Connect
                  </Button>
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
                  {renderConnectionStatus(integrations.linear, "Linear")}
                </div>
                {integrations.linear.connected ? (
                  <Button 
                    variant="neutral-secondary"
                    onClick={() => router.push("/dashboard/integrations/linear/configure")}
                  >
                    Configure
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleOAuthConnect("linear")}
                    disabled={loading}
                  >
                    Connect
                  </Button>
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
                  {renderConnectionStatus(integrations.slack, "Slack")}
                </div>
                <Button
                  variant="neutral-secondary"
                  onClick={() => integrations.slack.connected ? setShowSlackConfig(prev => !prev) : handleOAuthConnect("slack")}
                  disabled={loading}
                >
                  {integrations.slack.connected ? "Configure" : "Connect"}
                </Button>
              </div>
              <span className="text-body text-subtext-color">
                Automate release note notifications in your Slack channels
              </span>
              {showSlackConfig && integrations.slack.connected && (
                <div className="mt-4 p-4 bg-neutral-50 rounded border border-neutral-200 w-full">
                  <p className="mb-2 font-semibold text-default-font">Slack Configuration</p>
                  <label className="block mb-1 font-medium text-body">Channel Name</label>
                  <input
                    type="text"
                    placeholder="#release-notes"
                    className="w-full p-2 border border-neutral-200 rounded text-body"
                  />
                  <Button className="mt-4" onClick={() => setShowSlackConfig(false)}>
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
