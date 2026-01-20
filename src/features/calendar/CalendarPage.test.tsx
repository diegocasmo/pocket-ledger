import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/setup'
import { AppLayout } from '@/components/layout/AppLayout'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { createCategory } from '@/db/categoriesRepo'
import { format } from 'date-fns'

function renderCalendarPage() {
  return renderWithRouter(
    <AppLayout>
      <CalendarPage />
    </AppLayout>,
    { route: '/calendar' }
  )
}

describe('CalendarPage', () => {
  describe('rendering', () => {
    it('renders the current month', async () => {
      renderCalendarPage()

      await waitFor(() => {
        expect(screen.getByText(format(new Date(), 'MMMM yyyy'))).toBeInTheDocument()
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

      const prevMonth = new Date()
      prevMonth.setMonth(prevMonth.getMonth() - 1)

      await waitFor(() => {
        expect(screen.getByText(format(prevMonth, 'MMMM yyyy'))).toBeInTheDocument()
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
