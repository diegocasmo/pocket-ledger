import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CategoryFormPage } from '@/features/categories/CategoryFormPage'
import { ExpenseFormProvider } from '@/contexts/ExpenseFormContext'
import { createCategory } from '@/db/categoriesRepo'

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

function renderCategoryFormPage(route: string) {
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
            createElement(Route, { path: '/categories/new', element: createElement(CategoryFormPage) }),
            createElement(Route, { path: '/categories/:id', element: createElement(CategoryFormPage) })
          )
        )
      )
    )
  )
}

describe('CategoryFormPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    sessionStorage.clear()
  })

  describe('creating a new category from expense flow', () => {
    it('navigates directly to expense form with replace after saving', async () => {
      // Initialize draft
      sessionStorage.setItem(
        'expense-form-draft',
        JSON.stringify({ amount: '100', categoryId: '', note: '', date: '2024-01-01' })
      )

      const user = userEvent.setup()
      renderCategoryFormPage(
        '/categories/new?returnPath=%2Fexpenses%2Fnew%2Fcategory&expenseFormPath=%2Fexpenses%2Fnew'
      )

      // Fill in the form
      const nameInput = await screen.findByLabelText(/name/i)
      await user.type(nameInput, 'New Category')

      // Submit the form (button says "Create" for new categories)
      const createButton = screen.getByRole('button', { name: /create/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/expenses/new', { replace: true })
      })
    })

    it('returns to picker when canceling (no expenseFormPath skip)', async () => {
      const user = userEvent.setup()
      renderCategoryFormPage(
        '/categories/new?returnPath=%2Fexpenses%2Fnew%2Fcategory&expenseFormPath=%2Fexpenses%2Fnew'
      )

      await screen.findByLabelText(/name/i)

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockNavigate).toHaveBeenCalledWith('/expenses/new/category')
    })
  })

  describe('editing a category from expense flow', () => {
    it('navigates directly to expense form with replace after saving', async () => {
      const category = await createCategory({ name: 'Food', color: '#22c55e' })

      // Initialize draft
      sessionStorage.setItem(
        'expense-form-draft',
        JSON.stringify({ amount: '100', categoryId: category.id, note: '', date: '2024-01-01' })
      )

      const user = userEvent.setup()
      renderCategoryFormPage(
        `/categories/${category.id}?returnPath=%2Fexpenses%2Fnew%2Fcategory&expenseFormPath=%2Fexpenses%2Fnew`
      )

      // Wait for category to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Food')).toBeInTheDocument()
      })

      // Modify the name
      const nameInput = screen.getByLabelText(/name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Food Updated')

      // Submit the form (button says "Save" for editing)
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/expenses/new', { replace: true })
      })
    })

    it('returns to picker when going back (cancel)', async () => {
      const category = await createCategory({ name: 'Food', color: '#22c55e' })

      const user = userEvent.setup()
      renderCategoryFormPage(
        `/categories/${category.id}?returnPath=%2Fexpenses%2Fnew%2Fcategory&expenseFormPath=%2Fexpenses%2Fnew`
      )

      // Wait for category to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Food')).toBeInTheDocument()
      })

      // Click back button (which triggers cancel/handleReturn without categoryId)
      const backButton = screen.getByRole('button', { name: /go back/i })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/expenses/new/category')
    })
  })

  describe('without expenseFormPath (direct category management)', () => {
    it('returns to returnPath after saving new category', async () => {
      // Initialize draft
      sessionStorage.setItem(
        'expense-form-draft',
        JSON.stringify({ amount: '100', categoryId: '', note: '', date: '2024-01-01' })
      )

      const user = userEvent.setup()
      renderCategoryFormPage('/categories/new?returnPath=%2Fexpenses%2Fnew%2Fcategory')

      // Fill in the form
      const nameInput = await screen.findByLabelText(/name/i)
      await user.type(nameInput, 'New Category')

      // Submit the form (button says "Create" for new categories)
      const createButton = screen.getByRole('button', { name: /create/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/expenses/new/category')
      })
    })

    it('returns to /categories when no returnPath provided', async () => {
      const user = userEvent.setup()
      renderCategoryFormPage('/categories/new')

      await screen.findByLabelText(/name/i)

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockNavigate).toHaveBeenCalledWith('/categories')
    })
  })
})
