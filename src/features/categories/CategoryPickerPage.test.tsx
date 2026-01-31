import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/setup'
import { CategoryPickerPage } from '@/features/categories/CategoryPickerPage'
import { ExpenseFormProvider } from '@/contexts/ExpenseFormContext'
import { createCategory } from '@/db/categoriesRepo'
import { createElement } from 'react'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderCategoryPickerPage(route = '/expenses/new/category') {
  return renderWithRouter(
    createElement(ExpenseFormProvider, null, createElement(CategoryPickerPage)),
    { route }
  )
}

describe('CategoryPickerPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    sessionStorage.clear()
  })

  describe('autofocus behavior', () => {
    it('autofocuses the search input when page loads', async () => {
      renderCategoryPickerPage()

      const searchInput = await screen.findByPlaceholderText(/search categories/i)

      await waitFor(() => {
        expect(searchInput).toHaveFocus()
      })
    })
  })

  describe('navigation to category form', () => {
    it('passes expenseFormPath when creating a new category', async () => {
      const user = userEvent.setup()
      renderCategoryPickerPage()

      // Wait for "No categories found" to appear (indicates query has settled)
      await screen.findByText(/no categories found/i)

      const newCategoryButton = screen.getByRole('button', { name: /new category/i })
      await user.click(newCategoryButton)

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('returnPath=%2Fexpenses%2Fnew%2Fcategory')
      )
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('expenseFormPath=%2Fexpenses%2Fnew')
      )
    })

    it('passes expenseFormPath when editing an existing category', async () => {
      const category = await createCategory({ name: 'Food', color: '#22c55e' })

      const user = userEvent.setup()
      renderCategoryPickerPage()

      const editButton = await screen.findByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining(`/categories/${category.id}`)
      )
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('returnPath=%2Fexpenses%2Fnew%2Fcategory')
      )
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('expenseFormPath=%2Fexpenses%2Fnew')
      )
    })

    it('includes search query as initialName when creating category', async () => {
      const user = userEvent.setup()
      renderCategoryPickerPage()

      const searchInput = screen.getByPlaceholderText(/search categories/i)
      await user.type(searchInput, 'Groceries')

      const createButton = await screen.findByRole('button', { name: /create "groceries" category/i })
      await user.click(createButton)

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('initialName=Groceries')
      )
    })
  })

  describe('category selection', () => {
    it('navigates back to expense form when selecting a category', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })

      // Initialize draft in sessionStorage so updateDraft works
      sessionStorage.setItem(
        'expense-form-draft',
        JSON.stringify({ amount: '', categoryId: '', note: '', date: '2024-01-01' })
      )

      const user = userEvent.setup()
      renderCategoryPickerPage()

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const categoryOption = screen.getByTestId(/category-option-/i)
      await user.click(categoryOption)

      expect(mockNavigate).toHaveBeenCalledWith('/expenses/new')
    })
  })
})
