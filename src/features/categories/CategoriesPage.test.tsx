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

    it('shows add category button', async () => {
      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument()
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

    it('shows edit button for each category', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })

      renderCategoriesPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      })
    })
  })

  describe('creating category', () => {
    it('opens add category modal when clicking add button', async () => {
      const user = userEvent.setup()
      renderCategoriesPage()

      const addButton = await screen.findByRole('button', { name: /add category/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        // Dialog title appears in both mobile and desktop views
        const titles = screen.getAllByText('Add Category')
        expect(titles.length).toBeGreaterThan(1) // Button + dialog titles
      })
    })
  })

  describe('editing category', () => {
    it('opens edit modal when clicking edit', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })

      const user = userEvent.setup()
      renderCategoriesPage()

      const editButton = await screen.findByRole('button', { name: /edit/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        // Dialog title appears in both mobile and desktop views
        const titles = screen.getAllByText('Edit Category')
        expect(titles.length).toBeGreaterThan(0)
      })
    })
  })
})
