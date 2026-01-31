import { forwardRef, useState, useMemo } from 'react'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
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
      onBlur,
      error,
      label = 'Amount',
      placeholder = '$0.00',
      disabled = false,
      autoFocus = false,
    },
    ref
  ) => {
    const inputId = label.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`
    const descriptionId = `${inputId}-description`

    const [isFocused, setIsFocused] = useState(false)

    // Convert value prop (USD string like "12.34") to cents for internal use
    const centsValue = useMemo(() => {
      if (!value) return 0
      const parsed = parseFloat(value)
      if (isNaN(parsed)) return 0
      return Math.round(parsed * 100)
    }, [value])

    // Format cents for display (with $ and commas)
    const displayValue = useMemo(() => {
      if (!isFocused && centsValue === 0) return ''
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(centsValue / 100)
    }, [centsValue, isFocused])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Extract only digits from input
      const digits = e.target.value.replace(/\D/g, '')

      // Parse as cents (max 99999999 = $999,999.99)
      let cents = digits === '' ? 0 : parseInt(digits, 10)
      cents = Math.min(cents, 99999999)

      // Pass USD string to parent (e.g., "12.34" or "0.00")
      onChange((cents / 100).toFixed(2))
    }

    const handleFocus = () => {
      setIsFocused(true)
      // If empty or zero, initialize to $0.00
      if (!value || value === '0' || value === '0.00') {
        onChange('0.00')
      }
    }

    const handleBlur = () => {
      setIsFocused(false)
      onBlur?.()
    }

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            aria-invalid={!!error}
            aria-describedby={error ? `${errorId} ${descriptionId}` : descriptionId}
            className={`
              w-full px-3 py-3 min-h-[44px] rounded-lg border
              bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-secondary)]
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-[var(--color-border)]'}
            `}
          />
          <span id={descriptionId} className="sr-only">
            Enter amount in US dollars
          </span>
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AmountInput.displayName = 'AmountInput'
