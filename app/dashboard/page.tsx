'use client'
import Link from 'next/link'
import { PlusIcon, LinkIcon, PencilIcon, EyeIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconWithBackground } from '@/components/ui/icon-with-background'

export default function DashboardHomePage() {
  return (
    <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-start gap-8 bg-background py-12 overflow-auto">
      {/* Welcome Section */}
      <div className="flex flex-col items-start gap-2">
        <span className="text-3xl font-bold text-foreground">
          Welcome to Release Notes Generator
        </span>
        <span className="text-base text-muted-foreground">
          Ready to generate some awesome release notes?
        </span>
      </div>

      {/* Quick Actions Card */}
      <div className="flex w-full flex-col items-start gap-6 rounded-md border border-border bg-background px-8 py-8">
        <span className="text-xl font-semibold text-foreground">
          Quick Actions
        </span>
        <div className="flex w-full flex-wrap items-start gap-6">
          <Link href="/dashboard/releases/new/ai">
            <Button variant="neutral-secondary">
              Create Release Note
            </Button>
          </Link>
          <Link href="/dashboard/configuration">
            <Button variant="neutral-secondary">
              Setup Integration
            </Button>
          </Link>
          <Link href="/dashboard/ai-context">
            <Button variant="neutral-secondary">
              AI Context Settings
            </Button>
          </Link>
          <Link href="/dashboard/templates">
            <Button variant="neutral-secondary">
              Template Management
            </Button>
          </Link>
          <a href="mailto:help@releasenote.ai">
            <Button variant="neutral-secondary">
              Support &amp; Help
            </Button>
          </a>
        </div>
      </div>

      {/* Recent Release Notes */}
      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-xl font-semibold text-foreground">
          Recent Release Notes
        </span>
        <div className="flex w-full flex-col items-center gap-4 rounded-md border border-border bg-background px-8 py-16">
          <IconWithBackground size="large" icon={<FileText />} />
          <span className="text-base text-muted-foreground">
            No release notes created yet.
          </span>
          <Link href="/dashboard/releases/start">
            <Button>
              Create your first one
            </Button>
          </Link>
        </div>
        <Link href="/dashboard/releases">
          <Button
            variant="neutral-tertiary"
            iconRight={<ArrowRight />}
          >
            View all release notes
          </Button>
        </Link>
      </div>

      {/* Integrations Status */}
      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-xl font-semibold text-foreground">
          Integrations Status
        </span>
        <div className="flex w-full flex-col items-center gap-4 rounded-md border border-border bg-background px-8 py-16">
          <IconWithBackground size="large" icon={<LinkIcon />} />
          <span className="text-base text-muted-foreground">
            No integrations connected yet.
          </span>
          <Link href="/dashboard/configuration">
            <Button>
              Connect your first integration
            </Button>
          </Link>
        </div>
        <Link href="/dashboard/configuration">
          <Button
            variant="neutral-tertiary"
            iconRight={<ArrowRight />}
          >
            Manage integrations
          </Button>
        </Link>
      </div>

      {/* Getting Started Checklist */}
      <div className="flex w-full flex-col items-start gap-6 rounded-md border border-border bg-background px-8 py-8">
        <span className="text-xl font-semibold text-foreground">
          Getting Started Checklist
        </span>
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between border-b border-border py-4">
            <span className="text-base text-foreground">
              Connect an integration (Jira, GitHub, etc.)
            </span>
            <Link href="/dashboard/configuration">
              <Button variant="neutral-tertiary">
                Setup
              </Button>
            </Link>
          </div>
          <div className="flex w-full items-center justify-between border-b border-border py-4">
            <span className="text-base text-foreground">
              Configure your AI Context
            </span>
            <Link href="/dashboard/ai-context">
              <Button variant="neutral-tertiary">
                Configure
              </Button>
            </Link>
          </div>
          <div className="flex w-full items-center justify-between border-b border-border py-4">
            <span className="text-base text-foreground">
              Create your first Release Note
            </span>
            <Link href="/dashboard/releases/new/ai">
              <Button variant="neutral-tertiary">
                Create
              </Button>
            </Link>
          </div>
          <div className="flex w-full items-center justify-between py-4">
            <span className="text-base text-foreground">
              Explore and manage Templates
            </span>
            <Link href="/dashboard/templates">
              <Button variant="neutral-tertiary">
                Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}