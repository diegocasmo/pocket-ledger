import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PeriodNavigator } from '@/components/ui/PeriodNavigator'

describe('PeriodNavigator', () => {
  const defaultProps = {
    label: 'January 2024',
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
  }

  describe('label', () => {
    it('renders the period label', () => {
      render(<PeriodNavigator {...defaultProps} isCurrentPeriod={false} />)

      expect(screen.getByText('January 2024')).toBeInTheDocument()
    })
  })

  describe('next button visibility', () => {
    it('renders next button when not on current period', () => {
      render(<PeriodNavigator {...defaultProps} isCurrentPeriod={false} />)

      const nextButton = screen.getByRole('button', { name: 'Next period' })
      expect(nextButton).toBeInTheDocument()
    })

    it('hides next button when on current period', () => {
      render(<PeriodNavigator {...defaultProps} isCurrentPeriod={true} />)

      const nextButton = screen.queryByRole('button', { name: 'Next period' })
      expect(nextButton).not.toBeInTheDocument()
    })

    it('maintains layout spacing with placeholder when next button is hidden', () => {
      const { container } = render(<PeriodNavigator {...defaultProps} isCurrentPeriod={true} />)

      const placeholder = container.querySelector('div.w-8.h-8[aria-hidden="true"]')
      expect(placeholder).toBeInTheDocument()
    })
  })

  describe('previous button', () => {
    it('always renders previous button', () => {
      render(<PeriodNavigator {...defaultProps} isCurrentPeriod={true} />)

      const prevButton = screen.getByRole('button', { name: 'Previous period' })
      expect(prevButton).toBeInTheDocument()
    })
  })

  describe('today button', () => {
    it('shows today button when not on current period', () => {
      render(<PeriodNavigator {...defaultProps} isCurrentPeriod={false} />)

      const todayButton = screen.getByRole('button', { name: 'Go to today' })
      expect(todayButton).toBeInTheDocument()
    })

    it('hides today button when on current period', () => {
      render(<PeriodNavigator {...defaultProps} isCurrentPeriod={true} />)

      const todayButton = screen.queryByRole('button', { name: 'Go to today' })
      expect(todayButton).not.toBeInTheDocument()
    })
  })

  describe('custom periodName', () => {
    it('uses custom periodName in aria labels', () => {
      render(<PeriodNavigator {...defaultProps} isCurrentPeriod={false} periodName="month" />)

      expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument()
    })
  })
})
