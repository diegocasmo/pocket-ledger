import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateRangePicker } from '@/components/ui/DateRangePicker'

describe('DateRangePicker', () => {
  const defaultProps = {
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    onRangeChange: vi.fn(),
  }

  describe('next button visibility', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 0, 15)) // January 15, 2024
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('hides next button when viewing current month', () => {
      render(<DateRangePicker {...defaultProps} />)

      const nextButton = screen.queryByRole('button', { name: 'Next month' })
      expect(nextButton).not.toBeInTheDocument()
    })

    it('shows next button when viewing past month', () => {
      // Start date in December 2023 will set initial view to December 2023
      render(
        <DateRangePicker
          {...defaultProps}
          startDate="2023-12-01"
          endDate="2023-12-15"
        />
      )

      const nextButton = screen.getByRole('button', { name: 'Next month' })
      expect(nextButton).toBeInTheDocument()
    })

    it('maintains layout spacing with placeholder when next button is hidden', () => {
      const { container } = render(<DateRangePicker {...defaultProps} />)

      const placeholder = container.querySelector('div.w-8.h-8[aria-hidden="true"]')
      expect(placeholder).toBeInTheDocument()
    })

    it('hides next button after navigating to current month', () => {
      render(
        <DateRangePicker
          {...defaultProps}
          startDate="2023-12-01"
          endDate="2023-12-15"
        />
      )

      // Initially viewing December 2023, next button should be visible
      let nextButton = screen.getByRole('button', { name: 'Next month' })
      expect(nextButton).toBeInTheDocument()

      // Navigate to January 2024 (current month)
      fireEvent.click(nextButton)

      // Next button should now be hidden
      nextButton = screen.queryByRole('button', { name: 'Next month' }) as HTMLButtonElement
      expect(nextButton).not.toBeInTheDocument()
    })
  })

  describe('previous button', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 0, 15))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('always renders previous button', () => {
      render(<DateRangePicker {...defaultProps} />)

      const prevButton = screen.getByRole('button', { name: 'Previous month' })
      expect(prevButton).toBeInTheDocument()
    })

    it('shows next button after navigating to previous month', () => {
      render(<DateRangePicker {...defaultProps} />)

      // Initially viewing January 2024 (current month), next button should be hidden
      expect(screen.queryByRole('button', { name: 'Next month' })).not.toBeInTheDocument()

      // Navigate to December 2023
      const prevButton = screen.getByRole('button', { name: 'Previous month' })
      fireEvent.click(prevButton)

      // Next button should now be visible
      expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument()
    })
  })
})
