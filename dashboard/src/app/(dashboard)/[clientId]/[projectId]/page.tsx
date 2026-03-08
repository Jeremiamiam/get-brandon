// NO "use client"
import { notFound } from 'next/navigation'
import { getClient, getClients } from '@/lib/data/clients'
import { getProject } from '@/lib/data/projects'
import { getProjectDocs, getClientDocs } from '@/lib/data/documents'
import { ProjectPageShell } from '@/components/ProjectPageShell'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ clientId: string; projectId: string }>
}) {
  const { clientId, projectId } = await params

  const [client, project, projectDocs, clientDocs, clients, prospects, archived] =
    await Promise.all([
      getClient(clientId),
      getProject(projectId),
      getProjectDocs(projectId),
      getClientDocs(clientId),
      getClients('client'),
      getClients('prospect'),
      getClients('archived'),
    ])

  if (!client || !project || project.clientId !== clientId) notFound()

  return (
    <ProjectPageShell
      client={client}
      project={project}
      projectDocs={projectDocs}
      clientDocs={clientDocs}
      clientId={clientId}
      projectId={projectId}
      clients={clients}
      prospects={prospects}
      archived={archived}
    />
  )
}
