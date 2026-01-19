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

export { db }
