import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/setup'
import { InsightsPage } from '@/features/insights/InsightsPage'
import { createCategory } from '@/db/categoriesRepo'
import { createExpense } from '@/db/expensesRepo'
import { format, subMonths } from 'date-fns'
import { formatPeriodLabel } from '@/lib/dates'

function renderInsightsPage() {
  return renderWithRouter(<InsightsPage />, { route: '/insights' })
}

describe('InsightsPage', () => {
  describe('rendering', () => {
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

  describe('period navigation', () => {
    it('renders PeriodNavigator with current month label', async () => {
      renderInsightsPage()

      const expectedLabel = formatPeriodLabel(new Date(), 'month', 0)

      await waitFor(() => {
        expect(screen.getByText(expectedLabel)).toBeInTheDocument()
      })
    })

    it('navigates to previous period when previous button is clicked', async () => {
      const user = userEvent.setup()
      renderInsightsPage()

      const expectedLabel = formatPeriodLabel(new Date(), 'month', 0)

      await waitFor(() => {
        expect(screen.getByText(expectedLabel)).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Previous period' }))

      const previousLabel = formatPeriodLabel(subMonths(new Date(), 1), 'month', 0)

      await waitFor(() => {
        expect(screen.getByText(previousLabel)).toBeInTheDocument()
      })
    })

    it('shows Today button after navigating away from current period', async () => {
      const user = userEvent.setup()
      renderInsightsPage()

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Go to today' })).not.toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Previous period' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Go to today' })).toBeInTheDocument()
      })
    })

    it('resets to current period when Today button is clicked', async () => {
      const user = userEvent.setup()
      renderInsightsPage()

      const currentLabel = formatPeriodLabel(new Date(), 'month', 0)

      await user.click(screen.getByRole('button', { name: 'Previous period' }))

      await waitFor(() => {
        expect(screen.queryByText(currentLabel)).not.toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Go to today' }))

      await waitFor(() => {
        expect(screen.getByText(currentLabel)).toBeInTheDocument()
      })
    })

    it('hides next button when viewing current period', async () => {
      renderInsightsPage()

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Next period' })).not.toBeInTheDocument()
      })
    })

    it('resets to current period when switching range type', async () => {
      const user = userEvent.setup()
      renderInsightsPage()

      await user.click(screen.getByRole('button', { name: 'Previous period' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Go to today' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /week/i }))

      const weekLabel = formatPeriodLabel(new Date(), 'week', 0)

      await waitFor(() => {
        expect(screen.getByText(weekLabel)).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Go to today' })).not.toBeInTheDocument()
      })
    })
  })
})
