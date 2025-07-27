import SidebarDesignThinking from '../../../ui/components/SidebarDesignThinking';


export function DefaultPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-default-background">
      {/* Only one sidebar here */}
      <aside className="sticky top-0 hidden w-48 flex-col border-r border-neutral-border bg-neutral-50 px-0 py-6 md:flex">
        <SidebarDesignThinking />
      </aside>
      <main className="flex flex-grow flex-col overflow-auto p-8 md:p-12">
        {children}
      </main>
    </div>
  );
}
