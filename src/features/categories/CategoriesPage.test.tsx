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
    it('shows new category button', async () => {
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /new category/i })).toBeInTheDocument()
      })
    })

    it('shows search input', async () => {
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search categories/i)).toBeInTheDocument()
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

  describe('search', () => {
    it('filters categories by search query', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })
      await createCategory({ name: 'Transport', color: '#3b82f6' })

      const user = userEvent.setup()
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/search categories/i), 'foo')

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
        expect(screen.queryByText('Transport')).not.toBeInTheDocument()
      })
    })

    it('shows "No categories found" when search yields no results', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })

      const user = userEvent.setup()
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/search categories/i), 'xyz')

      await waitFor(() => {
        expect(screen.getByText('No categories found')).toBeInTheDocument()
        expect(screen.queryByText('Food')).not.toBeInTheDocument()
      })
    })

    it('shows all categories again after clearing search', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })
      await createCategory({ name: 'Transport', color: '#3b82f6' })

      const user = userEvent.setup()
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search categories/i)
      await user.type(searchInput, 'foo')

      await waitFor(() => {
        expect(screen.queryByText('Transport')).not.toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /clear search/i }))

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
        expect(screen.getByText('Transport')).toBeInTheDocument()
      })
    })

    it('keeps new category button visible when search yields no results', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })

      const user = userEvent.setup()
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/search categories/i), 'xyz')

      await waitFor(() => {
        expect(screen.getByText('No categories found')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /new category/i })).toBeInTheDocument()
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
