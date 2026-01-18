import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { db } from '../db'

beforeEach(async () => {
  await db.expenses.clear()
  await db.categories.clear()
  await db.settings.clear()
})
