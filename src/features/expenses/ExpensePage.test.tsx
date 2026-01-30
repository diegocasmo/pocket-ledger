import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ExpensePage } from '@/features/expenses/ExpensePage'
import { ExpenseFormProvider } from '@/contexts/ExpenseFormContext'
import { createCategory } from '@/db/categoriesRepo'
import { createExpense } from '@/db/expensesRepo'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderExpensePage(route: string) {
  const queryClient = createTestQueryClient()
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [route] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          ExpenseFormProvider,
          null,
          createElement(
            Routes,
            null,
            createElement(Route, { path: '/expenses/new', element: createElement(ExpensePage) }),
            createElement(Route, { path: '/expenses/:id', element: createElement(ExpensePage) })
          )
        )
      )
    )
  )
}

describe('ExpensePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    sessionStorage.clear()
  })

  describe('autofocus behavior', () => {
    it('autofocuses amount field when creating a new expense', async () => {
      renderExpensePage('/expenses/new')

      const amountInput = await screen.findByLabelText(/amount/i)

      await waitFor(() => {
        expect(amountInput).toHaveFocus()
      })
    })

    it('autofocuses amount field when creating a new expense with date param', async () => {
      renderExpensePage('/expenses/new?date=2024-01-15')

      const amountInput = await screen.findByLabelText(/amount/i)

      await waitFor(() => {
        expect(amountInput).toHaveFocus()
      })
    })

    it('does not autofocus amount field when editing an existing expense', async () => {
      const category = await createCategory({ name: 'Food', color: '#22c55e' })
      const expense = await createExpense({
        date: '2024-01-15',
        amountCents: 1500,
        categoryId: category.id,
      })

      renderExpensePage(`/expenses/${expense.id}`)

      const amountInput = await screen.findByLabelText(/amount/i)

      await waitFor(() => {
        expect(amountInput).toBeInTheDocument()
      })

      // Amount input should not have focus when editing
      expect(amountInput).not.toHaveFocus()
    })
  })
})
