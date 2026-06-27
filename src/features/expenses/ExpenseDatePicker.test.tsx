import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithClient } from '@/test/setup'
import { ExpenseDatePicker } from '@/features/expenses/ExpenseDatePicker'

// The Dialog renders its children in both a mobile and a desktop container,
// so calendar elements appear twice in jsdom — query with getAllBy* and act
// on the first instance.

describe('ExpenseDatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 25)) // Wednesday, June 25, 2025
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens to the month of the selected date', () => {
    renderWithClient(
      <ExpenseDatePicker
        isOpen
        onClose={vi.fn()}
        selectedDate="2025-06-24"
        onSelect={vi.fn()}
      />
    )

    expect(screen.getAllByText('June 2025').length).toBeGreaterThan(0)
  })

  it('calls onSelect with the ISO date and closes when a day is tapped', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    renderWithClient(
      <ExpenseDatePicker
        isOpen
        onClose={onClose}
        selectedDate="2025-06-24"
        onSelect={onSelect}
      />
    )

    fireEvent.click(screen.getAllByLabelText('June 20, 2025')[0])

    expect(onSelect).toHaveBeenCalledWith('2025-06-20')
    expect(onClose).toHaveBeenCalled()
  })

  it('disables future days so they cannot be selected', () => {
    const onSelect = vi.fn()

    renderWithClient(
      <ExpenseDatePicker
        isOpen
        onClose={vi.fn()}
        selectedDate="2025-06-24"
        onSelect={onSelect}
      />
    )

    const futureDay = screen.getAllByLabelText('June 26, 2025')[0]
    expect(futureDay).toBeDisabled()

    fireEvent.click(futureDay)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does not render calendar content when closed', () => {
    renderWithClient(
      <ExpenseDatePicker
        isOpen={false}
        onClose={vi.fn()}
        selectedDate="2025-06-24"
        onSelect={vi.fn()}
      />
    )

    expect(screen.queryByText('June 2025')).not.toBeInTheDocument()
  })
})
