"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Alert } from "../../components/ui/alert"
import { TextField } from "../../components/ui/text-field"
import { TextArea } from "../../components/ui/text-area"
import { TreeView } from "../../components/ui/tree-view"
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar"
import { IconWithBackground } from "../../components/ui/icon-with-background"
import TwoFactorAuth from "../../components/auth/two-factor-auth"
import { Home, Settings, User, Bell, Zap, Star, Globe, FileText } from "lucide-react"

export default function ComponentsShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Component Showcase
          </h1>
          <p className="text-lg text-gray-600">
            Explore our enhanced UI components and design system
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="neutral-secondary">Neutral Secondary</Button>
              <Button variant="neutral-tertiary">Neutral Tertiary</Button>
              <Button variant="brand-tertiary">Brand Tertiary</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button icon={<Home className="w-4 h-4" />}>With Icon</Button>
              <Button iconRight={<Settings className="w-4 h-4" />}>Icon Right</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="neutral">Neutral</Badge>
              <Badge icon={<Star className="w-3 h-3" />}>With Icon</Badge>
              <Badge variant="neutral" icon={<Zap className="w-3 h-3" />}>
                Neutral + Icon
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Bell className="h-4 w-4" />
              <Alert.Title>Default Alert</Alert.Title>
              <Alert.Description>
                This is a default alert with an icon and description.
              </Alert.Description>
            </Alert>
            
            <Alert variant="brand">
              <Star className="h-4 w-4" />
              <Alert.Title>Brand Alert</Alert.Title>
              <Alert.Description>
                This is a brand variant alert with custom styling.
              </Alert.Description>
              <Alert.Actions>
                <Button size="sm" variant="outline">Action</Button>
              </Alert.Actions>
            </Alert>
            
            <Alert variant="destructive">
              <Alert.Title>Destructive Alert</Alert.Title>
              <Alert.Description>
                This is an error alert to show important warnings.
              </Alert.Description>
            </Alert>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Standard TextField" helpText="This is help text">
              <TextField.Input placeholder="Enter some text" />
            </TextField>
            
            <TextField>
              <TextField.Label>Compound TextField</TextField.Label>
              <TextField.Input placeholder="Using compound pattern" />
            </TextField>

            <TextArea label="Text Area" helpText="For longer text input">
              <TextArea.Input placeholder="Enter multiple lines of text..." />
            </TextArea>
          </CardContent>
        </Card>

        {/* TreeView */}
        <Card>
          <CardHeader>
            <CardTitle>Tree View Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <TreeView>
              <TreeView.Item 
                selected={true} 
                label="Dashboard" 
                icon={<Home className="w-4 h-4" />} 
              />
              <TreeView.Item 
                label="Settings" 
                icon={<Settings className="w-4 h-4" />} 
              />
              <TreeView.Item 
                label="Profile" 
                icon={<User className="w-4 h-4" />} 
              />
            </TreeView>
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card>
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar size="small">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              
              <Avatar size="medium">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              
              <Avatar size="large">
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* Icon with Background */}
        <Card>
          <CardHeader>
            <CardTitle>Icon with Background</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <IconWithBackground 
                size="small" 
                variant="default"
                icon={<Home />} 
              />
              <IconWithBackground 
                size="medium" 
                variant="primary"
                icon={<Settings />} 
              />
              <IconWithBackground 
                size="large" 
                variant="secondary"
                icon={<User />} 
              />
            </div>
          </CardContent>
        </Card>

        {/* 2FA Component */}
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Demo: Use code "123456" to verify
              </p>
              <div style={{ height: "400px" }}>
                <TwoFactorAuth
                  onVerify={(code) => alert(`Verification code: ${code}`)}
                  onResendCode={() => alert("Code resent!")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Hub */}
        <Card>
          <CardHeader>
            <CardTitle>Settings Hub Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Multiple variations of the settings hub with different layouts and specialized pages.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/settings/organization-enhanced">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Enhanced Settings Hub
                  </Button>
                </Link>
                <Link href="/dashboard/settings/minimal-hub">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Minimal Hub (Mobile-First)
                  </Button>
                </Link>
                <Link href="/dashboard/settings/domain">
                  <Button variant="outline">
                    <Globe className="w-4 h-4 mr-2" />
                    Domain Management
                  </Button>
                </Link>
                <Link href="/dashboard/settings/sso">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    SSO Configuration
                  </Button>
                </Link>
                <Link href="/dashboard/settings/team">
                  <Button variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Team Management
                  </Button>
                </Link>
                <Link href="/dashboard/settings/branding">
                  <Button variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Brand Settings
                  </Button>
                </Link>
                <Link href="/dashboard/templates">
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Templates Management
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="neutral-tertiary">
                    Original Settings
                  </Button>
                </Link>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Enhanced: Desktop-focused with fixed sidebar</p>
                <p>• Minimal: Mobile-first responsive design</p>
                <p>• Domain: SSL certificates and DNS verification</p>
                <p>• SSO: Single Sign-On identity provider configuration</p>
                <p>• Team: Member management with roles and permissions</p>
                <p>• Branding: Logo uploads, colors, fonts, and brand guidelines</p>
                <p>• Templates: Release note template management and customization</p>
                <p>• Original: Simple card-based layout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
