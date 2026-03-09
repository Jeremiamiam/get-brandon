'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

// ─── createContact ─────────────────────────────────────────────
// INSERT a new contact row linked to a client, owned by the authenticated user.
// If isPrimary=true → first reset all other contacts of that client to is_primary=false.
// revalidatePath('/{clientId}') to refresh the client sidebar.
export async function createContact(params: {
  clientId: string
  name: string
  role?: string
  email?: string
  phone?: string
  isPrimary?: boolean
}): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // If setting this contact as primary, reset all others first
  if (params.isPrimary) {
    const { error: resetError } = await supabase
      .from('contacts')
      .update({ is_primary: false })
      .eq('client_id', params.clientId)
      .eq('owner_id', user.id)

    if (resetError) {
      return { error: resetError.message }
    }
  }

  const { error } = await supabase.from('contacts').insert({
    client_id: params.clientId,
    name: params.name,
    role: params.role ?? null,
    email: params.email ?? null,
    phone: params.phone ?? null,
    is_primary: params.isPrimary ?? false,
    owner_id: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/${params.clientId}`, 'page')
  return { error: null }
}

// ─── updateContact ─────────────────────────────────────────────
// UPDATE mutable fields of an existing contact.
// If isPrimary=true → fetch client_id then reset all other contacts to is_primary=false first.
// defense-in-depth: .eq('owner_id') in addition to RLS.
// revalidatePath('/{clientId}') to refresh the client sidebar.
export async function updateContact(
  contactId: string,
  updates: {
    name?: string
    role?: string
    email?: string
    phone?: string
    isPrimary?: boolean
  }
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Build the DB-mapped update object
  const dbUpdates: {
    name?: string
    role?: string
    email?: string
    phone?: string
    is_primary?: boolean
  } = {}

  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.role !== undefined) dbUpdates.role = updates.role
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.isPrimary !== undefined) dbUpdates.is_primary = updates.isPrimary

  // If setting this contact as primary, fetch its client_id then reset others
  if (updates.isPrimary) {
    const { data: existing, error: fetchError } = await supabase
      .from('contacts')
      .select('client_id')
      .eq('id', contactId)
      .eq('owner_id', user.id)
      .single()

    if (fetchError || !existing) {
      return { error: fetchError?.message ?? 'Contact not found' }
    }

    const { error: resetError } = await supabase
      .from('contacts')
      .update({ is_primary: false })
      .eq('client_id', existing.client_id)
      .eq('owner_id', user.id)

    if (resetError) {
      return { error: resetError.message }
    }

    const { error } = await supabase
      .from('contacts')
      .update(dbUpdates)
      .eq('id', contactId)
      .eq('owner_id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/${existing.client_id}`, 'page')
    return { error: null }
  }

  // No is_primary change — straightforward update
  const { data: existing, error: fetchError } = await supabase
    .from('contacts')
    .select('client_id')
    .eq('id', contactId)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !existing) {
    return { error: fetchError?.message ?? 'Contact not found' }
  }

  const { error } = await supabase
    .from('contacts')
    .update(dbUpdates)
    .eq('id', contactId)
    .eq('owner_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/${existing.client_id}`, 'page')
  return { error: null }
}

// ─── deleteContact ─────────────────────────────────────────────
// DELETE the contact row permanently.
// Fetch client_id before deletion to build the correct revalidatePath.
// defense-in-depth: .eq('owner_id') in addition to RLS.
export async function deleteContact(
  contactId: string
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch client_id before deletion to construct revalidatePath
  const { data: existing, error: fetchError } = await supabase
    .from('contacts')
    .select('client_id')
    .eq('id', contactId)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !existing) {
    return { error: fetchError?.message ?? 'Contact not found' }
  }

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId)
    .eq('owner_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/${existing.client_id}`, 'page')
  return { error: null }
}
