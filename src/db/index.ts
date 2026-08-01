import Dexie, { type EntityTable } from 'dexie'
import type { Expense, Category, Settings } from '@/types'

const db = new Dexie('PocketLedgerDB') as Dexie & {
  expenses: EntityTable<Expense, 'id'>
  categories: EntityTable<Category, 'id'>
  settings: EntityTable<Settings, 'id'>
}

db.version(1).stores({
  expenses: 'id, date, categoryId, createdAt',
  categories: 'id, name, usageCount',
  settings: 'id'
})

db.version(2)
  .stores({
    expenses: 'id, date, categoryId, createdAt',
    categories: 'id, name, lastUsedAt',
    settings: 'id',
  })
  .upgrade(async (tx) => {
    const expenses = await tx.table<Expense>('expenses').toArray()
    const latestByCategory = new Map<string, number>()

    for (const expense of expenses) {
      const previous = latestByCategory.get(expense.categoryId) ?? 0
      if (expense.createdAt > previous) {
        latestByCategory.set(expense.categoryId, expense.createdAt)
      }
    }

    await tx.table('categories').toCollection().modify((category: {
      id: string
      usageCount?: number
      lastUsedAt?: number | null
    }) => {
      category.lastUsedAt = latestByCategory.get(category.id) ?? null
      delete category.usageCount
    })
  })

export { db }
