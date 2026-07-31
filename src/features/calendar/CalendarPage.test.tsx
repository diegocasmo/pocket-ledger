import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/setup'
import { AppLayout } from '@/components/layout/AppLayout'
import { ExpenseFormProvider } from '@/contexts/ExpenseFormContext'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { createCategory } from '@/db/categoriesRepo'

function renderCalendarPage() {
  return renderWithRouter(
    <ExpenseFormProvider>
      <AppLayout>
        <CalendarPage />
      </AppLayout>
    </ExpenseFormProvider>,
    { route: '/calendar' }
  )
}

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    // A 31st is load-bearing: stepping back a month must land on Jun 30, so
    // month arithmetic that doesn't clamp gives Jul 1 and fails the assertion
    vi.setSystemTime(new Date(2025, 6, 31, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders the current month', async () => {
      renderCalendarPage()

      await waitFor(() => {
        expect(screen.getByText('July 2025')).toBeInTheDocument()
      })
    })

    it('displays month navigation buttons', async () => {
      renderCalendarPage()

      await waitFor(() => {
        // Previous month button should always be visible
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument()
        // Next month button is hidden when viewing the current month (blocks future navigation)
        expect(screen.queryByLabelText('Next month')).not.toBeInTheDocument()
      })
    })
  })

  describe('month navigation', () => {
    it('navigates to previous month', async () => {
      const user = userEvent.setup()
      renderCalendarPage()

      const prevButton = await screen.findByLabelText('Previous month')
      await user.click(prevButton)

      await waitFor(() => {
        expect(screen.getByText('June 2025')).toBeInTheDocument()
      })
    })
  })

  describe('add expense button', () => {
    it('has add expense button', async () => {
      await createCategory({ name: 'Food', color: '#22c55e' })
      renderCalendarPage()

      await waitFor(() => {
        expect(screen.getByLabelText('Add expense')).toBeInTheDocument()
      })
    })
  })
})
