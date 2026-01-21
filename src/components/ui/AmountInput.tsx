import { forwardRef } from 'react'
import CurrencyInput from 'react-currency-input-field'

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
      placeholder = '0.00',
      disabled = false,
      autoFocus = false,
    },
    ref
  ) => {
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
          <CurrencyInput
            ref={ref}
            id={inputId}
            value={value}
            onValueChange={(newValue) => {
              onChange(newValue ?? '')
            }}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            decimalsLimit={2}
            allowNegativeValue={false}
            decimalSeparator="."
            groupSeparator=""
            transformRawValue={(rawValue) => {
              // Normalize locale-specific decimal separators to period
              // Covers: comma (U+002C), Arabic comma (U+060C), Arabic decimal separator (U+066B), Fullwidth comma (U+FF0C)
              const normalized = rawValue.replace(/[\u002C\u060C\u066B\uFF0C]/g, '.')
              // Filter out non-numeric characters (keep only digits and decimal point)
              return normalized.replace(/[^0-9.]/g, '')
            }}
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
