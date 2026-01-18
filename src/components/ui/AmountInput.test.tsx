import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AmountInput } from './AmountInput'

describe('AmountInput', () => {
  describe('input sanitization', () => {
    it('filters non-numeric characters', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: 'abc123def' } })

      expect(onChange).toHaveBeenCalledWith('123')
    })

    it('filters special characters', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12$34%56' } })

      expect(onChange).toHaveBeenCalledWith('123456')
    })

    it('allows only numbers and decimal point', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12.34' } })

      expect(onChange).toHaveBeenCalledWith('12.34')
    })
  })

  describe('decimal handling', () => {
    it('prevents multiple decimal points', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12.34.56' } })

      // Should join extra decimal parts without separator
      expect(onChange).toHaveBeenCalledWith('12.3456')
    })

    it('limits to 2 decimal places', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12.345' } })

      expect(onChange).toHaveBeenCalledWith('12.34')
    })

    it('allows input starting with decimal (.50)', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '.50' } })

      expect(onChange).toHaveBeenCalledWith('.50')
    })

    it('allows exactly 2 decimal places', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '99.99' } })

      expect(onChange).toHaveBeenCalledWith('99.99')
    })
  })

  describe('empty input', () => {
    it('allows empty input', () => {
      const onChange = vi.fn()
      render(<AmountInput value="123" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '' } })

      expect(onChange).toHaveBeenCalledWith('')
    })
  })

  describe('display', () => {
    it('displays dollar sign prefix', () => {
      render(<AmountInput value="10.00" onChange={vi.fn()} />)
      expect(screen.getByText('$')).toBeInTheDocument()
    })

    it('displays custom label', () => {
      render(<AmountInput value="" onChange={vi.fn()} label="Custom Label" />)
      expect(screen.getByLabelText('Custom Label')).toBeInTheDocument()
    })

    it('displays placeholder', () => {
      render(<AmountInput value="" onChange={vi.fn()} placeholder="Enter amount" />)
      expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument()
    })

    it('displays error message', () => {
      render(<AmountInput value="" onChange={vi.fn()} error="Invalid amount" />)
      expect(screen.getByText('Invalid amount')).toBeInTheDocument()
    })
  })

  describe('controlled value', () => {
    it('displays value from props', () => {
      render(<AmountInput value="25.00" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      expect(input.value).toBe('25.00')
    })

    it('updates display when value prop changes', () => {
      const { rerender } = render(<AmountInput value="10.00" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      expect(input.value).toBe('10.00')

      rerender(<AmountInput value="20.00" onChange={vi.fn()} />)
      expect(input.value).toBe('20.00')
    })
  })
})
