import { db } from '../db'
import type { Category } from '../types'

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food & Dining', color: '#ef4444', usageCount: 0 },
  { name: 'Transportation', color: '#f97316', usageCount: 0 },
  { name: 'Shopping', color: '#eab308', usageCount: 0 },
  { name: 'Bills & Utilities', color: '#22c55e', usageCount: 0 },
  { name: 'Entertainment', color: '#3b82f6', usageCount: 0 },
  { name: 'Health', color: '#8b5cf6', usageCount: 0 },
  { name: 'Other', color: '#6b7280', usageCount: 0 },
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
  // Sort by usage count descending, then by name
  return categories.sort((a, b) => {
    if (b.usageCount !== a.usageCount) {
      return b.usageCount - a.usageCount
    }
    return a.name.localeCompare(b.name)
  })
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return db.categories.get(id)
}

export async function createCategory(
  input: Pick<Category, 'name' | 'color'>
): Promise<Category> {
  const id = crypto.randomUUID()
  const category: Category = {
    id,
    name: input.name,
    color: input.color,
    usageCount: 0,
  }
  await db.categories.add(category)
  return category
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, 'name' | 'color'>>
): Promise<Category> {
  await db.categories.update(id, patch)
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

export async function incrementUsage(id: string): Promise<void> {
  const category = await db.categories.get(id)
  if (category) {
    await db.categories.update(id, {
      usageCount: category.usageCount + 1,
    })
  }
}

export async function categoryHasExpenses(categoryId: string): Promise<boolean> {
  const count = await db.expenses.where('categoryId').equals(categoryId).count()
  return count > 0
}
