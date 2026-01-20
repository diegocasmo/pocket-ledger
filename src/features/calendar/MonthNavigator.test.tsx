import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MonthNavigator } from '@/features/calendar/MonthNavigator'

describe('MonthNavigator', () => {
  const defaultProps = {
    monthLabel: 'January 2024',
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
  }

  describe('next button visibility', () => {
    it('renders next button when not on current month', () => {
      render(<MonthNavigator {...defaultProps} isCurrentMonth={false} />)

      const nextButton = screen.getByRole('button', { name: 'Next month' })
      expect(nextButton).toBeInTheDocument()
    })

    it('hides next button when on current month', () => {
      render(<MonthNavigator {...defaultProps} isCurrentMonth={true} />)

      const nextButton = screen.queryByRole('button', { name: 'Next month' })
      expect(nextButton).not.toBeInTheDocument()
    })

    it('maintains layout spacing with placeholder when next button is hidden', () => {
      const { container } = render(<MonthNavigator {...defaultProps} isCurrentMonth={true} />)

      const placeholder = container.querySelector('div.w-8.h-8[aria-hidden="true"]')
      expect(placeholder).toBeInTheDocument()
    })
  })

  describe('previous button', () => {
    it('always renders previous button', () => {
      render(<MonthNavigator {...defaultProps} isCurrentMonth={true} />)

      const prevButton = screen.getByRole('button', { name: 'Previous month' })
      expect(prevButton).toBeInTheDocument()
    })
  })

  describe('today button', () => {
    it('shows today button when not on current month', () => {
      render(<MonthNavigator {...defaultProps} isCurrentMonth={false} />)

      const todayButton = screen.getByRole('button', { name: 'Go to today' })
      expect(todayButton).toBeInTheDocument()
    })

    it('hides today button when on current month', () => {
      render(<MonthNavigator {...defaultProps} isCurrentMonth={true} />)

      const todayButton = screen.queryByRole('button', { name: 'Go to today' })
      expect(todayButton).not.toBeInTheDocument()
    })
  })
})
