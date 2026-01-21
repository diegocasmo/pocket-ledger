import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/setup'
import { CategoriesPage } from '@/features/categories/CategoriesPage'
import { createCategory } from '@/db/categoriesRepo'

function renderCategoriesPage() {
  return renderWithRouter(<CategoriesPage />, { route: '/categories' })
}

describe('CategoriesPage', () => {
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
    it('opens add category modal when clicking new category button', async () => {
      const user = userEvent.setup()
      renderCategoriesPage()

      const addButton = await screen.findByRole('button', { name: /new category/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        // Dialog title appears in both mobile and desktop views
        const titles = screen.getAllByText('Add Category')
        expect(titles.length).toBeGreaterThan(0)
      })
    })
  })

  describe('editing category', () => {
    it('opens edit modal when clicking category row', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })

      const user = userEvent.setup()
      renderCategoriesPage()

      const categoryRow = await screen.findByRole('button', { name: /food/i })
      await user.click(categoryRow)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        // Dialog title appears in both mobile and desktop views
        const titles = screen.getAllByText('Edit Category')
        expect(titles.length).toBeGreaterThan(0)
      })
    })
  })
})
