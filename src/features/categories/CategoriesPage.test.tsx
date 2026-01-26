import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/setup'
import { CategoriesPage } from '@/features/categories/CategoriesPage'
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

function renderCategoriesPage() {
  return renderWithRouter(<CategoriesPage />, { route: '/categories' })
}

describe('CategoriesPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('rendering', () => {
    it('renders the categories header', async () => {
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /categories/i })).toBeInTheDocument()
      })
    })

    it('shows new category button', async () => {
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /new category/i })).toBeInTheDocument()
      })
    })
  })

  describe('category list', () => {
    it('displays existing categories', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })
      await createCategory({ name: 'Transport', color: '#3b82f6' })

      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
        expect(screen.getByText('Transport')).toBeInTheDocument()
      })
    })

    it('shows clickable category rows', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })

      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /food/i })).toBeInTheDocument()
      })
    })
  })

  describe('creating category', () => {
    it('navigates to new category page when clicking new category button', async () => {
      const user = userEvent.setup()
      renderCategoriesPage()

      const addButton = await screen.findByRole('button', { name: /new category/i })
      await user.click(addButton)

      expect(mockNavigate).toHaveBeenCalledWith('/categories/new')
    })
  })

  describe('editing category', () => {
    it('navigates to edit category page when clicking category row', async () => {
      const category = await createCategory({ name: 'Food', color: '#22c55e' })

      const user = userEvent.setup()
      renderCategoriesPage()

      const categoryRow = await screen.findByRole('button', { name: /food/i })
      await user.click(categoryRow)

      expect(mockNavigate).toHaveBeenCalledWith(`/categories/${category.id}`)
    })
  })
})
