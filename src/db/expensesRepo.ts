import { db } from '@/db'
import type { Expense } from '@/types'
import { incrementUsage } from '@/db/categoriesRepo'

export interface CreateExpenseInput {
  date: string
  amountCents: number
  categoryId: string
  note?: string
}

export interface UpdateExpenseInput {
  date?: string
  amountCents?: number
  categoryId?: string
  note?: string
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const now = Date.now()
  const id = crypto.randomUUID()
  const expense: Expense = {
    id,
    date: input.date,
    amountCents: input.amountCents,
    categoryId: input.categoryId,
    note: input.note,
    createdAt: now,
    updatedAt: now,
  }
  await db.expenses.add(expense)
  await incrementUsage(input.categoryId)
  return expense
}

export async function updateExpense(
  id: string,
  patch: UpdateExpenseInput
): Promise<Expense> {
  const existing = await db.expenses.get(id)
  if (!existing) {
    throw new Error(`Expense not found: ${id}`)
  }

  const updated: Expense = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  }
  await db.expenses.put(updated)

  // Increment usage if category changed
  if (patch.categoryId && patch.categoryId !== existing.categoryId) {
    await incrementUsage(patch.categoryId)
  }

  return updated
}

export async function deleteExpense(id: string): Promise<void> {
  await db.expenses.delete(id)
}

export async function getExpense(id: string): Promise<Expense | undefined> {
  return db.expenses.get(id)
}

export async function listExpensesForDateRange(
  start: string,
  end: string
): Promise<Expense[]> {
  return db.expenses
    .where('date')
    .between(start, end, true, true)
    .reverse()
    .sortBy('createdAt')
}

export async function listExpensesForDay(date: string): Promise<Expense[]> {
  const expenses = await db.expenses.where('date').equals(date).toArray()
  // Sort by createdAt descending (newest first)
  return expenses.sort((a, b) => b.createdAt - a.createdAt)
}

export async function listExpensesByCategory(
  categoryId: string,
  start: string,
  end: string
): Promise<Expense[]> {
  const expenses = await db.expenses
    .where('date')
    .between(start, end, true, true)
    .and((expense) => expense.categoryId === categoryId)
    .toArray()
  // Sort by createdAt descending
  return expenses.sort((a, b) => b.createdAt - a.createdAt)
}
