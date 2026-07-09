import { db } from '@/db'
import type { Category } from '@/types'

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food & Dining', color: '#ef4444', lastUsedAt: null },
  { name: 'Transportation', color: '#f97316', lastUsedAt: null },
  { name: 'Shopping', color: '#eab308', lastUsedAt: null },
  { name: 'Bills & Utilities', color: '#22c55e', lastUsedAt: null },
  { name: 'Entertainment', color: '#3b82f6', lastUsedAt: null },
  { name: 'Health', color: '#8b5cf6', lastUsedAt: null },
  { name: 'Other', color: '#6b7280', lastUsedAt: null },
]

export async function initDefaultCategories(): Promise<void> {
  const count = await db.categories.count()
  if (count === 0) {
    const categories: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: `default-${index + 1}`,
    }))
    await db.categories.bulkAdd(categories)
  }
}

export async function listCategories(): Promise<Category[]> {
  await initDefaultCategories()
  const categories = await db.categories.toArray()
  // Sort by most recently used first, then by name for stable ties.
  return categories.sort((a, b) => {
    const aLastUsedAt = a.lastUsedAt ?? -Infinity
    const bLastUsedAt = b.lastUsedAt ?? -Infinity
    if (bLastUsedAt !== aLastUsedAt) {
      return bLastUsedAt - aLastUsedAt
    }
    return a.name.localeCompare(b.name)
  })
}

export async function createCategory(
  input: Pick<Category, 'name' | 'color'>
): Promise<Category> {
  const id = crypto.randomUUID()
  const category: Category = {
    id,
    name: input.name.trim(),
    color: input.color,
    lastUsedAt: null,
  }
  await db.categories.add(category)
  return category
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, 'name' | 'color'>>
): Promise<Category> {
  const trimmedPatch = {
    ...patch,
    ...(patch.name !== undefined && { name: patch.name.trim() }),
  }
  await db.categories.update(id, trimmedPatch)
  const updated = await db.categories.get(id)
  if (!updated) {
    throw new Error(`Category not found: ${id}`)
  }
  return updated
}

export async function deleteCategory(id: string): Promise<void> {
  const hasExpenses = await categoryHasExpenses(id)
  if (hasExpenses) {
    throw new Error('Cannot delete category with existing expenses')
  }
  await db.categories.delete(id)
}

export async function markCategoryUsed(id: string, usedAt: number): Promise<void> {
  const category = await db.categories.get(id)
  if (category) {
    const nextLastUsedAt =
      category.lastUsedAt === null ? usedAt : Math.max(category.lastUsedAt, usedAt)
    await db.categories.update(id, {
      lastUsedAt: nextLastUsedAt,
    })
  }
}

export async function categoryHasExpenses(categoryId: string): Promise<boolean> {
  const count = await db.expenses.where('categoryId').equals(categoryId).count()
  return count > 0
}
