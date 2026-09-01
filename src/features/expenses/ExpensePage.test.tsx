import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import { renderWithRouter } from '@/test/setup'
import { db } from '@/db'
import { ExpenseFormProvider } from '@/contexts/ExpenseFormContext'
import { AppLayout } from '@/components/layout/AppLayout'
import CalendarPage from '@/features/calendar/CalendarPage'
import ExpensePage from '@/features/expenses/ExpensePage'

const DRAFT_KEY = 'expense-form-draft'

function renderForm(route: string, queryClient?: QueryClient) {
  return renderWithRouter(
    <ExpenseFormProvider>
      <Routes>
        <Route path="/expenses/new" element={<ExpensePage />} />
        <Route path="/expenses/:id" element={<ExpensePage />} />
        <Route path="/calendar" element={<div>Calendar</div>} />
      </Routes>
    </ExpenseFormProvider>,
    { route, queryClient }
  )
}

function renderRealFlow() {
  return renderWithRouter(
    <ExpenseFormProvider>
      <AppLayout>
        <Routes>
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/expenses/new" element={<ExpensePage />} />
        </Routes>
      </AppLayout>
    </ExpenseFormProvider>,
    { route: '/calendar' }
  )
}

// Today = Wed 2025-06-25. June 20 -> "Last Friday"; June 10/5 -> "Jun N".
describe('ExpensePage date prefill (URL-derived)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 25))
  })
  afterEach(() => vi.useRealTimers())

  it('derives the date from the ?date= param', () => {
    renderForm('/expenses/new?date=2025-06-20')
    expect(screen.getByTestId('date-trigger')).toHaveTextContent('Last Friday')
  })

  it('tapping "+" starts a clean form on the selected date, ignoring a stale draft', () => {
    // A prior add-expense abandoned via the bottom nav left this draft behind.
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ amount: '99.00', categoryId: 'x', note: 'stale' })
    )
    renderRealFlow()
    fireEvent.click(screen.getByLabelText('June 20, 2025')) // select a calendar day
    fireEvent.click(screen.getByLabelText('Add expense')) // tap the FAB
    expect(screen.getByTestId('date-trigger')).toHaveTextContent('Last Friday')
    // Clean form (autofocused empty shows $0.00), not the stale $99.00.
    expect(screen.getByLabelText('Amount')).toHaveValue('$0.00')
  })

  it('updates the date in the URL when a day is picked (no revert)', () => {
    renderForm('/expenses/new?date=2025-06-20')
    const trigger = screen.getByTestId('date-trigger')
    fireEvent.click(trigger)
    fireEvent.click(screen.getAllByLabelText('June 10, 2025')[0])
    expect(trigger).toHaveTextContent('Jun 10')
  })

  it('keeps typed input across re-renders (values prop does not reset)', () => {
    renderForm('/expenses/new?date=2025-06-20')
    const amount = screen.getByLabelText('Amount')
    fireEvent.focus(amount)
    fireEvent.change(amount, { target: { value: '50' } }) // -> 0.50
    // Force re-renders: open the picker and change the date via the URL.
    fireEvent.click(screen.getByTestId('date-trigger'))
    fireEvent.click(screen.getAllByLabelText('June 10, 2025')[0])
    expect(amount).toHaveValue('$0.50') // not reset to empty by the values prop
  })

  it('on category round-trip: date comes from the URL, fields from the draft', () => {
    // Mimics the return from the category picker: the URL carries ?date= and the
    // draft carries the in-progress fields (no expenseId = a create draft).
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ amount: '5.00', categoryId: 'c1', note: 'lunch' })
    )
    renderForm('/expenses/new?date=2025-06-05')
    expect(screen.getByTestId('date-trigger')).toHaveTextContent('Jun 5')
    expect(screen.getByLabelText('Amount')).toHaveValue('$5.00')
  })

  it('edit: date and fields come from the loaded expense (no param)', () => {
    // staleTime: Infinity so the seeded cache isn't refetched (the test DB is
    // empty), giving a synchronous render from the seeded expense.
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    })
    qc.setQueryData(['expenses', 'e1'], {
      id: 'e1',
      date: '2025-06-05',
      amountCents: 1234,
      categoryId: 'c1',
      note: 'lunch',
      createdAt: 1,
      updatedAt: 1,
    })
    renderForm('/expenses/e1', qc)
    expect(screen.getByTestId('date-trigger')).toHaveTextContent('Jun 5')
    expect(screen.getByLabelText('Amount')).toHaveValue('$12.34')
  })
})

describe('ExpensePage amount validation', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('blocks submit and reports a non-positive amount', async () => {
    renderForm('/expenses/new?date=2025-06-20')
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }))

    expect(await screen.findByText('Please enter a valid amount')).toBeInTheDocument()
    expect(await db.expenses.count()).toBe(0)
  })

  it('stores a submitted amount as integer cents', async () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ amount: '12.34', categoryId: 'default-1', note: '' })
    )
    renderForm('/expenses/new?date=2025-06-20')
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }))

    await screen.findByText('Calendar')
    const [expense] = await db.expenses.toArray()
    expect(expense.amountCents).toBe(1234)
  })
})

describe('ExpensePage category field', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('reports a missing category below the category trigger', async () => {
    renderForm('/expenses/new?date=2025-06-20')
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }))

    expect(await screen.findByText('Please select a category')).toBeInTheDocument()
  })
})

describe('ExpensePage leaving the form', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('discards the draft and returns to the calendar on back', async () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ amount: '5.00', categoryId: 'c1', note: 'lunch' })
    )
    renderForm('/expenses/new?date=2025-06-20')

    fireEvent.click(screen.getByLabelText('Go back'))

    await screen.findByText('Calendar')
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull()
  })
})
