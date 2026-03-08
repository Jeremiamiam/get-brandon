import 'server-only'
import { DOCUMENTS, BUDGET_PRODUCTS, type Document, type BudgetProduct } from '@/lib/mock'

export async function getClientDocs(clientId: string): Promise<Document[]> {
  return DOCUMENTS.filter((d) => d.clientId === clientId && !d.projectId)
}

export async function getProjectDocs(projectId: string): Promise<Document[]> {
  return DOCUMENTS.filter((d) => d.projectId === projectId)
}

export async function getBudgetProducts(projectId: string): Promise<BudgetProduct[]> {
  return BUDGET_PRODUCTS.filter((b) => b.projectId === projectId)
}
