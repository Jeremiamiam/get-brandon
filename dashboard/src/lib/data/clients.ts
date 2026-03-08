import 'server-only'
import { CLIENTS, type Client, type ClientCategory } from '@/lib/mock'

export async function getClients(category: ClientCategory = 'client'): Promise<Client[]> {
  return CLIENTS.filter((c) => c.category === category)
}

export async function getClient(id: string): Promise<Client | null> {
  return CLIENTS.find((c) => c.id === id) ?? null
}
