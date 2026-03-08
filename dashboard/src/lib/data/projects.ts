import 'server-only'
import { PROJECTS, type Project } from '@/lib/mock'

export async function getClientProjects(clientId: string): Promise<Project[]> {
  return PROJECTS.filter((p) => p.clientId === clientId)
}

export async function getProject(projectId: string): Promise<Project | null> {
  return PROJECTS.find((p) => p.id === projectId) ?? null
}
