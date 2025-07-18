"use client";

import React from "react";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { 
  Building, 
  Image, 
  FileText, 
  Globe, 
  Lock, 
  Users, 
  Droplet,
  Download,
  Upload
} from "lucide-react";

export default function BrandingPage() {
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
                  <SettingsMenu.Item icon={<Image size={16} />} label="Branding" selected />
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
                  <SettingsMenu.Item icon={<Lock size={16} />} label="SSO" />
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
        <div className="container max-w-2xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Brand Settings</h1>
            <p className="text-muted-foreground">
              Customize your brand identity and visual elements
            </p>
          </div>

          <div className="space-y-8">
            {/* Brand Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Brand Preview</h3>
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex items-center justify-center p-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold text-xl">YB</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">Your Brand</h4>
                      <p className="text-muted-foreground">Preview how your brand appears</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logo Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Logo Variants</h3>
              <div className="grid gap-4">
                <Card className="border-dashed bg-white">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Image className="h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <p className="font-medium">Upload light logo variant</p>
                      <p className="text-sm text-muted-foreground">SVG, PNG or JPG (max. 800x400px)</p>
                    </div>
                    <Button variant="outline" className="mt-4" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed bg-gray-900">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Image className="h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <p className="font-medium text-white">Upload dark logo variant</p>
                      <p className="text-sm text-gray-400">SVG, PNG or JPG (max. 800x400px)</p>
                    </div>
                    <Button variant="outline" className="mt-4 text-white border-gray-600 hover:bg-gray-800" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input 
                id="brandName"
                placeholder="Enter your brand name"
              />
              <p className="text-sm text-muted-foreground">
                The name that appears alongside your logo
              </p>
            </div>

            {/* Primary Font */}
            <div className="space-y-2">
              <Label>Primary Font</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="figtree">Figtree</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose your brand's primary typeface
              </p>
            </div>

            {/* Brand Colors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Brand Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      id="primaryColor"
                      placeholder="#000000"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      id="secondaryColor"
                      placeholder="#FFFFFF"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Guidelines */}
            <div className="space-y-2">
              <Label htmlFor="guidelines">Brand Guidelines</Label>
              <Textarea 
                id="guidelines"
                placeholder="Enter your brand guidelines..."
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground">
                Add notes about your brand usage and guidelines
              </p>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Footer Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download assets
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline">Reset</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
