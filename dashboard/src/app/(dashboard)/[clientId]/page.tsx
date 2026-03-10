// NO "use client"
import { notFound } from 'next/navigation'
import { getClient } from '@/lib/data/clients'
import { getClientProjects } from '@/lib/data/projects'
import { getClientDocs, getBudgetProductsForClient } from '@/lib/data/documents'
import { ClientPageShell } from '@/components/ClientPageShell'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  if (!UUID_RE.test(clientId)) notFound()
  const t0 = performance.now()
  const [client, projects, globalDocs, budgetByProject] = await Promise.all([
    getClient(clientId),
    getClientProjects(clientId),
    getClientDocs(clientId),
    getBudgetProductsForClient(clientId),
  ])
  console.log(`[perf] ClientPage data: ${Math.round(performance.now() - t0)}ms`)
  if (!client) notFound()

  return (
    <ClientPageShell
      client={client}
      projects={projects}
      budgetByProject={budgetByProject}
      globalDocs={globalDocs}
      clientId={clientId}
    />
  )
}
