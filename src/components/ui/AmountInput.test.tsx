import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AmountInput } from '@/components/ui/AmountInput'

describe('AmountInput', () => {
  describe('cents-based formatting', () => {
    it('displays $0.01 when typing "1"', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: '1' } })

      expect(onChange).toHaveBeenCalledWith('0.01')
    })

    it('displays $0.12 when typing "12"', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12' } })

      expect(onChange).toHaveBeenCalledWith('0.12')
    })

    it('displays $1.23 when typing "123"', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '123' } })

      expect(onChange).toHaveBeenCalledWith('1.23')
    })

    it('displays $12.34 when typing "1234"', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '1234' } })

      expect(onChange).toHaveBeenCalledWith('12.34')
    })

    it('displays $123.45 when typing "12345"', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12345' } })

      expect(onChange).toHaveBeenCalledWith('123.45')
    })

    it('displays $1,234.56 when typing "123456"', () => {
      const onChange = vi.fn()
      render(<AmountInput value="1234.56" onChange={onChange} />)

      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)

      expect(input.value).toBe('$1,234.56')
    })
  })

  describe('thousand separators', () => {
    it('displays thousand separators for large amounts', () => {
      render(<AmountInput value="1234.56" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)
      expect(input.value).toBe('$1,234.56')
    })

    it('displays thousand separators for amounts over 10000', () => {
      render(<AmountInput value="12345.67" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)
      expect(input.value).toBe('$12,345.67')
    })

    it('displays thousand separators for amounts up to max value', () => {
      render(<AmountInput value="999999.99" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)
      expect(input.value).toBe('$999,999.99')
    })
  })

  describe('focus behavior', () => {
    it('shows $0.00 on focus when empty', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)

      expect(onChange).toHaveBeenCalledWith('0.00')
    })

    it('shows $0.00 on focus when value is "0"', () => {
      const onChange = vi.fn()
      render(<AmountInput value="0" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.focus(input)

      expect(onChange).toHaveBeenCalledWith('0.00')
    })

    it('shows $0.00 on focus when value is "0.00"', () => {
      const onChange = vi.fn()
      render(<AmountInput value="0.00" onChange={onChange} />)

      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)

      expect(input.value).toBe('$0.00')
    })

    it('shows empty when not focused and value is zero', () => {
      render(<AmountInput value="0.00" onChange={vi.fn()} />)

      const input = screen.getByLabelText('Amount') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('shows formatted value when not focused and value is non-zero', () => {
      render(<AmountInput value="12.34" onChange={vi.fn()} />)

      const input = screen.getByLabelText('Amount') as HTMLInputElement
      expect(input.value).toBe('$12.34')
    })
  })

  describe('max value enforcement', () => {
    it('caps value at $999,999.99', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      // Try to enter a value exceeding max (100000000 cents = $1,000,000.00)
      fireEvent.change(input, { target: { value: '100000000' } })

      expect(onChange).toHaveBeenCalledWith('999999.99')
    })

    it('allows exactly max value', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '99999999' } })

      expect(onChange).toHaveBeenCalledWith('999999.99')
    })
  })

  describe('backspace behavior', () => {
    it('removes last digit and reformats on backspace', () => {
      const onChange = vi.fn()
      render(<AmountInput value="12.34" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      // Simulating backspace by removing last digit
      fireEvent.change(input, { target: { value: '$12.3' } })

      // Only digits extracted: "123" = $1.23
      expect(onChange).toHaveBeenCalledWith('1.23')
    })

    it('handles backspace to zero', () => {
      const onChange = vi.fn()
      render(<AmountInput value="0.01" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '' } })

      expect(onChange).toHaveBeenCalledWith('0.00')
    })
  })

  describe('input sanitization', () => {
    it('filters non-numeric characters', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: 'abc123def' } })

      expect(onChange).toHaveBeenCalledWith('1.23')
    })

    it('filters special characters', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '12$34%56' } })

      expect(onChange).toHaveBeenCalledWith('1234.56')
    })

    it('extracts only digits from formatted input', () => {
      const onChange = vi.fn()
      render(<AmountInput value="" onChange={onChange} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.change(input, { target: { value: '$1,234.56' } })

      expect(onChange).toHaveBeenCalledWith('1234.56')
    })
  })

  describe('display', () => {
    it('includes dollar sign in formatted display', () => {
      render(<AmountInput value="10.00" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)
      expect(input.value).toBe('$10.00')
    })

    it('displays custom label', () => {
      render(<AmountInput value="" onChange={vi.fn()} label="Custom Label" />)
      expect(screen.getByLabelText('Custom Label')).toBeInTheDocument()
    })

    it('displays placeholder when empty and not focused', () => {
      render(<AmountInput value="" onChange={vi.fn()} placeholder="$0.00" />)
      expect(screen.getByPlaceholderText('$0.00')).toBeInTheDocument()
    })

    it('displays error message', () => {
      render(<AmountInput value="" onChange={vi.fn()} error="Invalid amount" />)
      expect(screen.getByText('Invalid amount')).toBeInTheDocument()
    })
  })

  describe('mobile experience', () => {
    it('has inputMode="numeric" for mobile numeric keyboard', () => {
      render(<AmountInput value="" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount')
      expect(input).toHaveAttribute('inputMode', 'numeric')
    })
  })

  describe('accessibility', () => {
    it('has aria-invalid="false" when no error', () => {
      render(<AmountInput value="" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('has aria-invalid="true" when error is present', () => {
      render(<AmountInput value="" onChange={vi.fn()} error="Invalid amount" />)
      const input = screen.getByLabelText('Amount')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('has aria-describedby linked to description when no error', () => {
      render(<AmountInput value="" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount')
      expect(input).toHaveAttribute('aria-describedby', 'amount-description')
    })

    it('has aria-describedby linked to both error and description when error present', () => {
      render(<AmountInput value="" onChange={vi.fn()} error="Invalid amount" />)
      const input = screen.getByLabelText('Amount')
      expect(input).toHaveAttribute('aria-describedby', 'amount-error amount-description')
    })

    it('error message has role="alert"', () => {
      render(<AmountInput value="" onChange={vi.fn()} error="Invalid amount" />)
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Invalid amount')
    })

    it('has screen reader description for the input', () => {
      render(<AmountInput value="" onChange={vi.fn()} />)
      const description = document.getElementById('amount-description')
      expect(description).toHaveTextContent('Enter amount in US dollars')
      expect(description).toHaveClass('sr-only')
    })
  })

  describe('controlled value', () => {
    it('displays formatted value from props when focused', () => {
      render(<AmountInput value="25.00" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)
      expect(input.value).toBe('$25.00')
    })

    it('displays value with thousand separators from props when focused', () => {
      render(<AmountInput value="1025.00" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)
      expect(input.value).toBe('$1,025.00')
    })

    it('updates display when value prop changes', () => {
      const { rerender } = render(<AmountInput value="10.00" onChange={vi.fn()} />)
      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)
      expect(input.value).toBe('$10.00')

      rerender(<AmountInput value="20.00" onChange={vi.fn()} />)
      expect(input.value).toBe('$20.00')
    })
  })

  describe('blur behavior', () => {
    it('calls onBlur callback when blurred', () => {
      const onBlur = vi.fn()
      render(<AmountInput value="10.00" onChange={vi.fn()} onBlur={onBlur} />)

      const input = screen.getByLabelText('Amount')
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(onBlur).toHaveBeenCalled()
    })

    it('hides value when blurred with zero amount', () => {
      render(<AmountInput value="0.00" onChange={vi.fn()} />)

      const input = screen.getByLabelText('Amount') as HTMLInputElement
      fireEvent.focus(input)
      expect(input.value).toBe('$0.00')

      fireEvent.blur(input)
      expect(input.value).toBe('')
    })
  })
})
