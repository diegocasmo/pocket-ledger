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
    it('prevents multiple decimal points and limits to 2 decimal places', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12.34.56' } })

      // Joins extra decimal parts (12.3456) then limits to 2 decimal places (12.34)
      expect(onChange).toHaveBeenCalledWith('12.34')
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

    it('normalizes comma to decimal point', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12,50' } })

      expect(onChange).toHaveBeenCalledWith('12.50')
    })

    it('handles multiple commas by normalizing to single decimal point', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12,34,56' } })

      // Normalizes commas to dots, then handles multiple decimals
      expect(onChange).toHaveBeenCalledWith('12.34')
    })

    it('handles mixed commas and dots', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12.34,56' } })

      expect(onChange).toHaveBeenCalledWith('12.34')
    })

    it('normalizes Arabic comma (U+060C) to decimal point', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12\u060C50' } })

      expect(onChange).toHaveBeenCalledWith('12.50')
    })

    it('normalizes Arabic decimal separator (U+066B) to decimal point', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12\u066B50' } })

      expect(onChange).toHaveBeenCalledWith('12.50')
    })

    it('normalizes fullwidth comma (U+FF0C) to decimal point', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12\uFF0C50' } })

      expect(onChange).toHaveBeenCalledWith('12.50')
    })

    it('handles mixed Unicode decimal separators (first separator wins)', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      // Mix of ASCII comma, Arabic comma, and fullwidth comma
      fireEvent.change(input, { target: { value: '12,34\u060C56' } })

      expect(onChange).toHaveBeenCalledWith('12.34')
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
