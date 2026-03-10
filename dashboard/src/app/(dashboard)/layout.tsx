import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GlobalNav } from '@/components/GlobalNav'
import { getClientsAll } from '@/lib/data/clients'
import { ClientSidebar } from '@/components/ClientSidebar'

/** Sidebar loaded with Suspense — persists across child navigations. */
async function SidebarLoader() {
  const t0 = performance.now()
  const sidebar = await getClientsAll()
  console.log(`[perf] Sidebar RPC: ${Math.round(performance.now() - t0)}ms`)
  return (
    <ClientSidebar
      clients={sidebar.clients}
      prospects={sidebar.prospects}
      archived={sidebar.archived}
    />
  )
}

function SidebarSkeleton() {
  return (
    <aside
      className="fixed top-12 left-0 bottom-0 z-40 border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      style={{ width: "var(--sidebar-w)" }}
    />
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t0 = performance.now()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log(`[perf] Auth check: ${Math.round(performance.now() - t0)}ms`)

  if (!user) redirect('/login')

  return (
    <>
      <GlobalNav />
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarLoader />
      </Suspense>
      {children}
    </>
  )
}
