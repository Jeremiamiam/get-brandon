// NO "use client" — this is a Server Component
import { redirect } from 'next/navigation'
import { getClients } from '@/lib/data/clients'

export default async function Home() {
  const clients = await getClients('client')
  const first = clients[0]
  if (first) redirect(`/${first.id}`)
  redirect('/onboarding') // fallback: no clients yet
}
