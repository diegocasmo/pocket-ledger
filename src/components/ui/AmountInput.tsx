import { forwardRef, useState, useEffect, useCallback } from 'react'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      value,
      onChange,
      error,
      label = 'Amount',
      placeholder = '0.00',
      disabled = false,
      autoFocus = false,
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(value)

    useEffect(() => {
      setDisplayValue(value)
    }, [value])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value

        // Allow empty input
        if (input === '') {
          setDisplayValue('')
          onChange('')
          return
        }

        // Allow only numbers, dots, and commas (normalize commas to dots)
        const sanitized = input.replace(/[^0-9.,]/g, '').replace(/,/g, '.')

        // Prevent multiple decimal points
        const parts = sanitized.split('.')
        let formatted: string
        if (parts.length > 2) {
          formatted = parts[0] + '.' + parts.slice(1).join('')
        } else {
          formatted = sanitized
        }

        // Limit to 2 decimal places
        const decimalIndex = formatted.indexOf('.')
        if (decimalIndex !== -1 && formatted.length - decimalIndex > 3) {
          formatted = formatted.substring(0, decimalIndex + 3)
        }

        setDisplayValue(formatted)
        onChange(formatted)
      },
      [onChange]
    )

    const inputId = label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
        >
          {label}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
            $
          </span>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={`
              w-full pl-7 pr-3 py-2 rounded-lg border
              bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-secondary)]
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-[var(--color-border)]'}
            `}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

AmountInput.displayName = 'AmountInput'
