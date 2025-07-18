"use client";

import React from "react";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import Link from "next/link";
import { 
  Building, 
  Image, 
  FileText, 
  Globe, 
  Lock, 
  Users, 
  X, 
  Shield, 
  Key, 
  CheckCircle, 
  HelpCircle,
  Settings
} from "lucide-react";

export default function SsoPage() {
  return (
    <div className="flex h-full w-full">
      {/* Settings Sidebar */}
      <SettingsMenu className="w-64 border-r bg-card">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Organization</h3>
              <div className="space-y-1">
                <Link href="/dashboard/settings/organization" className="block">
                  <SettingsMenu.Item icon={<Building size={16} />} label="Organization Settings" />
                </Link>
                <Link href="/dashboard/settings/branding" className="block">
                  <SettingsMenu.Item icon={<Image size={16} />} label="Branding" />
                </Link>
                <Link href="/dashboard/templates" className="block">
                  <SettingsMenu.Item icon={<FileText size={16} />} label="Templates" />
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Access</h3>
              <div className="space-y-1">
                <Link href="/dashboard/settings/domain" className="block">
                  <SettingsMenu.Item icon={<Globe size={16} />} label="Domain" />
                </Link>
                <Link href="/dashboard/settings/sso" className="block">
                  <SettingsMenu.Item icon={<Lock size={16} />} label="SSO" selected />
                </Link>
                <Link href="/dashboard/settings/team" className="block">
                  <SettingsMenu.Item icon={<Users size={16} />} label="Team Members" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SettingsMenu>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Single Sign-On</h1>
            <p className="text-muted-foreground">
              Configure and manage SSO authentication for your organization
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Configuration</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Setup Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Set up SSO authentication</h4>
                  <AlertDescription className="text-blue-700">
                    Connect your identity provider to enable secure single sign-on for your organization.
                  </AlertDescription>
                </div>
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <X className="h-4 w-4" />
                </Button>
              </Alert>

              {/* Identity Providers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Identity Providers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="text-center">
                    <CardHeader className="pb-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle>Okta</CardTitle>
                      <CardDescription>Enterprise identity platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Configure</Button>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardHeader className="pb-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Key className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle>Azure AD</CardTitle>
                      <CardDescription>Microsoft identity service</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Configure</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Connection Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Connection Status</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-medium">SSO is active and healthy</p>
                          <p className="text-sm text-muted-foreground">Last checked 2 minutes ago</p>
                        </div>
                      </div>
                      <Button variant="outline">Test Connection</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Log */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Activity Log</h3>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">SSO Authentication</TableCell>
                          <TableCell className="text-muted-foreground">john.doe@example.com</TableCell>
                          <TableCell className="text-muted-foreground">2 mins ago</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              Success
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Configuration Update</TableCell>
                          <TableCell className="text-muted-foreground">admin@example.com</TableCell>
                          <TableCell className="text-muted-foreground">1 hour ago</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              Success
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">SSO Authentication</TableCell>
                          <TableCell className="text-muted-foreground">sarah.smith@example.com</TableCell>
                          <TableCell className="text-muted-foreground">3 hours ago</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Failed</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced SSO Configuration</CardTitle>
                  <CardDescription>
                    Configure advanced SSO settings and security options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Advanced settings will be available here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Actions */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                View documentation
              </Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
