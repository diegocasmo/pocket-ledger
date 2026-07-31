import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/setup'
import { AppLayout } from '@/components/layout/AppLayout'
import { ExpenseFormProvider } from '@/contexts/ExpenseFormContext'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { createCategory } from '@/db/categoriesRepo'

// July 31 is a month-end the previous month doesn't have, which is the case
// naive `setMonth(-1)` arithmetic gets wrong. Pinning it keeps that path
// covered on every run instead of 7 days a year.
const FIXED_NOW = new Date(2025, 6, 31, 12, 0, 0)

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
    // shouldAdvanceTime keeps userEvent and waitFor progressing under fake timers
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(FIXED_NOW)
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
