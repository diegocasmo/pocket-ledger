import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryPickerModal } from '@/features/categories/CategoryPickerModal'
import { db } from '@/db'
import { renderWithClient } from '@/test/setup'

describe('CategoryPickerModal', () => {
  beforeEach(async () => {
    await db.categories.bulkAdd([
      { id: 'cat-1', name: 'Food', color: '#ff0000', usageCount: 10 },
      { id: 'cat-2', name: 'Transport', color: '#00ff00', usageCount: 5 },
      { id: 'cat-3', name: 'Entertainment', color: '#0000ff', usageCount: 3 },
    ])
  })

  // Helper to get category option (Dialog renders content twice for mobile/desktop)
  function getCategoryOption(categoryId: string) {
    return screen.getAllByTestId(`category-option-${categoryId}`)[0]
  }

  it('displays all categories', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <CategoryPickerModal
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    expect(screen.getAllByTestId('category-option-cat-2').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('category-option-cat-3').length).toBeGreaterThan(0)
  })

  it('filters categories based on search query', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <CategoryPickerModal
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    const searchInputs = screen.getAllByPlaceholderText('Search categories...')
    await user.type(searchInputs[0], 'trans')

    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-2').length).toBeGreaterThan(0)
      expect(screen.queryByTestId('category-option-cat-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('category-option-cat-3')).not.toBeInTheDocument()
    })
  })

  it('shows empty state when no categories match', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <CategoryPickerModal
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    const searchInputs = screen.getAllByPlaceholderText('Search categories...')
    await user.type(searchInputs[0], 'nonexistent')

    await waitFor(() => {
      // Both mobile and desktop show "No categories found"
      expect(screen.getAllByText('No categories found').length).toBeGreaterThan(0)
    })
  })

  it('calls onSelect when category is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <CategoryPickerModal
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    await user.click(getCategoryOption('cat-1'))

    expect(onSelect).toHaveBeenCalledWith('cat-1')
    expect(onClose).toHaveBeenCalled()
  })

  it('shows checkmark for selected category', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <CategoryPickerModal
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
        selectedCategoryId="cat-2"
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-2').length).toBeGreaterThan(0)
    })

    // Check that the checkmark icon is present (lucide-react renders as svg)
    const transportOption = getCategoryOption('cat-2')
    const checkmark = transportOption.querySelector('svg.text-primary-500')
    expect(checkmark).toBeInTheDocument()
  })

  it('opens category form modal when edit is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <CategoryPickerModal
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    // Get all Edit buttons and click the first one
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    // The category form modal should now be visible (renders twice for mobile/desktop)
    await waitFor(() => {
      expect(screen.getAllByText('Edit Category').length).toBeGreaterThan(0)
    })
  })

  it('opens category form modal when New Category is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <CategoryPickerModal
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    // Get first New Category button (there are two - mobile and desktop)
    const addButtons = screen.getAllByRole('button', { name: /new category/i })
    await user.click(addButtons[0])

    // The category form modal should now be visible (renders twice for mobile/desktop)
    await waitFor(() => {
      expect(screen.getAllByText('Add Category').length).toBeGreaterThan(0)
    })
  })

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <CategoryPickerModal
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
      />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    const searchInputs = screen.getAllByPlaceholderText('Search categories...')
    await user.type(searchInputs[0], 'trans')

    await waitFor(() => {
      expect(screen.queryByTestId('category-option-cat-1')).not.toBeInTheDocument()
    })

    // Click clear button (first one visible)
    const clearButtons = screen.getAllByRole('button', { name: /clear search/i })
    await user.click(clearButtons[0])

    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
      expect(screen.getAllByTestId('category-option-cat-2').length).toBeGreaterThan(0)
    })
  })


  it('pre-fills category name with search query when creating new category', async () => {
    const user = userEvent.setup()

    renderWithClient(
      <CategoryPickerModal isOpen={true} onClose={vi.fn()} onSelect={vi.fn()} />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    // Type a search query
    const searchInputs = screen.getAllByPlaceholderText('Search categories...')
    await user.type(searchInputs[0], 'Groceries')

    // Click New Category button
    const addButtons = screen.getAllByRole('button', { name: /new category/i })
    await user.click(addButtons[0])

    // Wait for form and verify name is pre-filled
    await waitFor(() => {
      expect(screen.getAllByText('Add Category').length).toBeGreaterThan(0)
    })

    const nameInputs = screen.getAllByLabelText(/name/i)
    expect(nameInputs[0]).toHaveValue('Groceries')
  })

  it('does not pre-fill search query when editing existing category', async () => {
    const user = userEvent.setup()

    renderWithClient(
      <CategoryPickerModal isOpen={true} onClose={vi.fn()} onSelect={vi.fn()} />
    )

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByTestId('category-option-cat-1').length).toBeGreaterThan(0)
    })

    // Type a search query
    const searchInputs = screen.getAllByPlaceholderText('Search categories...')
    await user.type(searchInputs[0], 'foo')

    // Click Edit on first category (Food)
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    // Wait for form and verify name is the actual category name, NOT search query
    await waitFor(() => {
      expect(screen.getAllByText('Edit Category').length).toBeGreaterThan(0)
    })

    const nameInputs = screen.getAllByLabelText(/name/i)
    expect(nameInputs[0]).toHaveValue('Food') // Not 'foo'
  })
})
