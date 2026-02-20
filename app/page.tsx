import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, PencilIcon, GlobeIcon } from 'lucide-react'

const valueProps = [
  {
    title: 'Connect GitHub, Jira, Linear',
    description: 'Pull commits, PRs, and issues from your product workflow in one place.',
    icon: SparklesIcon,
  },
  {
    title: 'Generate release notes with AI',
    description: 'Produce structured HTML drafts tuned for customer-facing updates.',
    icon: PencilIcon,
  },
  {
    title: 'Publish to public changelog',
    description: 'Ship polished release notes to your branded notes portal and notify subscribers.',
    icon: GlobeIcon,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f8ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="rounded-3xl border border-[#d9e2f3] bg-white p-8 shadow-sm sm:p-12">
          <p className="inline-flex items-center rounded-full border border-[#d5def0] bg-[#f8faff] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#475467]">
            Small SaaS release workflow
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-tight text-[#101828] sm:text-5xl">
            Release notes that are fast to generate, easy to edit, and safe to publish.
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#475467] sm:text-lg">
            Releasenote helps product teams convert raw engineering updates into clear customer communication.
            Connect your tools, generate draft notes, and publish to a clean public portal.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-[#1062fe] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0b4ed0]"
            >
              Start Free
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-[#d0d5dd] bg-white px-5 py-3 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb]"
            >
              Log In
            </Link>
            <Link
              href="/dashboard/releases/new"
              className="inline-flex items-center rounded-lg border border-[#d0d5dd] bg-white px-5 py-3 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb]"
            >
              Try Builder
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {valueProps.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm">
              <item.icon className="h-6 w-6 text-[#1062fe]" />
              <h2 className="mt-4 text-lg font-semibold text-[#101828]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{item.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
