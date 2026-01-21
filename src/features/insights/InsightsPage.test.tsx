import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithRouter } from '@/test/setup'
import { InsightsPage } from '@/features/insights/InsightsPage'
import { createCategory } from '@/db/categoriesRepo'
import { createExpense } from '@/db/expensesRepo'
import { format } from 'date-fns'

function renderInsightsPage() {
  return renderWithRouter(<InsightsPage />, { route: '/insights' })
}

describe('InsightsPage', () => {
  describe('rendering', () => {
    it('renders the insights header', async () => {
      renderInsightsPage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /insights/i })).toBeInTheDocument()
      })
    })

    it('shows $0.00 total when no expenses exist', async () => {
      renderInsightsPage()

      await waitFor(() => {
        expect(screen.getByText('$0.00')).toBeInTheDocument()
      })
    })

    it('shows no expenses message when no expenses exist', async () => {
      renderInsightsPage()

      await waitFor(() => {
        expect(screen.getByText(/no expenses in this period/i)).toBeInTheDocument()
      })
    })
  })

  describe('range selection', () => {
    it('displays all range buttons', async () => {
      renderInsightsPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /year/i })).toBeInTheDocument()
      })
    })
  })

  describe('expense totals', () => {
    it('shows total spent label', async () => {
      renderInsightsPage()

      await waitFor(() => {
        expect(screen.getByText('Total Spent')).toBeInTheDocument()
      })
    })
  })

  describe('category breakdown', () => {
    it('shows By Category heading when expenses exist', async () => {
      const category = await createCategory({ name: 'Food', color: '#22c55e' })
      const today = format(new Date(), 'yyyy-MM-dd')

      await createExpense({
        date: today,
        amountCents: 1000,
        categoryId: category.id,
      })

      renderInsightsPage()

      await waitFor(() => {
        expect(screen.getByText('By Category')).toBeInTheDocument()
      })
    })
  })

})
