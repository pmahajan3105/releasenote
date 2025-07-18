"use client";

import React from "react";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { 
  Building, 
  Image, 
  FileText, 
  Globe, 
  Lock, 
  Users, 
  X, 
  Search, 
  ChevronDown, 
  UserPlus,
  Check,
  MoreVertical,
  Edit2,
  Key,
  Trash,
  Clock
} from "lucide-react";

export default function TeamMembersPage() {
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
                  <SettingsMenu.Item icon={<Lock size={16} />} label="SSO" />
                </Link>
                <Link href="/dashboard/settings/team" className="block">
                  <SettingsMenu.Item icon={<Users size={16} />} label="Team Members" selected />
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
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">
              Manage team members and their roles
            </p>
          </div>

          <div className="space-y-6">
            {/* Invite Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Invite team members</h4>
                <AlertDescription className="text-blue-700">
                  Add new members to your organization and assign their roles.
                </AlertDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-auto p-1">
                <X className="h-4 w-4" />
              </Button>
            </Alert>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search members..." 
                  className="pl-10"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    All roles
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All roles</DropdownMenuItem>
                  <DropdownMenuItem>Admin</DropdownMenuItem>
                  <DropdownMenuItem>Member</DropdownMenuItem>
                  <DropdownMenuItem>Viewer</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    All departments
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All departments</DropdownMenuItem>
                  <DropdownMenuItem>Product</DropdownMenuItem>
                  <DropdownMenuItem>Engineering</DropdownMenuItem>
                  <DropdownMenuItem>Design</DropdownMenuItem>
                  <DropdownMenuItem>Marketing</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </div>

            {/* Team Members Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>EMAIL</TableHead>
                      <TableHead>ROLE</TableHead>
                      <TableHead>DEPARTMENT</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e" />
                            <AvatarFallback>EJ</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">Emma Johnson</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        emma.johnson@example.com
                      </TableCell>
                      <TableCell>
                        <Badge>Admin</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Product
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 gap-1">
                          <Check className="h-3 w-3" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Key className="h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash className="h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5" />
                            <AvatarFallback>ML</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">Michael Lee</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        michael.lee@example.com
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Member</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Engineering
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 gap-1">
                          <Check className="h-3 w-3" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Key className="h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash className="h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" />
                            <AvatarFallback>SG</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">Sarah Green</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        sarah.green@example.com
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Member</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Design
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Key className="h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash className="h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
